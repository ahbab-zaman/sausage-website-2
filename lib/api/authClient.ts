import { API_CONFIG } from "./config";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  TokenResponse,
  User
} from "@/types/auth";

class AuthApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly credentials = "apiuser:2024?08X^sausage"; // Basic auth credentials

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Get valid access token (reuse if not expired, otherwise fetch new)
  private async getValidToken(): Promise<string | null> {
    const now = Date.now();

    // If token exists and hasn't expired, reuse it
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    // Otherwise, fetch a new token using Basic Auth
    try {
      const credentials = btoa(this.credentials); // Base64 encode

      const response = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
      );

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        this.accessToken = data.data.access_token;
        // Set expiry time (expires_in is in seconds, subtract 60s for safety margin)
        const expiresIn = data.data.expires_in || 3600;
        this.tokenExpiry = now + (expiresIn - 60) * 1000;
        return this.accessToken;
      }

      console.error("Token response:", data);
      return null;
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getValidToken();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers
        },
        mode: "cors",
        credentials: "omit"
      });

      const data = await response.json();

      // If token expired, clear it and retry once
      if (
        data.error &&
        typeof data.error === "string" &&
        data.error.toLowerCase().includes("token")
      ) {
        this.accessToken = null;
        this.tokenExpiry = null;
        const newToken = await this.getValidToken();

        if (newToken) {
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...options?.headers
            },
            mode: "cors",
            credentials: "omit"
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error("Auth API Request Error:", error);
      throw error;
    }
  }

  private async requestFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getValidToken();

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        mode: "cors",
        credentials: "omit"
      });

      const data = await response.json();

      // If token expired, clear it and retry once
      if (
        data.error &&
        typeof data.error === "string" &&
        data.error.toLowerCase().includes("token")
      ) {
        this.accessToken = null;
        this.tokenExpiry = null;
        const newToken = await this.getValidToken();

        if (newToken) {
          const retryResponse = await fetch(url, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${newToken}`
            },
            mode: "cors",
            credentials: "omit"
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error("Auth API Request Error:", error);
      throw error;
    }
  }

  // Generate/Get Access Token (kept for manual usage if needed)
  async getToken(): Promise<TokenResponse | null> {
    try {
      const credentials = btoa(this.credentials);

      const response = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
      );

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        return {
          access_token: data.data.access_token,
          token_type: data.data.token_type || "Bearer",
          expires_in: data.data.expires_in || 3600
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  // Login
  async login(credentials: LoginRequest): Promise<{ user: User | null; error: string | null }> {
    try {
      const formData = new FormData();
      formData.append("email", credentials.email);
      formData.append("password", credentials.password);

      const response = await this.requestFormData<LoginResponse>(
        "/index.php?route=rest/login/login",
        formData
      );

      if (response.success && response.data) {
        const user: User = {
          id: response.data.customer_id,
          email: response.data.email,
          firstName: response.data.firstname,
          lastName: response.data.lastname,
          telephone: response.data.telephone,
          token: response.data.token
        };
        return { user, error: null };
      }

      return {
        user: null,
        error: response.error || response.message || "Login failed"
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Login failed"
      };
    }
  }

  // Register
  async register(data: RegisterRequest): Promise<{
    success: boolean;
    error: string | null;
    data?: {
      customer_id: string;
      email: string;
      telephone?: string;
      otp?: string;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append("firstname", data.firstname);
      formData.append("lastname", data.lastname);
      formData.append("telephone", data.telephone);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("country_code", data.country_code);
      formData.append("dob", data.dob);

      if (data.id_proof_front) {
        formData.append("id_proof_front", data.id_proof_front);
      }

      const response = await this.requestFormData<RegisterResponse>(
        "/index.php?route=rest/register_mobile",
        formData
      );

      if (response.success) {
        return {
          success: true,
          error: null,
          data: response.data
        };
      }

      return {
        success: false,
        error: response.error || response.message || "Registration failed"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed"
      };
    }
  }

  // Verify OTP
  async verifyOTP(data: VerifyOTPRequest): Promise<{ success: boolean; error: string | null }> {
    try {
      const formData = new FormData();
      formData.append("customer_id", data.customer_id);
      formData.append("otp", data.otp);

      const response = await this.requestFormData<VerifyOTPResponse>(
        "/index.php?route=rest/register_mobile/verify_otp",
        formData
      );

      if (response.success && response.data?.verified) {
        return { success: true, error: null };
      }

      return {
        success: false,
        error: response.error || response.message || "OTP verification failed"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OTP verification failed"
      };
    }
  }
}

export const authApiClient = new AuthApiClient();
