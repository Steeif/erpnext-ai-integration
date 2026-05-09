import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getERPNextConnection,
  createERPNextConnection,
  updateERPNextConnectionTest,
  getCachedERPNextData,
  cacheERPNextData,
} from "./db";
import { createERPNextClient } from "./erpnext";
import {
  analyzeData,
  generateInsights,
  detectAnomalies,
  generateReport,
} from "./ai";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  erpnext: router({
    // Configure ERPNext connection
    configureConnection: protectedProcedure
      .input(
        z.object({
          erpnextUrl: z.string().url("Invalid ERPNext URL"),
          apiKey: z.string().min(1, "API Key is required"),
          apiSecret: z.string().min(1, "API Secret is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Verify connection before saving
          const client = createERPNextClient(
            input.erpnextUrl,
            input.apiKey,
            input.apiSecret
          );

          const verifyResult = await client.verifyAuth();
          if (!verifyResult.success) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: verifyResult.error || "Failed to verify ERPNext connection",
            });
          }

          // Save connection
          await createERPNextConnection(
            ctx.user.id,
            input.erpnextUrl,
            input.apiKey,
            input.apiSecret
          );

          return {
            success: true,
            message: "ERPNext connection configured successfully",
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to configure connection",
          });
        }
      }),

    // Get current connection
    getConnection: protectedProcedure.query(async ({ ctx }) => {
      try {
        const connection = await getERPNextConnection(ctx.user.id);
        if (!connection) {
          return { configured: false };
        }

        return {
          configured: true,
          erpnextUrl: connection.erpnextUrl,
          lastTestedAt: connection.lastTestedAt,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve connection",
        });
      }
    }),

    // Verify user ID in ERPNext
    verifyUserId: protectedProcedure
      .input(
        z.object({
          userId: z.string().min(1, "User ID is required"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const connection = await getERPNextConnection(ctx.user.id);
          if (!connection) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "ERPNext connection not configured",
            });
          }

          const client = createERPNextClient(
            connection.erpnextUrl,
            connection.apiKey,
            connection.apiSecret
          );

          const verifyResult = await client.verifyUser(input.userId);
          if (!verifyResult.success) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: verifyResult.error || "User not found",
            });
          }

          // Update last tested time
          await updateERPNextConnectionTest(connection.id);

          return {
            success: true,
            user: verifyResult.user,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify user",
          });
        }
      }),

    // Retrieve user data from ERPNext
    getUserData: protectedProcedure
      .input(
        z.object({
          userId: z.string().min(1, "User ID is required"),
          doctype: z.string().min(1, "DocType is required"),
        })
      )
      .query(async ({ ctx, input }) => {
        try {
          const connection = await getERPNextConnection(ctx.user.id);
          if (!connection) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "ERPNext connection not configured",
            });
          }

          // Check cache first
          const cached = await getCachedERPNextData(
            connection.id,
            input.userId,
            input.doctype
          );

          if (cached) {
            return {
              success: true,
              data: JSON.parse(cached.data),
              cached: true,
            };
          }

          // Fetch from ERPNext
          const client = createERPNextClient(
            connection.erpnextUrl,
            connection.apiKey,
            connection.apiSecret
          );

          const dataResult = await client.getUserData(input.doctype, input.userId);
          if (!dataResult.success) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: dataResult.error || "Failed to retrieve data",
            });
          }

          // Cache the result
          await cacheERPNextData(
            connection.id,
            ctx.user.id,
            input.userId,
            input.doctype,
            JSON.stringify(dataResult.data)
          );

          return {
            success: true,
            data: dataResult.data,
            cached: false,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve user data",
          });
        }
      }),

    // Get available doctypes
    getAvailableDoctypes: protectedProcedure.query(async ({ ctx }) => {
      try {
        const connection = await getERPNextConnection(ctx.user.id);
        if (!connection) {
          return [];
        }

        const client = createERPNextClient(
          connection.erpnextUrl,
          connection.apiKey,
          connection.apiSecret
        );

        return await client.getAvailableDoctypes();
      } catch {
        return [];
      }
    }),
  }),

  // AI Analysis Router
  ai: router({
    // Analyze ERPNext data
    analyzeData: protectedProcedure
      .input(
        z.object({
          doctype: z.string().min(1, "DocType is required"),
          data: z.unknown(),
          customPrompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await analyzeData(input.doctype, input.data, input.customPrompt);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to analyze data",
          });
        }
      }),

    // Generate insights and recommendations
    generateInsights: protectedProcedure
      .input(
        z.object({
          doctype: z.string().min(1, "DocType is required"),
          data: z.unknown(),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await generateInsights(input.doctype, input.data, input.context);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to generate insights",
          });
        }
      }),

    // Detect anomalies in data
    detectAnomalies: protectedProcedure
      .input(
        z.object({
          doctype: z.string().min(1, "DocType is required"),
          data: z.unknown(),
          thresholds: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await detectAnomalies(input.doctype, input.data, input.thresholds);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to detect anomalies",
          });
        }
      }),

    // Generate professional report
    generateReport: protectedProcedure
      .input(
        z.object({
          doctype: z.string().min(1, "DocType is required"),
          data: z.unknown(),
          reportType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await generateReport(input.doctype, input.data, input.reportType);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to generate report",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
