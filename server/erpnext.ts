import axios, { AxiosInstance } from "axios";

export interface ERPNextUser {
  name: string;
  email: string;
  full_name: string;
  user_type: string;
  enabled: number;
}

export interface ERPNextVerifyResult {
  success: boolean;
  user?: ERPNextUser;
  error?: string;
}

export interface ERPNextDataResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * ERPNext API Client
 * Handles secure token-based authentication and API calls to self-hosted ERPNext instances
 */
export class ERPNextClient {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(baseURL: string, apiKey: string, apiSecret: string) {
    this.baseURL = this.normalizeURL(baseURL);
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    // Create axios instance with token-based authentication
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `token ${apiKey}:${apiSecret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });
  }

  /**
   * Normalize ERPNext URL to ensure proper format
   */
  private normalizeURL(url: string): string {
    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    // Remove trailing slash
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  /**
   * Verify authentication by fetching current logged-in user
   */
  async verifyAuth(): Promise<ERPNextVerifyResult> {
    try {
      const response = await this.client.get("/api/method/frappe.auth.get_logged_user");
      
      if (response.data?.message) {
        return {
          success: true,
          user: {
            name: response.data.message,
            email: response.data.message,
            full_name: response.data.message,
            user_type: "System User",
            enabled: 1,
          },
        };
      }

      return {
        success: false,
        error: "Failed to retrieve user information",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      return {
        success: false,
        error: `Authentication error: ${message}`,
      };
    }
  }

  /**
   * Verify if a specific user exists in ERPNext
   */
  async verifyUser(userId: string): Promise<ERPNextVerifyResult> {
    try {
      const response = await this.client.get(`/api/resource/User/${userId}`);

      if (response.data?.data) {
        const userData = response.data.data;
        return {
          success: true,
          user: {
            name: userData.name,
            email: userData.email,
            full_name: userData.full_name || userData.name,
            user_type: userData.user_type || "System User",
            enabled: userData.enabled ? 1 : 0,
          },
        };
      }

      return {
        success: false,
        error: "User not found",
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: false,
          error: `User "${userId}" not found in ERPNext`,
        };
      }
      const message = error instanceof Error ? error.message : "User verification failed";
      return {
        success: false,
        error: `User verification error: ${message}`,
      };
    }
  }

  /**
   * Retrieve user-specific data from ERPNext
   * Supports filtering by doctype and user-related fields
   */
  async getUserData(
    doctype: string,
    userId: string,
    filters?: Record<string, unknown>
  ): Promise<ERPNextDataResult> {
    try {
      // Build filter array for API
      const filterArray: unknown[] = [];

      // Add user-related filters based on doctype
      if (doctype === "User") {
        filterArray.push(["User", "name", "=", userId]);
      } else if (doctype === "Employee") {
        filterArray.push(["Employee", "user", "=", userId]);
      } else if (doctype === "Customer") {
        filterArray.push(["Customer", "customer_name", "=", userId]);
      }

      // Add custom filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          filterArray.push([doctype, key, "=", value]);
        });
      }

      const params: Record<string, unknown> = {
        fields: JSON.stringify(["*"]),
      };

      if (filterArray.length > 0) {
        params.filters = JSON.stringify(filterArray);
      }

      const response = await this.client.get(`/api/resource/${doctype}`, { params });

      if (response.data?.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: "No data found",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Data retrieval failed";
      return {
        success: false,
        error: `Data retrieval error: ${message}`,
      };
    }
  }

  /**
   * Get list of available doctypes from ERPNext
   */
  async getAvailableDoctypes(): Promise<string[]> {
    const commonDoctypes = [
      "User",
      "Employee",
      "Customer",
      "Supplier",
      "Sales Order",
      "Purchase Order",
      "Invoice",
      "Quotation",
    ];

    try {
      const response = await this.client.get("/api/resource/DocType", {
        params: {
          fields: JSON.stringify(["name"]),
          limit_page_length: 500,
        },
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        const availableDoctypes = response.data.data
          .map((item: { name: string }) => item.name)
          .filter((name: string) => commonDoctypes.includes(name));

        return availableDoctypes.length > 0 ? availableDoctypes : commonDoctypes;
      }

      return commonDoctypes;
    } catch {
      return commonDoctypes;
    }
  }
}

/**
 * Create ERPNext client instance
 */
export function createERPNextClient(
  baseURL: string,
  apiKey: string,
  apiSecret: string
): ERPNextClient {
  return new ERPNextClient(baseURL, apiKey, apiSecret);
}
