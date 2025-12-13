import { API_CONFIG } from "./config";
import {
  CartItem,
  BackendCartResponse,
  AddToCartRequest,
  UpdateCartRequest,
  RemoveCartItemRequest,
  BackendCartItem
} from "@/types/cart";

class CartApiClient {
  private baseUrl: string = API_CONFIG.BASE_URL;
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user?.client_token || null;
    } catch {
      return null;
    }
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private mapItem(item: BackendCartItem): CartItem {
    return {
      id: item.product_id,
      key: item.key,
      product_id: item.product_id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      total: Number(item.total),
      image: item.thumb || item.image || "/placeholder.svg",
      model: item.model || undefined
    };
  }

  async getCart(): Promise<CartItem[]> {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include"
    });
    const data: BackendCartResponse = await res.json();
    if (!data.success || !data.data?.products) return [];
    return data.data.products.map(this.mapItem);
  }

  async addToCart(product_id: string, quantity: number = 1): Promise<CartItem[]> {
    const body: AddToCartRequest = { product_id, quantity: quantity.toString() };
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
      body: JSON.stringify(body)
    });
    const data: BackendCartResponse = await res.json();
    if (!data.success) throw new Error(data.error?.[0] || "Unauthorized");
    return this.getCart();
  }

  async updateCartItem(key: string, quantity: number): Promise<CartItem[]> {
    const body: UpdateCartRequest = { key, quantity: quantity.toString() };
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "PUT",
      headers: this.getHeaders(),
      credentials: "include",
      body: JSON.stringify(body)
    });
    const data: BackendCartResponse = await res.json();
    if (!data.success) throw new Error(data.error?.[0] || "Failed to update cart");
    return this.getCart();
  }

  async removeCartItem(key: string): Promise<CartItem[]> {
    const body: RemoveCartItemRequest = { key };
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CART}`, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
      body: JSON.stringify(body)
    });
    const data: BackendCartResponse = await res.json();
    if (!data.success) throw new Error(data.error?.[0] || "Failed to remove item");
    return this.getCart();
  }

  async emptyCart(): Promise<void> {
    const res = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.EMPTY_CART}`, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include"
    });
    const data: BackendCartResponse = await res.json();
    if (!data.success) throw new Error(data.error?.[0] || "Failed to clear cart");
  }
}

export const cartApiClient = new CartApiClient();
