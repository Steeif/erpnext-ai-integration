import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const erpnextConnections = mysqlTable("erpnext_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  erpnextUrl: varchar("erpnextUrl", { length: 255 }).notNull(),
  apiKey: text("apiKey").notNull(), // Encrypted with AES-256-GCM
  apiSecret: text("apiSecret").notNull(), // Encrypted with AES-256-GCM
  isActive: int("isActive").default(1).notNull(),
  lastTestedAt: timestamp("lastTestedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ERPNextConnection = typeof erpnextConnections.$inferSelect;
export type InsertERPNextConnection = typeof erpnextConnections.$inferInsert;

export const erpnextDataCache = mysqlTable("erpnext_data_cache", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  verifiedUserId: varchar("verifiedUserId", { length: 255 }).notNull(), // ERPNext user ID
  doctype: varchar("doctype", { length: 128 }).notNull(), // e.g., "User", "Employee", "Customer"
  data: text("data").notNull(), // JSON data
  retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type ERPNextDataCache = typeof erpnextDataCache.$inferSelect;
export type InsertERPNextDataCache = typeof erpnextDataCache.$inferInsert;