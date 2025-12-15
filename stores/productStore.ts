import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  featuredProducts: Product[];
  productCache: Map<string, Product>;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Optimized fetch with stale-while-revalidate
  fetchProducts: (force?: boolean) => Promise<void>;
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
      loading: false,
      error: null,
      lastFetch: null,

      fetchProducts: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Skip if data is fresh (unless forced)
        if (
          !force &&
          state.products.length > 0 &&
          state.lastFetch &&
          now - state.lastFetch < STALE_TIME
        ) {
          // Background refresh if data is getting stale
          if (now - state.lastFetch > BACKGROUND_REFRESH_TIME) {
            // Non-blocking background refresh
            apiClient
              .getProducts()
              .then((data) => {
                set({
                  products: data,
                  lastFetch: Date.now()
                });
              })
              .catch(() => {});
          }
          return;
        }

        // Show loading only if we don't have cached data
        if (state.products.length === 0) {
          set({ loading: true, error: null });
        }

        try {
          const data = await apiClient.getProducts();

          // Update product cache
          const newCache = new Map(state.productCache);
          data.forEach((product) => {
            newCache.set(product.id, product);
          });

          set({
            products: data,
            productCache: newCache,
            loading: false,
            lastFetch: now,
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
        // Non-blocking prefetch
        const state = get();
        if (state.products.length === 0) {
          apiClient.prefetchProducts();
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
        lastFetch: state.lastFetch
      })
    }
  )
);
