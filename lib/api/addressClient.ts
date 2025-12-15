import { API_CONFIG } from "./config";
import {
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressRequest,
  GetAddressResponse,
  DeleteAddressResponse,
  Address
} from "@/types/address";

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

class AddressApiClient {
  private baseUrl = API_CONFIG.BASE_URL;
  private clientToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.clientToken = localStorage.getItem("client_token");
    }
  }

  /**
   * Get client token from localStorage
   */
  private async getClientToken(): Promise<string> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      return token;
    }
    throw new Error("Cannot access localStorage");
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
   * Make authenticated request with JSON body
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
   * Add new address
   */
  async addAddress(data: AddAddressRequest): Promise<ApiResponse<AddAddressResponse>> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.requestFormData<AddAddressResponse>(
      "/index.php?route=rest/account/address",
      formData
    );
  }

  /**
   * Update existing address
   */
  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<ApiResponse<any>> {
    return this.request<any>(`/index.php?route=rest/account/address&id=${addressId}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  /**
   * Get address by ID
   */
  async getAddress(addressId: string): Promise<ApiResponse<GetAddressResponse>> {
    return this.request<GetAddressResponse>(
      `/index.php?route=rest/account/address&id=${addressId}`,
      {
        method: "GET"
      }
    );
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<DeleteAddressResponse>> {
    return this.request<DeleteAddressResponse>(
      `/index.php?route=rest/account/address&id=${addressId}`,
      {
        method: "DELETE"
      }
    );
  }

  /**
   * Get all addresses for the current user
   */
  async getAllAddresses(): Promise<ApiResponse<Address[]>> {
    const res = await this.request<any>("/index.php?route=rest/account/address", {
      method: "GET"
    });

    // Handle the actual backend response format
    if (res.success && res.data) {
      // Backend returns addresses in data.address_list
      if (res.data.address_list && Array.isArray(res.data.address_list)) {
        return {
          success: true,
          data: res.data.address_list
        };
      }
      // Fallback: if data is already an array
      if (Array.isArray(res.data)) {
        return { success: true, data: res.data };
      }
    }

    // Return empty array if no addresses found
    return { success: res.success, data: [], error: res.error };
  }
}

export const addressApiClient = new AddressApiClient();
