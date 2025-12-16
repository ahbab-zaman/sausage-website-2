import { API_CONFIG } from "./config";
import {
  ApiProductResponse,
  Product,
  ProductsApiResponse,
  HomeApiResponse,
  HomeProductResponse
} from "@/types/product";

interface SingleProductResponse {
  success: number;
  error: string[];
  data: ApiProductResponse;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly credentials = "apiuser:2024?08X^sausage";

  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  private readonly CACHE_DURATIONS = {
    products: 10 * 60 * 1000,
    featuredProducts: 15 * 60 * 1000,
    singleProduct: 20 * 60 * 1000,
    recommended: 15 * 60 * 1000,
    token: 50 * 60 * 1000
  };

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.loadTokenFromMemory();
  }

  private loadTokenFromMemory() {
    // Token fetched on demand
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, expiresIn: number) {
    this.cache.set(key, { data, timestamp: Date.now(), expiresIn });
    if (this.cache.size > 100) this.cleanupExpiredCache();
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  public clearCache(key?: string) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }

  public async prefetchProductsBatch(ids: string[]) {
    const promises = ids.map((id) => this.getProductById(id));
    await Promise.allSettled(promises);
  }

  private async getValidToken(): Promise<string | null> {
    const now = Date.now();
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const pendingKey = "token_request";
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey);
    }

    const tokenPromise = this.fetchNewToken();
    this.pendingRequests.set(pendingKey, tokenPromise);

    try {
      return await tokenPromise;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  private async fetchNewToken(): Promise<string | null> {
    try {
      const credentials = btoa(this.credentials);
      const response = await fetch(
        `${this.baseUrl}/index.php?route=feed/rest_api/gettoken&grant_type=client_credentials`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}` }
        }
      );

      const data = await response.json();
      if (data.success && data.data?.access_token) {
        this.accessToken = data.data.access_token;
        const expiresIn = data.data.expires_in || 3600;
        this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
        return this.accessToken;
      }
      console.error("Token response:", data);
      return null;
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    cacheKey?: string,
    cacheDuration?: number
  ): Promise<T> {
    if (cacheKey && cacheDuration) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) return cached;

      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getValidToken();

    const requestPromise = (async () => {
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

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();

        if (cacheKey && cacheDuration) {
          this.setCache(cacheKey, data, cacheDuration);
        }

        return data;
      } catch (error) {
        console.error("API Request Error:", error);
        throw error;
      }
    })();

    if (cacheKey) {
      this.pendingRequests.set(cacheKey, requestPromise);
      requestPromise.finally(() => this.pendingRequests.delete(cacheKey));
    }

    return requestPromise;
  }

  // Unified transform function used by all endpoints
  private transformProduct(apiProduct: ApiProductResponse | HomeProductResponse): Product {
    const priceStr =
      typeof apiProduct.price_formated === "string"
        ? apiProduct.price_formated
        : typeof apiProduct.price === "string"
          ? apiProduct.price
          : "";
    const price = Number(priceStr.replace(" AED", "").trim()) || 0;

    const specialStr =
      apiProduct.special_formated && apiProduct.special_formated !== "0.00 AED"
        ? apiProduct.special_formated
        : typeof apiProduct.special === "string" && apiProduct.special !== "0.00 AED"
          ? apiProduct.special
          : "";
    const special = specialStr ? Number(specialStr.replace(" AED", "").trim()) : undefined;

    const images: string[] = [];
    if ((apiProduct as any).thumb) images.push((apiProduct as any).thumb);
    if (apiProduct.image) images.push(apiProduct.image);
    if (apiProduct.images && Array.isArray(apiProduct.images)) {
      apiProduct.images.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }

    const attributes: Record<string, string> = {};
    const specifications: Array<{ label: string; value: string; icon?: string }> = [];
    let category = "All Products";

    if (apiProduct.attribute_groups && Array.isArray(apiProduct.attribute_groups)) {
      apiProduct.attribute_groups.forEach((group) => {
        if (group.attribute && Array.isArray(group.attribute)) {
          group.attribute.forEach((attr) => {
            attributes[attr.name] = attr.text;
            specifications.push({
              label: attr.name.toUpperCase(),
              value: attr.text,
              icon: attr.icon
            });
          });
        }
      });
    }

    if (attributes.Brand) category = attributes.Brand;

    return {
      id: String(apiProduct.product_id || (apiProduct as any).id || ""),
      name: apiProduct.name,
      description: apiProduct.description,
      price: special || price,
      originalPrice: special ? price : undefined,
      image: (apiProduct as any).thumb || apiProduct.image || "/placeholder.svg",
      images:
        images.length > 0
          ? images
          : [(apiProduct as any).thumb || apiProduct.image || "/placeholder.svg"],
      rating: apiProduct.rating || 0,
      reviews: 0,
      badge: (apiProduct as any).label || (special ? "Sale" : undefined),
      quantity: apiProduct.quantity ? parseInt(String(apiProduct.quantity), 10) : 0,
      model: apiProduct.model || (apiProduct as any).product_code,
      manufacturer: apiProduct.manufacturer || attributes.Brand,
      stock_status:
        (apiProduct as any).stock_status ||
        (apiProduct as any).availability ||
        apiProduct.stock_status,
      category,
      size: attributes.Size,
      brand: attributes.Brand,
      country: attributes.Country,
      abv: attributes.ABV || attributes.Alcohol,
      specifications: specifications.length > 0 ? specifications : undefined
    };
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    try {
      const endpoint = categoryId
        ? `${API_CONFIG.ENDPOINTS.PRODUCTS}&category=${categoryId}`
        : API_CONFIG.ENDPOINTS.PRODUCTS;
      const cacheKey = categoryId ? `products_category_${categoryId}` : "all_products";

      const response = await this.request<ProductsApiResponse>(
        endpoint,
        {},
        cacheKey,
        this.CACHE_DURATIONS.products
      );

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
        API_CONFIG.ENDPOINTS.FEATURED_PRODUCTS,
        {},
        "featured_products",
        this.CACHE_DURATIONS.featuredProducts
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

  async getRecommended(): Promise<Product[]> {
    try {
      const cacheKey = "recommended_products";
      const response = await this.request<HomeApiResponse>(
        "/index.php?route=rest/home",
        { method: "GET" },
        cacheKey,
        this.CACHE_DURATIONS.recommended
      );

      if (response.success && response.data?.recommended?.products) {
        return response.data.recommended.products.map((p) => this.transformProduct(p));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch recommended products:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const cacheKey = `product_${id}`;
      const response = await this.request<SingleProductResponse>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS}&id=${id}`,
        {},
        cacheKey,
        this.CACHE_DURATIONS.singleProduct
      );

      if (response.success && response.data) {
        return this.transformProduct(response.data);
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  }

  async prefetchProducts() {
    this.getProducts().catch(() => {});
  }

  async prefetchFeaturedProducts() {
    this.getFeaturedProducts().catch(() => {});
  }

  public getCacheStats() {
    return { size: this.cache.size, pendingRequests: this.pendingRequests.size };
  }
}

export const apiClient = new ApiClient();
