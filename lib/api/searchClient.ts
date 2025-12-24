interface SearchProduct {
  product_id: string;
  name: string;
  price: string;
  special?: string;
  image: string;
  thumb?: string;
}

interface SearchResponse {
  success: number;
  error: string[];
  data?: {
    products: SearchProduct[];
  };
}

interface RecentSearchResponse {
  success: number;
  error: string[];
  data: {
    recent_search: Array<{ keyword: string }>;
  };
}

class SearchApiClient {
  private baseUrl: string;
  private searchCache: Map<string, { data: SearchProduct[]; timestamp: number }>;
  private recentSearchCache: { data: string[]; timestamp: number } | null;
  private pendingRequests: Map<string, Promise<SearchProduct[]>>;
  private recentSearchPromise: Promise<string[]> | null;
  private prefetchController: AbortController | null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly RECENT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    this.searchCache = new Map();
    this.recentSearchCache = null;
    this.pendingRequests = new Map();
    this.recentSearchPromise = null;
    this.prefetchController = null;
  }

  /**
   * Get client token from localStorage
   */
  private getClientToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("client_token");
  }

  /**
   * Get auth headers with Bearer token
   */
  private getAuthHeaders(): HeadersInit {
    const token = this.getClientToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Prefetch recent searches - call this on app initialization
   */
  async prefetchRecentSearches(): Promise<void> {
    try {
      await this.getRecentSearches();
    } catch (error) {
      console.error("Failed to prefetch recent searches:", error);
    }
  }

  /**
   * Prefetch search results for a query (fast fetching)
   * Call this when user is typing to prepare results in advance
   */
  async prefetchSearch(query: string): Promise<void> {
    if (!query.trim()) return;

    const cacheKey = query.toLowerCase().trim();

    // Don't prefetch if already cached or pending
    if (this.searchCache.has(cacheKey) || this.pendingRequests.has(cacheKey)) {
      return;
    }

    // Cancel previous prefetch
    if (this.prefetchController) {
      this.prefetchController.abort();
    }

    this.prefetchController = new AbortController();

    try {
      const url = `${this.baseUrl}/index.php?route=feed/rest_api/search&search=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include",
        signal: this.prefetchController.signal
      });

      if (!response.ok) return;

      const data: SearchResponse = await response.json();

      if (data.success === 1) {
        const products = data.data?.products || [];
        this.searchCache.set(cacheKey, {
          data: products,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Prefetch error:", error);
      }
    }
  }

  /**
   * Cancel any ongoing prefetch
   */
  cancelPrefetch(): void {
    if (this.prefetchController) {
      this.prefetchController.abort();
      this.prefetchController = null;
    }
  }

  /**
   * Get recent search keywords
   */
  async getRecentSearches(): Promise<string[]> {
    // Check cache first
    if (
      this.recentSearchCache &&
      Date.now() - this.recentSearchCache.timestamp < this.RECENT_CACHE_DURATION
    ) {
      return this.recentSearchCache.data;
    }

    // Return existing promise if request is pending
    if (this.recentSearchPromise) {
      return this.recentSearchPromise;
    }

    // Create new request
    this.recentSearchPromise = this.fetchRecentSearches();

    try {
      const result = await this.recentSearchPromise;
      return result;
    } finally {
      this.recentSearchPromise = null;
    }
  }

  private async fetchRecentSearches(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/index.php?route=feed/rest_api/recent_search`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent searches: ${response.status}`);
      }

      const data: RecentSearchResponse = await response.json();

      if (data.success !== 1) {
        throw new Error("Recent search request failed");
      }

      const keywords = data.data?.recent_search?.map((item) => item.keyword) || [];

      // Update cache
      this.recentSearchCache = {
        data: keywords,
        timestamp: Date.now()
      };

      return keywords;
    } catch (error) {
      console.error("Recent search API error:", error);
      return [];
    }
  }

  /**
   * Search for products with request deduplication and caching
   */
  async searchProducts(query: string): Promise<SearchProduct[]> {
    if (!query.trim()) {
      return [];
    }

    const cacheKey = query.toLowerCase().trim();

    // Check cache with expiry
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Return existing promise if request is already pending (request deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const promise = this.fetchSearchProducts(query, cacheKey);
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchSearchProducts(query: string, cacheKey: string): Promise<SearchProduct[]> {
    try {
      const url = `${this.baseUrl}/index.php?route=feed/rest_api/search&search=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      if (data.success !== 1) {
        throw new Error(data.error?.join(", ") || "Search request failed");
      }

      const products = data.data?.products || [];

      // Cache results with timestamp
      this.searchCache.set(cacheKey, {
        data: products,
        timestamp: Date.now()
      });

      // Limit cache size to prevent memory issues
      if (this.searchCache.size > 100) {
        const firstKey = this.searchCache.keys().next().value;
        if (firstKey !== undefined) {
          this.searchCache.delete(firstKey);
        }
      }

      return products;
    } catch (error) {
      console.error("Search API error:", error);
      throw error;
    }
  }

  /**
   * Get products for recent search keywords (batch fetch)
   */
  async getRecentSearchProducts(): Promise<Map<string, SearchProduct[]>> {
    const keywords = await this.getRecentSearches();
    const results = new Map<string, SearchProduct[]>();

    // Fetch products for each keyword in parallel
    const promises = keywords.map(async (keyword) => {
      try {
        const products = await this.searchProducts(keyword);
        results.set(keyword, products);
      } catch (error) {
        console.error(`Failed to fetch products for "${keyword}":`, error);
        results.set(keyword, []);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.searchCache.clear();
    this.recentSearchCache = null;
    this.cancelPrefetch();
  }

  /**
   * Clear only search cache
   */
  clearSearchCache() {
    this.searchCache.clear();
  }

  /**
   * Clear only recent search cache
   */
  clearRecentSearchCache() {
    this.recentSearchCache = null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      searchCacheSize: this.searchCache.size,
      hasRecentCache: !!this.recentSearchCache,
      pendingRequests: this.pendingRequests.size
    };
  }
}

export const searchApiClient = new SearchApiClient();
export type { SearchProduct };
