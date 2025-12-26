// lib/api/orderClient.ts

import { API_CONFIG } from "./config";
import { OrderListItem, OrderDetail, ApiResponse } from "@/types/orders";

interface BackendApiResponse<T> {
  success: number;
  error: string[];
  data?: T;
}

class OrderApiClient {
  private baseUrl = API_CONFIG.BASE_URL;

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

  private normalizeResponse<T>(backendRes: BackendApiResponse<T>): ApiResponse<T> {
    return {
      success: backendRes.success === 1,
      data: backendRes.data,
      error: backendRes.error?.length > 0 ? backendRes.error.join(", ") : undefined
    };
  }

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
          return { success: false, error: "Unauthorized - Session expired" };
        }
        return { success: false, error: `HTTP error ${res.status}` };
      }

      const backendRes: BackendApiResponse<T> = await res.json();
      return this.normalizeResponse(backendRes);
    } catch (err: any) {
      console.error("Request error:", err);
      return { success: false, error: err.message || "Request failed" };
    }
  }

  /**
   * Get order history list with pagination
   * @param limit - Number of orders per page (default: 10)
   * @param page - Page number (default: 1)
   */
  async getOrderList(limit: number = 10, page: number = 1): Promise<ApiResponse<OrderListItem[]>> {
    return this.request<OrderListItem[]>(
      `/index.php?route=rest/order/orders&limit=${limit}&page=${page}`,
      { method: "GET" }
    );
  }

  /**
   * Get single order details by order ID
   * @param orderId - The order ID to fetch
   */
  async getOrderDetail(orderId: string): Promise<ApiResponse<OrderDetail>> {
    return this.request<OrderDetail>(`/index.php?route=rest/order/orders&id=${orderId}`, {
      method: "GET"
    });
  }
}

export const orderApiClient = new OrderApiClient();
