import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { cartApiClient } from "@/lib/api/cartClient";

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;

  getTotal: () => number;
  getItemCount: () => number;
  resetError: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const items: CartItem[] = await cartApiClient.getCart();
          set({ items, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch cart",
            loading: false
          });
        }
      },

      addItem: async (productId, quantity) => {
        set({ loading: true, error: null });
        try {
          const items: CartItem[] = await cartApiClient.addToCart(productId, quantity);
          set({ items, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to add item",
            loading: false
          });
          throw error;
        }
      },

      updateQuantity: async (key, quantity) => {
        if (quantity === 0) return get().removeItem(key);
        set({ loading: true, error: null });
        try {
          const items: CartItem[] = await cartApiClient.updateCartItem(key, quantity);
          set({ items, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update quantity",
            loading: false
          });
          throw error;
        }
      },

      removeItem: async (key) => {
        set({ loading: true, error: null });
        try {
          const items: CartItem[] = await cartApiClient.removeCartItem(key);
          set({ items, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to remove item",
            loading: false
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          await cartApiClient.emptyCart();
          set({ items: [], loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to clear cart",
            loading: false
          });
          throw error;
        }
      },

      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      resetError: () => set({ error: null })
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items })
    }
  )
);
