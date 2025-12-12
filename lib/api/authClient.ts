// import { API_CONFIG } from "./config";
// import {
//   LoginRequest,
//   User,
//   RegisterRequest,
//   VerifyOTPRequest,
//   UpdateAccountRequest,
//   ApiResponse,
//   BackendUser,
// } from "@/types/auth";

// // Helper to join error array into string
// function getErrorMessage<T>(response: ApiResponse<T>): string {
//   if (Array.isArray(response.error) && response.error.length > 0) {
//     return response.error.join(", ");
//   }
//   return response.message ?? "Unknown error";
// }

// export class AuthApiClient {
//   private baseUrl: string;
//   private accessToken: string | null = null;
//   private tokenExpiry: number | null = null;
//   private readonly credentials = "apiuser:2024?08X^sausage";

//   constructor() {
//     this.baseUrl = API_CONFIG.BASE_URL;
//   }

//   private async getValidToken(): Promise<string | null> {
//     const now = Date.now();
//     if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) return this.accessToken;

//     try {
//       const credentials = btoa(this.credentials);
//       const res = await fetch(
//         `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
//         { method: "POST", headers: { Authorization: `Basic ${credentials}` } }
//       );

//       const data = await res.json();
//       if (data.success && data.data?.access_token) {
//         this.accessToken = data.data.access_token;
//         const expiresIn = data.data.expires_in || 3600;
//         this.tokenExpiry = now + (expiresIn - 60) * 1000;
//         return this.accessToken;
//       }

//       console.error("Token fetch failed:", data);
//       return null;
//     } catch (err) {
//       console.error("Token error:", err);
//       return null;
//     }
//   }

//   private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
//     const url = `${this.baseUrl}${endpoint}`;
//     const token = await this.getValidToken();

//     try {
//       const res = await fetch(url, {
//         ...options,
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           ...options?.headers
//         },
//         mode: "cors",
//         credentials: "omit"
//       });
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       console.error("Request error:", err);
//       throw err;
//     }
//   }

//   private async requestFormData<T>(endpoint: string, formData: FormData): Promise<T> {
//     const url = `${this.baseUrl}${endpoint}`;
//     const token = await this.getValidToken();
//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         body: formData,
//         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         mode: "cors",
//         credentials: "omit"
//       });
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       console.error("FormData request error:", err);
//       throw err;
//     }
//   }

//   // ------------------- REGISTER -------------------
//   async register(
//     data: RegisterRequest
//   ): Promise<{
//     success: boolean;
//     error: string | null;
//     data?: { customer_id: string; otp?: string };
//   }> {
//     try {
//       const formData = new FormData();
//       Object.entries(data).forEach(([key, value]) => {
//         if (value) formData.append(key, value as any);
//       });
//       const response = await this.requestFormData<
//         ApiResponse<{ customer_id: string; otp?: string }>
//       >("/index.php?route=rest/register_mobile", formData);
//       return {
//         success: response.success === 1,
//         error: response.success === 1 ? null : getErrorMessage(response),
//         data: response.data
//       };
//     } catch (err) {
//       return { success: false, error: err instanceof Error ? err.message : "Registration failed" };
//     }
//   }

//   // ------------------- VERIFY OTP -------------------
//   async verifyOTP(data: VerifyOTPRequest): Promise<{ success: boolean; error: string | null }> {
//     try {
//       const formData = new FormData();
//       formData.append("customer_id", data.customer_id);
//       formData.append("otp", data.otp);
//       const response = await this.requestFormData<ApiResponse<{ verified: boolean }>>(
//         "/index.php?route=rest/register_mobile/verify_otp",
//         formData
//       );
//       return {
//         success: response.success === 1 && response.data?.verified === true,
//         error: response.success === 1 ? null : getErrorMessage(response)
//       };
//     } catch (err) {
//       return {
//         success: false,
//         error: err instanceof Error ? err.message : "OTP verification failed"
//       };
//     }
//   }

//   // ------------------- LOGIN -------------------
//   async login(credentials: LoginRequest): Promise<{ user: User | null; error: string | null }> {
//     try {
//       const formData = new FormData();
//       formData.append("email", credentials.email);
//       formData.append("password", credentials.password);

//       const response = await this.requestFormData<ApiResponse<BackendUser>>(
//         "/index.php?route=rest/login/login",
//         formData
//       );

//       if (response.success === 1 && response.data) {
//         const user: User = { ...response.data };
//         return { user, error: null };
//       }

//       return { user: null, error: getErrorMessage(response) };
//     } catch (err) {
//       return { user: null, error: err instanceof Error ? err.message : "Login failed" };
//     }
//   }

//   // ------------------- LOGOUT -------------------
//   async logout(): Promise<{ success: boolean; error: string | null }> {
//     try {
//       const response = await this.request<ApiResponse<any>>("/index.php?route=rest/logout/logout", {
//         method: "POST"
//       });
//       return {
//         success: response.success === 1,
//         error: response.success === 1 ? null : getErrorMessage(response)
//       };
//     } catch (err) {
//       return { success: false, error: err instanceof Error ? err.message : "Logout failed" };
//     }
//   }

//   // ------------------- GET ACCOUNT INFO -------------------
//   async getAccountInfo(): Promise<{ success: boolean; data?: User; error?: string | null }> {
//     try {
//       const response = await this.request<ApiResponse<BackendUser>>(
//         "/index.php?route=rest/account/account",
//         { method: "GET" }
//       );
//       if (response.success === 1 && response.data)
//         return { success: true, data: { ...response.data } };
//       return { success: false, error: getErrorMessage(response) };
//     } catch (err) {
//       return { success: false, error: err instanceof Error ? err.message : "Fetch account failed" };
//     }
//   }

