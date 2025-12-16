interface SearchProduct {
  product_id: string;
  name: string;
  price: string;
  special?: string;
  image: string;
  thumb?: string;
}

interface SearchResponse {
  success: boolean;
  data?: {
    products: SearchProduct[];
  };
  error?: string;
}

class SearchApiClient {
  private baseUrl: string;
  private cache: Map<string, SearchProduct[]>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    this.cache = new Map();
  }

  async searchProducts(query: string): Promise<SearchProduct[]> {
    if (!query.trim()) {
      return [];
    }

    const cacheKey = query.toLowerCase().trim();

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const url = `${this.baseUrl}index.php?route=feed/rest_api/search&search=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Search request failed");
      }

      const products = data.data?.products || [];

      // Cache results
      this.cache.set(cacheKey, products);

      return products;
    } catch (error) {
      console.error("Search API error:", error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

export const searchApiClient = new SearchApiClient();
export type { SearchProduct };
