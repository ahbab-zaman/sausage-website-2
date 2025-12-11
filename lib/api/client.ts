// lib/api/client.ts

import { API_CONFIG } from "./config";
import { ApiProductResponse, Product, ProductsApiResponse } from "@/types/product";

class ApiClient {
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
          ...API_CONFIG.HEADERS,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

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
              ...API_CONFIG.HEADERS,
              Authorization: `Bearer ${newToken}`,
              ...options?.headers
            }
          });

          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.status} ${retryResponse.statusText}`);
          }

          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Transform API response to match frontend Product interface
  private transformProduct(apiProduct: ApiProductResponse): Product {
    const price = Number(apiProduct.price) || 0;

    const special =
      apiProduct.special && apiProduct.special !== "0.00 AED"
        ? Number(apiProduct.special.replace(" AED", ""))
        : undefined;

    return {
      id: apiProduct.product_id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: special || price, // Use special price if available
      originalPrice: special ? price : undefined, // Set original price if there's a special price
      image: apiProduct.image || apiProduct.thumb || "",
      images: [apiProduct.image, apiProduct.thumb].filter(Boolean) as string[],
      rating: apiProduct.rating || 0,
      reviews: 0, // API doesn't provide reviews count, you may need to fetch this separately
      badge: special ? "Sale" : undefined,
      quantity: apiProduct.quantity ? parseInt(apiProduct.quantity, 10) : 0,
      model: apiProduct.model,
      manufacturer: apiProduct.manufacturer,
      stock_status: apiProduct.stock_status,
    };
  }

  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.request<ProductsApiResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);

      if (response.success && response.data) {
        return response.data.map(this.transformProduct);
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await this.request<ProductsApiResponse>(
        API_CONFIG.ENDPOINTS.FEATURED_PRODUCTS
      );

      if (response.success && response.data) {
        // Return first 4 products for featured section
        return response.data.map(this.transformProduct);
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.request<ProductsApiResponse>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS}&product_id=${id}`
      );

      if (response.success && response.data && response.data.length > 0) {
        return this.transformProduct(response.data[0]);
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
