// import { API_CONFIG } from "./config";
// import {
//   LoginRequest,
//   LoginResponse,
//   RegisterRequest,
//   RegisterResponse,
//   VerifyOTPRequest,
//   VerifyOTPResponse,
//   User,
//   UpdateAccountRequest,
//   TokenResponse
// } from "@/types/auth";

// interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// }

// class AuthApiClient {
//   private baseUrl = API_CONFIG.BASE_URL;
//   private credentials = "apiuser:2024?08X^sausage";

//   // 🔐 ONE token for whole browser session
//   private clientToken: string | null = null;

//   constructor() {
//     if (typeof window !== "undefined") {
//       this.clientToken = localStorage.getItem("client_token");
//     }
//   }

//   private saveToken(token: string) {
//     this.clientToken = token;
//     localStorage.setItem("client_token", token);
//   }

//   // 🔑 GET CLIENT TOKEN (ONLY ONCE)
//   private async getClientToken(): Promise<string> {
//     if (this.clientToken) return this.clientToken;

//     const encoded = btoa(this.credentials);

//     const res = await fetch(
//       `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
//       {
//         method: "POST",
//         headers: { Authorization: `Basic ${encoded}` }
//       }
//     );

//     const json: ApiResponse<TokenResponse> = await res.json();

//     if (!json.success || !json.data?.access_token) {
//       throw new Error("Failed to get API token");
//     }

//     this.saveToken(json.data.access_token);
//     return json.data.access_token;
//   }

//   // 🌐 GENERIC REQUEST
//   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
//     const token = await this.getClientToken();

//     const res = await fetch(`${this.baseUrl}${endpoint}`, {
//       ...options,
//       headers: {
//         ...(options.headers || {}),
//         Authorization: `Bearer ${token}`
//       },
//       credentials: "include"
//     });

//     return res.json();
//   }

//   // 📤 FORM DATA REQUEST
//   private async requestFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
//     const token = await this.getClientToken();

//     const res = await fetch(`${this.baseUrl}${endpoint}`, {
//       method: "POST",
//       body: formData,
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include"
//     });

//     return res.json();
//   }

//   // 🧾 REGISTER
//   async register(data: RegisterRequest) {
//     const formData = new FormData();
//     Object.entries(data).forEach(([k, v]) => v && formData.append(k, v as any));

//     return this.requestFormData<RegisterResponse>(
//       "/index.php?route=rest/register_mobile",
//       formData
//     );
//   }

//   // 🔢 VERIFY OTP
//   async verifyOTP(data: VerifyOTPRequest) {
//     const formData = new FormData();
//     formData.append("customer_id", data.customer_id);
//     formData.append("otp", data.otp);

//     return this.requestFormData<VerifyOTPResponse>(
//       "/index.php?route=rest/register_mobile/verify_otp",
//       formData
//     );
//   }

//   // 🔐 LOGIN (USES SAME BEARER TOKEN)
//   async login(credentials: LoginRequest) {
//     const formData = new FormData();
//     formData.append("email", credentials.email);
//     formData.append("password", credentials.password);

//     return this.requestFormData<LoginResponse>("/index.php?route=rest/login/login", formData);
//   }

//   // 👤 GET ACCOUNT
//   async getAccountInfo() {
//     return this.request<User>("/index.php?route=rest/account/account", { method: "GET" });
//   }

//   // ✏️ UPDATE ACCOUNT
//   async updateAccount(data: UpdateAccountRequest) {
//     const formData = new FormData();
//     Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));

//     return this.requestFormData<User>("/index.php?route=rest/account/account", formData);
//   }

//   // 🚪 LOGOUT
//   async logout() {
//     localStorage.removeItem("client_token");
//     this.clientToken = null;

//     return this.request("/index.php?route=rest/logout/logout", { method: "POST" });
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AuthApiClient {
  private baseUrl = API_CONFIG.BASE_URL;
  private credentials = "apiuser:2024?08X^sausage";

  private clientToken: string | null = null;
  private userToken: string | null = null; // <-- user-specific token

  constructor() {
    if (typeof window !== "undefined") {
      this.clientToken = localStorage.getItem("client_token");
      this.userToken = localStorage.getItem("user_token");
    }
  }

  private saveClientToken(token: string) {
    this.clientToken = token;
    localStorage.setItem("client_token", token);
  }

  private saveUserToken(token: string) {
    this.userToken = token;
    localStorage.setItem("user_token", token);
  }

  private async getClientToken(): Promise<string> {
    if (this.clientToken) return this.clientToken;

    const encoded = btoa(this.credentials);
    const res = await fetch(
      `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
      { method: "POST", headers: { Authorization: `Basic ${encoded}` } }
    );

    if (!res.ok) throw new Error("Failed to get API token");

    const json: ApiResponse<TokenResponse> = await res.json();
    if (!json.success || !json.data?.access_token) throw new Error("Failed to get API token");

    this.saveClientToken(json.data.access_token);
    return json.data.access_token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useUserToken = true
  ): Promise<ApiResponse<T>> {
    const token = useUserToken
      ? this.userToken || (await this.getClientToken())
      : await this.getClientToken();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return { success: false, error: `HTTP error ${res.status}` };
    try {
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Invalid JSON response" };
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    useUserToken = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body: formData }, useUserToken);
  }

  async register(data: RegisterRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => v && formData.append(k, v as any));
    return this.requestFormData<RegisterResponse>(
      "/index.php?route=rest/register_mobile",
      formData,
      false
    );
  }

  async verifyOTP(data: VerifyOTPRequest) {
    const formData = new FormData();
    formData.append("customer_id", data.customer_id);
    formData.append("otp", data.otp);
    return this.requestFormData<VerifyOTPResponse>(
      "/index.php?route=rest/register_mobile/verify_otp",
      formData,
      false
    );
  }

  async login(credentials: LoginRequest) {
    const formData = new FormData();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const res = await this.requestFormData<LoginResponse>(
      "/index.php?route=rest/login/login",
      formData,
      false
    );

    if (res.success && res.data?.token) this.saveUserToken(res.data.token);
    return res;
  }

  async getAccountInfo() {
    return this.request<User>("/index.php?route=rest/account/account", { method: "GET" });
  }

  async updateAccount(data: UpdateAccountRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
    return this.requestFormData<User>("/index.php?route=rest/account/account", formData);
  }

  async logout() {
    this.clientToken = null;
    this.userToken = null;
    localStorage.removeItem("client_token");
    localStorage.removeItem("user_token");

    return this.request("/index.php?route=rest/logout/logout", { method: "POST" });
  }
}

export const authApiClient = new AuthApiClient();
