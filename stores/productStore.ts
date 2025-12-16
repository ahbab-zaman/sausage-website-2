import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/types/product";
interface ProductStore {
  products: Product[];
  featuredProducts: Product[];
  productCache: Map<string, Product>;
  productsByCategory: Record<string, Product[]>;
  lastFetchByCategory: Record<string, number | null>;
  currentCategory: string;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  // Optimized fetch with stale-while-revalidate
  fetchProducts: (category?: string, force?: boolean) => Promise<void>;
  fetchFeaturedProducts: (force?: boolean) => Promise<void>;
  // Prefetch for better UX
  prefetchProducts: () => void;
  prefetchProductById: (id: string) => void;
  // Get single product from cache or fetch
  getProductById: (id: string) => Promise<Product | null>;
  // Batch operations
  prefetchProductsBatch: (ids: string[]) => Promise<void>;
  // Cache management
  clearCache: () => void;
  getCacheSize: () => number;
}
const STALE_TIME = 10 * 60 * 1000; // 10 minutes (increased from 5)
const BACKGROUND_REFRESH_TIME = 8 * 60 * 1000; // 8 minutes
export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      featuredProducts: [],
      productCache: new Map(),
      productsByCategory: {
        all: [],
        halal: [],
        nonHalal: []
      },
      lastFetchByCategory: {
        all: null,
        halal: null,
        nonHalal: null
      },
      currentCategory: "all",
      loading: false,
      error: null,
      lastFetch: null,
      fetchProducts: async (category = "all", force = false) => {
        const state = get();
        const key = category === "non-halal" ? "nonHalal" : category;
        const now = Date.now();
        const hasData = state.productsByCategory[key].length > 0;
        const lastFetch = state.lastFetchByCategory[key];
        const isFresh = lastFetch && now - lastFetch < STALE_TIME;
        // Skip if data is fresh (unless forced)
        if (!force && hasData && isFresh) {
          set({
            products: state.productsByCategory[key],
            currentCategory: category
          });
          // Background refresh if data is getting stale
          if (now - lastFetch > BACKGROUND_REFRESH_TIME) {
            // Non-blocking background refresh
            const apiCategoryId =
              category === "all" ? undefined : category === "halal" ? "600" : "601";
            apiClient
              .getProducts(apiCategoryId)
              .then((data) => {
                const newByCategory = { ...state.productsByCategory, [key]: data };
                const newCache = new Map(state.productCache);
                data.forEach((product) => {
                  newCache.set(product.id, product);
                });
                set({
                  productsByCategory: newByCategory,
                  productCache: newCache,
                  lastFetchByCategory: { ...state.lastFetchByCategory, [key]: Date.now() },
                  // Update products if still on same category
                  products: state.currentCategory === category ? data : state.products
                });
              })
              .catch(() => {});
          }
          return;
        }
        // Show loading only if we don't have cached data
        if (!hasData) {
          set({ loading: true, error: null });
        }
        try {
          const apiCategoryId =
            category === "all" ? undefined : category === "halal" ? "600" : "601";
          const data = await apiClient.getProducts(apiCategoryId);
          // Update product cache
          const newCache = new Map(state.productCache);
          data.forEach((product) => {
            newCache.set(product.id, product);
          });
          const newByCategory = { ...state.productsByCategory, [key]: data };
          set({
            products: data,
            productsByCategory: newByCategory,
            productCache: newCache,
            loading: false,
            lastFetchByCategory: { ...state.lastFetchByCategory, [key]: now },
            currentCategory: category,
            error: null
          });
        } catch (error) {
          // Don't clear existing data on error
          set({
            error: error instanceof Error ? error.message : "Failed to fetch products",
            loading: false
          });
        }
      },
      fetchFeaturedProducts: async (force = false) => {
        const state = get();
        const now = Date.now();
        // Skip if data is fresh
        if (
          !force &&
          state.featuredProducts.length > 0 &&
          state.lastFetch &&
          now - state.lastFetch < STALE_TIME
        ) {
          // Background refresh
          if (now - state.lastFetch > BACKGROUND_REFRESH_TIME) {
            Promise.all([apiClient.getProducts(), apiClient.getFeaturedProducts()])
              .then(([allProducts, featuredProducts]) => {
                const newCache = new Map(state.productCache);
                allProducts.forEach((product) => {
                  newCache.set(product.id, product);
                });
                set({
                  products: allProducts,
                  featuredProducts: featuredProducts.slice(0, 5),
                  productCache: newCache,
                  lastFetch: Date.now()
                });
              })
              .catch(() => {});
          }
          return;
        }
        if (state.featuredProducts.length === 0) {
          set({ loading: true, error: null });
        }
        try {
          const [allProducts, featuredProducts] = await Promise.all([
            apiClient.getProducts(),
            apiClient.getFeaturedProducts()
          ]);
          // Update product cache
          const newCache = new Map(state.productCache);
          allProducts.forEach((product) => {
            newCache.set(product.id, product);
          });
          featuredProducts.forEach((product) => {
            newCache.set(product.id, product);
          });
          set({
            products: allProducts,
            featuredProducts: featuredProducts.slice(0, 5),
            productCache: newCache,
            loading: false,
            lastFetch: now,
            error: null
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch featured products",
            loading: false
          });
        }
      },
      prefetchProducts: () => {
        // Non-blocking prefetch for all products
        const state = get();
        if (state.productsByCategory.all.length === 0) {
          apiClient.getProducts().catch(() => {});
        }
      },
      prefetchProductById: (id: string) => {
        const state = get();
        if (!state.productCache.has(id)) {
          apiClient
            .getProductById(id)
            .then((product) => {
              if (product) {
                const newCache = new Map(state.productCache);
                newCache.set(product.id, product);
                set({ productCache: newCache });
              }
            })
            .catch(() => {});
        }
      },
      getProductById: async (id: string) => {
        const state = get();
        // Check in-memory cache first
        if (state.productCache.has(id)) {
          return state.productCache.get(id) || null;
        }
        // Check products array
        const cachedProduct = state.products.find((p) => p.id === id);
        if (cachedProduct) {
          const newCache = new Map(state.productCache);
          newCache.set(id, cachedProduct);
          set({ productCache: newCache });
          return cachedProduct;
        }
        // Fetch from API
        try {
          const product = await apiClient.getProductById(id);
          if (product) {
            const newCache = new Map(state.productCache);
            newCache.set(id, product);
            set({ productCache: newCache });
          }
          return product;
        } catch (error) {
          console.error("Failed to fetch product:", error);
          return null;
        }
      },
      prefetchProductsBatch: async (ids: string[]) => {
        const state = get();
        const uncachedIds = ids.filter((id) => !state.productCache.has(id));
        if (uncachedIds.length > 0) {
          await apiClient.prefetchProductsBatch(uncachedIds);
        }
      },
      clearCache: () => {
        set({
          productCache: new Map(),
          productsByCategory: {
            all: [],
            halal: [],
            nonHalal: []
          },
          lastFetchByCategory: {
            all: null,
            halal: null,
            nonHalal: null
          },
          lastFetch: null
        });
        apiClient.clearCache();
      },
      getCacheSize: () => {
        return get().productCache.size;
      }
    }),
    {
      name: "product-storage",
      partialize: (state) => ({
        products: state.products,
        featuredProducts: state.featuredProducts,
        productsByCategory: state.productsByCategory,
        lastFetchByCategory: state.lastFetchByCategory,
        lastFetch: state.lastFetch
      })
    }
  )
);
