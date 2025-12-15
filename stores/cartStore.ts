import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { cartApiClient } from "@/lib/api/cartClient";

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastSync: number | null;

  fetchCart: (force?: boolean) => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;

  getTotal: () => number;
  getItemCount: () => number;
  resetError: () => void;
}

const CART_STALE_TIME = 5 * 60 * 1000; // 5 minutes (increased from 2)
const BACKGROUND_REFRESH_TIME = 3 * 60 * 1000; // 3 minutes

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastSync: null,

      fetchCart: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Skip if data is fresh
        if (
          !force &&
          state.items.length > 0 &&
          state.lastSync &&
          now - state.lastSync < CART_STALE_TIME
        ) {
          // Background refresh if data is getting stale
          if (now - state.lastSync > BACKGROUND_REFRESH_TIME) {
            cartApiClient
              .getCart()
              .then((items) => {
                set({ items, lastSync: Date.now() });
              })
              .catch(() => {});
          }
          return;
        }

        // Show loading only if we don't have data
        if (state.items.length === 0) {
          set({ loading: true, error: null });
        }

        try {
          const items: CartItem[] = await cartApiClient.getCart();
          set({ items, loading: false, lastSync: now });
        } catch (error) {
          // Don't clear existing data on error
          set({
            error: error instanceof Error ? error.message : "Failed to fetch cart",
            loading: false
          });
        }
      },

      addItem: async (productId, quantity) => {
        const currentItems = get().items;

        // Check if item already exists
        const existingItem = currentItems.find((item) => item.product_id === productId);

        if (existingItem) {
          // If exists, update quantity instead
          return get().updateQuantity(existingItem.key, existingItem.quantity + quantity);
        }

        set({ loading: true, error: null });

        // Optimistic update with placeholder
        const tempItem: CartItem = {
          id: productId,
          product_id: productId,
          name: "Adding...",
          price: 0,
          quantity,
          total: 0,
          image: "/placeholder.svg",
          key: `temp_${Date.now()}`
        };

        set({ items: [...currentItems, tempItem] });

        try {
          const items: CartItem[] = await cartApiClient.addToCart(productId, quantity);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          // Revert on error
          set({ items: currentItems });

          set({
            error: error instanceof Error ? error.message : "Failed to add item",
            loading: false
          });
          throw error;
        }
      },

      updateQuantity: async (key, quantity) => {
        if (quantity === 0) return get().removeItem(key);

        const currentItems = get().items;

        // Optimistic update
        const optimisticItems = currentItems.map((item) =>
          item.key === key ? { ...item, quantity, total: item.price * quantity } : item
        );

        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items: CartItem[] = await cartApiClient.updateCartItem(key, quantity);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          // Revert on error
          set({ items: currentItems });

          set({
            error: error instanceof Error ? error.message : "Failed to update quantity",
            loading: false
          });
          throw error;
        }
      },

      removeItem: async (key) => {
        const currentItems = get().items;

        // Optimistic update
        const optimisticItems = currentItems.filter((item) => item.key !== key);

        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items: CartItem[] = await cartApiClient.removeCartItem(key);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          // Revert on error
          set({ items: currentItems });

          set({
            error: error instanceof Error ? error.message : "Failed to remove item",
            loading: false
          });
          throw error;
        }
      },

      clearCart: async () => {
        const currentItems = get().items;

        // Optimistic update
        set({ items: [], loading: true, error: null });

        try {
          await cartApiClient.emptyCart();
          set({ loading: false, lastSync: Date.now() });
        } catch (error) {
          // Revert on error
          set({ items: currentItems });

          set({
            error: error instanceof Error ? error.message : "Failed to clear cart",
            loading: false
          });
          throw error;
        }
      },

      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
        }, 0);
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          return sum + (isNaN(item.quantity) ? 0 : item.quantity);
        }, 0);
      },

      resetError: () => set({ error: null })
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        lastSync: state.lastSync
      })
    }
  )
);
