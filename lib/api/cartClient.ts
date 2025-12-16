import { API_CONFIG } from "./config";
import { authApiClient } from "./authClient";
import {
  CartItem,
  BackendCartResponse,
  AddToCartRequest,
  UpdateCartRequest,
  RemoveCartItemRequest,
  BackendCartItem
} from "@/types/cart";

interface BackendApiResponse {
  success: number; // 1 = success, 0 = fail
  error: string[];
  data?: any;
}

class CartApiClient {
  private baseUrl: string = API_CONFIG.BASE_URL;

  private async getAuthHeader(): Promise<string> {
    const token = await authApiClient.getClientToken();
    return `Bearer ${token}`;
  }

  private checkAuth(): void {
    if (!authApiClient.isLoggedIn()) {
      throw new Error("Please login to manage your cart");
    }
  }

  private mapItem(item: BackendCartItem): CartItem {
    const parseNumber = (value: any): number => {
      if (typeof value === "number") return value;
      const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      id: item.product_id,
      key: item.key,
      product_id: item.product_id,
      name: item.name,
      price: parseNumber(item.price),
      quantity: parseNumber(item.quantity),
      total: parseNumber(item.total),
      image: item.thumb || item.image || "/placeholder.svg",
      model: item.model || undefined
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data: BackendApiResponse = await response.json();

    console.log("🛒 Cart API Response:", {
      status: response.status,
      success: data.success,
      hasError: data.error && data.error.length > 0,
      error: data.error
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired - Please login again");
      }
      throw new Error(`HTTP error ${response.status}`);
    }

    if (data.success !== 1) {
      const errorMsg = data.error?.length > 0 ? data.error.join(", ") : "Operation failed";
      throw new Error(errorMsg);
    }

    return data as T;
  }

  async getCart(): Promise<CartItem[]> {
    this.checkAuth();
    const authHeader = await this.getAuthHeader();

    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "GET",
      headers: { Authorization: authHeader },
      credentials: "include"
    });

    const data: BackendCartResponse = await this.handleResponse(res);

    return data.data?.products?.map(this.mapItem) ?? [];
  }

  async addToCart(product_id: string, quantity: number = 1): Promise<CartItem[]> {
    this.checkAuth();
    const body = { product_id, quantity: quantity.toString() };
    const authHeader = await this.getAuthHeader();

    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    await this.handleResponse(res);
    return this.getCart();
  }

  async updateCartItem(key: string, quantity: number): Promise<CartItem[]> {
    this.checkAuth();
    const body = { key, quantity: quantity.toString() };
    const authHeader = await this.getAuthHeader();

    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    await this.handleResponse(res);
    return this.getCart();
  }

  async removeCartItem(key: string): Promise<CartItem[]> {
    this.checkAuth();
    const body = { key };
    const authHeader = await this.getAuthHeader();

    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    await this.handleResponse(res);
    return this.getCart();
  }

  async emptyCart(): Promise<void> {
    this.checkAuth();
    const authHeader = await this.getAuthHeader();

    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.EMPTY_CART}`, {
      method: "DELETE",
      headers: { Authorization: authHeader },
      credentials: "include"
    });

    await this.handleResponse(res);
  }
}

export const cartApiClient = new CartApiClient();