//   // ------------------- UPDATE ACCOUNT -------------------
//   async updateAccount(
//     data: UpdateAccountRequest
//   ): Promise<{ success: boolean; error: string | null }> {
//     try {
//       const formData = new FormData();
//       Object.entries(data).forEach(([key, value]) => {
//         if (value) formData.append(key, value as any);
//       });
//       const response = await this.requestFormData<ApiResponse<BackendUser>>(
//         "/index.php?route=rest/account/account",
//         formData
//       );
//       return {
//         success: response.success === 1,
//         error: response.success === 1 ? null : getErrorMessage(response)
//       };
//     } catch (err) {
//       return {
//         success: false,
//         error: err instanceof Error ? err.message : "Update account failed"
//       };
//     }
//   }
// }

// export const authApiClient = new AuthApiClient();

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

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AuthApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly credentials = "apiuser:2024?08X^sausage";

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Get valid access token
  private async getValidToken(): Promise<string | null> {
    const now = Date.now();

    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = btoa(this.credentials);

      const response = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}` }
        }
      );

      const data: ApiResponse<TokenResponse> = await response.json();

      if (data.success && data.data?.access_token) {
        this.accessToken = data.data.access_token;
        const expiresIn = data.data.expires_in || 3600;
        this.tokenExpiry = now + (expiresIn - 60) * 1000;
        return this.accessToken;
      }

      console.error("Token response:", data);
      return null;
    } catch (error: unknown) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  // Generic JSON request
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
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

      const data: ApiResponse<T> = await response.json();

      if (data.error?.toLowerCase().includes("token")) {
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
    } catch (error: unknown) {
      console.error("Auth API Request Error:", error);
      throw error;
    }
  }

  // Generic FormData request
  private async requestFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getValidToken();

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        mode: "cors",
        credentials: "omit"
      });

      const data: ApiResponse<T> = await response.json();

      if (data.error?.toLowerCase().includes("token")) {
        this.accessToken = null;
        this.tokenExpiry = null;
        const newToken = await this.getValidToken();

        if (newToken) {
          const retryResponse = await fetch(url, {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${newToken}` },
            mode: "cors",
            credentials: "omit"
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error: unknown) {
      console.error("Auth API Request Error:", error);
      throw error;
    }
  }

  // Get token manually if needed
  async getToken(): Promise<TokenResponse | null> {
    try {
      const credentials = btoa(this.credentials);

      const response = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}` }
        }
      );

      const data: ApiResponse<TokenResponse> = await response.json();

      if (data.success && data.data?.access_token) return data.data;
      return null;
    } catch (error: unknown) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  // Register
  async register(data: RegisterRequest): Promise<{
    success: boolean;
    error: string | null;
    data?: { customer_id: string; email: string; telephone?: string; otp?: string };
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

      if (data.id_proof_front) formData.append("id_proof_front", data.id_proof_front);

      const response = await this.requestFormData<RegisterResponse>(
        "/index.php?route=rest/register_mobile",
        formData
      );

      if (response.success) return { success: true, error: null, data: response.data };
      return { success: false, error: response.error || "Registration failed" };
    } catch (error: unknown) {
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

      if (response.success && response.data?.verified) return { success: true, error: null };
      return { success: false, error: response.error || "OTP verification failed" };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OTP verification failed"
      };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await this.request<{ success: boolean; error?: string }>(
        "/index.php?route=rest/logout/logout",
        { method: "POST" }
      );

      if (response.success) return { success: true, error: null };
      return { success: false, error: response.error || "Logout failed" };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Logout failed" };
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
          customer_id: response.data.customer_id,
          email: response.data.email,
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          telephone: response.data.telephone,
          country_code: response.data.country_code,
          dob: response.data.dob,
          token: response.data.token
        };
        return { user, error: null };
      }

      return { user: null, error: response.error || response.message || "Login failed" };
    } catch (error: unknown) {
      return { user: null, error: error instanceof Error ? error.message : "Something went wrong" };
    }
  }

  // Get account info
  async getAccountInfo(): Promise<{ success: boolean; data?: User; error?: string | null }> {
    try {
      const response = await this.request<User>("/index.php?route=rest/account/account", {
        method: "GET"
      });

      if (response.success && response.data) return { success: true, data: response.data };
      return {
        success: false,
        error: response.error || response.message || "Failed to fetch account"
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch account"
      };
    }
  }

  // Update account
  async updateAccount(
    data: UpdateAccountRequest
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const formData = new FormData();
      if (data.firstname) formData.append("firstname", data.firstname);
      if (data.lastname) formData.append("lastname", data.lastname);
      if (data.email) formData.append("email", data.email);
      if (data.telephone) formData.append("telephone", data.telephone);
      if (data.country_code) formData.append("country_code", data.country_code);
      if (data.dob) formData.append("dob", data.dob);

      const response = await this.requestFormData<User>(
        "/index.php?route=rest/account/account",
        formData
      );

      if (response.success) return { success: true, error: null };
      return {
        success: false,
        error: response.error || response.message || "Failed to update account"
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update account"
      };
    }
  }
}

export const authApiClient = new AuthApiClient();
