import { API_CONFIG } from "./config";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  User,
  UpdateAccountRequest,
  TokenResponse
} from "@/types/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface BackendApiResponse<T> {
  success: number; // 1 = success, 0 = fail
  error: string[];
  data?: T;
}

class AuthApiClient {
  private baseUrl = API_CONFIG.BASE_URL;
  private credentials = "apiuser:2024?08X^sausage";
  private clientToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.clientToken = localStorage.getItem("client_token");
    }
  }

  /**
   * Save client token
   */
  private saveClientToken(token: string) {
    this.clientToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("client_token", token);
      console.log("✅ Token saved:", token.substring(0, 20) + "...");
    }
  }

  /**
   * Mark user as logged in
   */
  private setLoggedIn(isLoggedIn: boolean) {
    if (typeof window !== "undefined") {
      localStorage.setItem("is_logged_in", isLoggedIn ? "true" : "false");
    }
  }

  /**
   * Check if user is logged in
   */
  public isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("is_logged_in") === "true";
  }

  /**
   * Get or generate client token (ONE token for everything)
   */
  public async getClientToken(): Promise<string> {
    // Return existing token if we have it
    if (this.clientToken) {
      return this.clientToken;
    }

    try {
      const encoded = btoa(this.credentials);
      const res = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${encoded}` },
          credentials: "include"
        }
      );

      if (!res.ok) {
        throw new Error("Failed to get API token");
      }

      const json: BackendApiResponse<TokenResponse> = await res.json();

      if (json.success !== 1 || !json.data?.access_token) {
        throw new Error("Failed to get API token");
      }

      this.saveClientToken(json.data.access_token);
      return json.data.access_token;
    } catch (error) {
      console.error("❌ Token generation failed:", error);
      throw error;
    }
  }

  /**
   * Normalize backend response
   */
  private normalizeResponse<T>(backendRes: BackendApiResponse<T>): ApiResponse<T> {
    return {
      success: backendRes.success === 1,
      data: backendRes.data,
      error: backendRes.error?.length > 0 ? backendRes.error.join(", ") : undefined
    };
  }

  /**
   * Make authenticated request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return {
            success: false,
            error: "Unauthorized - Session expired"
          };
        }
        return {
          success: false,
          error: `HTTP error ${res.status}`
        };
      }

      const backendRes: BackendApiResponse<T> = await res.json();
      return this.normalizeResponse(backendRes);
    } catch (err: any) {
      console.error("Request error:", err);
      return {
        success: false,
        error: err.message || "Request failed"
      };
    }
  }

  /**
   * Make form data request
   */
  private async requestFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        return {
          success: false,
          error: `HTTP error ${res.status}`
        };
      }

      const backendRes: BackendApiResponse<T> = await res.json();
      return this.normalizeResponse(backendRes);
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Request failed"
      };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v) formData.append(k, v as any);
    });

    return this.requestFormData<RegisterResponse>(
      "/index.php?route=rest/register_mobile",
      formData
    );
  }

  /**
   * Verify OTP after registration
   */
  async verifyOTP(data: VerifyOTPRequest) {
    const formData = new FormData();
    formData.append("customer_id", data.customer_id);
    formData.append("otp", data.otp);

    return this.requestFormData<VerifyOTPResponse>(
      "/index.php?route=rest/register_mobile/verify_otp",
      formData
    );
  }

  /**
   * Login user (creates server-side session)
   * Token remains the same - only session changes
   */
  async login(credentials: LoginRequest) {
    const formData = new FormData();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const res = await this.requestFormData<LoginResponse>(
      "/index.php?route=rest/login/login",
      formData
    );

    if (res.success && res.data) {
      this.setLoggedIn(true);
      console.log("✅ Login successful - session created");
      console.log("📋 Customer ID:", res.data.customer_id);
    } else {
      this.setLoggedIn(false);
      console.error("❌ Login failed:", res.error);
    }

    return res;
  }

  /**
   * Get account information
   */
  async getAccountInfo() {
    return this.request<User>("/index.php?route=rest/account/account", { method: "GET" });
  }

  /**
   * Update account information
   */
  async updateAccount(data: UpdateAccountRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });

    return this.requestFormData<User>("/index.php?route=rest/account/account", formData);
  }

  /**
   * Logout user
   */
  async logout() {
    const res = await this.request("/index.php?route=rest/logout/logout", { method: "POST" });

    this.setLoggedIn(false);
    console.log("✅ Logout successful");

    return res;
  }

  async searchProducts(query: string, page = 1) {
    const res = await this.request<any>(
      `/index.php?route=feed/rest_api/search&search=${encodeURIComponent(query)}&page=${page}`,
      { method: "GET" }
    );

    // Log the response structure to help debug
    if (res.success) {
      console.log("Search response structure:", res.data);
    }

    return res;
  }

  /**
   * Refresh token if expired
   */
  async refreshToken(oldToken: string): Promise<string> {
    try {
      const encoded = btoa(this.credentials);
      const res = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encoded}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ old_token: oldToken }),
          credentials: "include"
        }
      );

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const json: BackendApiResponse<TokenResponse> = await res.json();

      if (json.success !== 1 || !json.data?.access_token) {
        throw new Error("Failed to refresh token");
      }

      this.saveClientToken(json.data.access_token);
      console.log("✅ Token refreshed successfully");
      return json.data.access_token;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      throw error;
    }
  }
}

export const authApiClient = new AuthApiClient();
