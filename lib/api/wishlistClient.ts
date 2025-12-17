import { BackendWishlistItem, BackendWishlistResponse, WishlistItem } from "@/types/wishlist";
import { authApiClient } from "./authClient";
import { API_CONFIG } from "./config";
import { BackendApiResponse } from "@/types/auth";

class WishlistApiClient {
  private baseUrl: string = API_CONFIG.BASE_URL;
  private endpoint: string = "/index.php?route=rest/wishlist/wishlist";

  private async getAuthHeader(): Promise<string> {
    const token = await authApiClient.getClientToken();
    return `Bearer ${token}`;
  }

  private checkAuth(): void {
    if (!authApiClient.isLoggedIn()) {
      throw new Error("Please login to manage your wishlist");
    }
  }

  // IMPROVED: Remove aggressive timeout + add retry
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          credentials: "include"
          // Remove signal — no timeout abort
        });

        // If we get a response (even error), return it
        return response;
      } catch (error: any) {
        // Network error, DNS, or fetch failure
        if (i === retries - 1) throw error; // Last attempt → throw

        console.warn(`Wishlist request failed, retry ${i + 1}/${retries}...`, error);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
      }
    }
    throw new Error("Max retries reached");
  }

  private mapItem(item: BackendWishlistItem): WishlistItem {
    const parseNumber = (value: any): number => {
      if (typeof value === "number") return value;
      const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    };

    const priceNumber = parseNumber(item.price);

    return {
      product_id: item.product_id,
      name: item.name,
      price: priceNumber,
      image: item.thumb || "/placeholder.svg",
      description: item.description || "",
      quantity: String(item.quantity ?? "0"),
      price_formated: `AED ${priceNumber.toLocaleString("en-BD")}`,

      model: item.model || undefined
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Always try to parse JSON even on error status
    let data: BackendApiResponse;
    try {
      data = await response.json();
    } catch {
      data = { success: 0, error: ["Invalid response from server"] };
    }

    console.log("❤️ Wishlist API Response:", {
      status: response.status,
      success: data.success,
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

  async getWishlist(): Promise<WishlistItem[]> {
    this.checkAuth();
    const authHeader = await this.getAuthHeader();

    const res = await this.fetchWithRetry(`${this.baseUrl}${this.endpoint}`, {
      method: "GET",
      headers: { Authorization: authHeader }
    });

    const data: BackendWishlistResponse = await this.handleResponse(res);
    return data.data?.map(this.mapItem) ?? [];
  }

  async addToWishlist(product_id: string): Promise<WishlistItem[]> {
    this.checkAuth();
    const authHeader = await this.getAuthHeader();

    const url = `${this.baseUrl}${this.endpoint}&id=${encodeURIComponent(product_id)}`;

    const res = await this.fetchWithRetry(url, {
      method: "POST",
      headers: { Authorization: authHeader }
    });

    await this.handleResponse(res);
    return this.getWishlist();
  }

  async removeFromWishlist(product_id: string): Promise<WishlistItem[]> {
    this.checkAuth();
    const authHeader = await this.getAuthHeader();

    const url = `${this.baseUrl}${this.endpoint}&id=${encodeURIComponent(product_id)}`;

    const res = await this.fetchWithRetry(url, {
      method: "DELETE",
      headers: { Authorization: authHeader }
    });

    await this.handleResponse(res);
    return this.getWishlist();
  }
}

export const wishlistApiClient = new WishlistApiClient();
