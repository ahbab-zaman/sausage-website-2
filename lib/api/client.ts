import { API_CONFIG } from "./config";
import { ApiProductResponse, Product, ProductsApiResponse } from "@/types/product";

// Add new interface for single product response
interface SingleProductResponse {
  success: number;
  error: string[];
  data: ApiProductResponse;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly credentials = "apiuser:2024?08X^sausage";

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

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
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
      );

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        this.accessToken = data.data.access_token;
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
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

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
            },
            cache: "no-store"
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

  private transformProduct(apiProduct: ApiProductResponse): Product {
    const price = Number(apiProduct.price) || 0;

    const special =
      apiProduct.special && apiProduct.special !== "0.00 AED"
        ? Number(apiProduct.special.replace(" AED", ""))
        : undefined;

    // Build images array from the response
    const images: string[] = [];
    if (apiProduct.image) images.push(apiProduct.image);

    // Add additional images from images array if they exist
    if (apiProduct.images && Array.isArray(apiProduct.images)) {
      apiProduct.images.forEach((img) => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }

    // Extract attribute details
    const attributes: Record<string, string> = {};
    const specifications: Array<{ label: string; value: string; icon?: string }> = [];
    let category = "All Products";

    if (apiProduct.attribute_groups && Array.isArray(apiProduct.attribute_groups)) {
      apiProduct.attribute_groups.forEach((group) => {
        if (group.attribute && Array.isArray(group.attribute)) {
          group.attribute.forEach((attr) => {
            attributes[attr.name] = attr.text;

            // Build specifications array for display
            specifications.push({
              label: attr.name.toUpperCase(),
              value: attr.text,
              icon: attr.icon
            });
          });
        }
      });
    }

    // Extract brand for category if available
    if (attributes.Brand) {
      category = attributes.Brand;
    }

    return {
      id: String(apiProduct.product_id || apiProduct.id),
      name: apiProduct.name,
      description: apiProduct.description,
      price: special || price,
      originalPrice: special ? price : undefined,
      image: apiProduct.image || "/placeholder.svg",
      images: images.length > 0 ? images : [apiProduct.image || "/placeholder.svg"],
      rating: apiProduct.rating || 0,
      reviews: 0,
      badge: special ? "Sale" : undefined,
      quantity: apiProduct.quantity ? parseInt(String(apiProduct.quantity), 10) : 0,
      model: apiProduct.model || apiProduct.product_code,
      manufacturer: apiProduct.manufacturer || attributes.Brand,
      stock_status: apiProduct.availability || apiProduct.stock_status,
      category: category,
      // Add individual attributes
      size: attributes.Size,
      brand: attributes.Brand,
      country: attributes.Country,
      abv: attributes.ABV || attributes.Alcohol,
      // Add structured specifications
      specifications: specifications.length > 0 ? specifications : undefined
    };
  }

  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.request<ProductsApiResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);

      if (response.success && response.data) {
        return response.data.map((p) => this.transformProduct(p));
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
        return response.data.map((p) => this.transformProduct(p));
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      console.log("Fetching product with ID:", id);

      // Use the correct endpoint format for single product
      const response = await this.request<SingleProductResponse>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS}&id=${id}`
      );

      console.log("Single product response:", response);

      // Check if response is successful and data exists
      if (response.success && response.data) {
        // The response.data is a single object, not an array
        return this.transformProduct(response.data);
      }

      console.error("Product not found or invalid response");
      return null;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
