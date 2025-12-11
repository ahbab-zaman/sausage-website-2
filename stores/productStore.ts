// store/productStore.ts

import { create } from "zustand";
import { Product } from "@/types/product";
import { apiClient } from "@/lib/api/client";

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await apiClient.getProducts();
      set({ products, loading: false });
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
      const featuredProducts = await apiClient.getFeaturedProducts();
      set({ featuredProducts, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch featured products",
        loading: false
      });
    }
  },

  getProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const product = await apiClient.getProductById(id);
      set({ loading: false });
      return product;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch product",
        loading: false
      });
      return null;
    }
  }
}));
