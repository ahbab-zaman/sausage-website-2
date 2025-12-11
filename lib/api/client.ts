// lib/api/client.ts

import { API_CONFIG } from "./config";
import { ApiProductResponse, Product, ProductsApiResponse } from "@/types/product";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options?.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Transform API response to match frontend Product interface
  private transformProduct(apiProduct: ApiProductResponse): Product {
    const price = parseFloat(apiProduct.price.replace(/[^0-9.-]+/g, "")) || 0;
    const special = apiProduct.special
      ? parseFloat(apiProduct.special.replace(/[^0-9.-]+/g, ""))
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
      category: apiProduct.category_id,
      badge: special ? "Sale" : undefined,
      thumb: apiProduct.thumb,
      quantity: apiProduct.quantity ? parseInt(apiProduct.quantity, 10) : 0,
      model: apiProduct.model,
      manufacturer: apiProduct.manufacturer,
      stock_status: apiProduct.stock_status,
      href: apiProduct.href
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
        // Return first 6 products
        return response.data.slice(0, 6).map(this.transformProduct);
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
