import { create } from "zustand";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/types/product";

interface ProductStore {
  products: Product[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.getProducts();
      set({ products: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch products",
        loading: false
      });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const allProducts = await apiClient.getProducts();
      const featuredProducts = await apiClient.getFeaturedProducts();
      // Store ALL products for related product filtering
      // and only show first 5 as featured
      set({
        products: allProducts,
        featuredProducts: featuredProducts.slice(0, 5),
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch featured products",
        loading: false
      });
    }
  }
}));
