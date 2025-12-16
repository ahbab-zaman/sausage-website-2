import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { cartApiClient } from "@/lib/api/cartClient";
import { authApiClient } from "@/lib/api/authClient";

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastSync: number | null;

  fetchCart: (force?: boolean) => Promise<void>;
  addItem: (
    product: {
      id: string;
      name: string;
      price: number;
      image?: string;
      model?: string;
    },
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;

  getTotal: () => number;
  getItemCount: () => number;
  resetError: () => void;
}

const CART_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const BACKGROUND_REFRESH_TIME = 3 * 60 * 1000; // 3 minutes

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastSync: null,

      // Load server cart only when logged in
      fetchCart: async (force = false) => {
        if (!authApiClient.isLoggedIn()) {
          // Guest: nothing to fetch, just keep local data
          return;
        }

        const state = get();
        const now = Date.now();

        if (
          !force &&
          state.items.length > 0 &&
          state.lastSync &&
          now - state.lastSync < CART_STALE_TIME
        ) {
          if (now - state.lastSync > BACKGROUND_REFRESH_TIME) {
            cartApiClient
              .getCart()
              .then((items) => set({ items, lastSync: Date.now() }))
              .catch(() => {});
          }
          return;
        }

        if (state.items.length === 0) {
          set({ loading: true, error: null });
        }

        try {
          const items = await cartApiClient.getCart();
          set({ items, loading: false, lastSync: now });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch cart",
            loading: false
          });
        }
      },

      // Add item – works for guests & logged-in users
      addItem: async (product, quantity = 1) => {
        const isLoggedIn = authApiClient.isLoggedIn();

        // Guest mode: fully local
        if (!isLoggedIn) {
          const currentItems = get().items;
          const existing = currentItems.find((i) => i.product_id === product.id);

          let newItems: CartItem[];

          if (existing) {
            newItems = currentItems.map((i) =>
              i.product_id === product.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    total: i.price * (i.quantity + quantity)
                  }
                : i
            );
          } else {
            const newItem: CartItem = {
              id: product.id,
              key: `guest_${Date.now()}_${product.id}`,
              product_id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              total: product.price * quantity,
              image: product.image || "/placeholder.svg",
              model: product.model
            };
            newItems = [...currentItems, newItem];
          }

          set({ items: newItems, loading: false });
          return;
        }

        // Logged-in: server sync with optimistic update
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.product_id === product.id);

        if (existing) {
          return get().updateQuantity(existing.key, existing.quantity + quantity);
        }

        set({ loading: true, error: null });

        const tempItem: CartItem = {
          id: product.id,
          key: `temp_${Date.now()}`,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          total: product.price * quantity,
          image: product.image || "/placeholder.svg",
          model: product.model
        };

        set({ items: [...currentItems, tempItem] });

        try {
          const items = await cartApiClient.addToCart(product.id, quantity);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          set({ items: currentItems });
          set({
            error: error instanceof Error ? error.message : "Failed to add item",
            loading: false
          });
          throw error;
        }
      },

      // Update quantity
      updateQuantity: async (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);

        const isLoggedIn = authApiClient.isLoggedIn();

        if (!isLoggedIn) {
          // Guest: local update
          const currentItems = get().items;
          const newItems = currentItems.map((item) =>
            item.key === key ? { ...item, quantity, total: item.price * quantity } : item
          );
          set({ items: newItems });
          return;
        }

        // Logged-in: server sync
        const currentItems = get().items;
        const optimisticItems = currentItems.map((item) =>
          item.key === key ? { ...item, quantity, total: item.price * quantity } : item
        );

        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items = await cartApiClient.updateCartItem(key, quantity);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          set({ items: currentItems });
          set({
            error: error instanceof Error ? error.message : "Failed to update quantity",
            loading: false
          });
          throw error;
        }
      },

      // Remove item
      removeItem: async (key) => {
        const isLoggedIn = authApiClient.isLoggedIn();

        if (!isLoggedIn) {
          // Guest: local remove
          const currentItems = get().items;
          set({ items: currentItems.filter((item) => item.key !== key) });
          return;
        }

        // Logged-in: server sync
        const currentItems = get().items;
        const optimisticItems = currentItems.filter((item) => item.key !== key);

        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items = await cartApiClient.removeCartItem(key);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          set({ items: currentItems });
          set({
            error: error instanceof Error ? error.message : "Failed to remove item",
            loading: false
          });
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        const isLoggedIn = authApiClient.isLoggedIn();

        if (!isLoggedIn) {
          set({ items: [] });
          return;
        }

        const currentItems = get().items;
        set({ items: [], loading: true, error: null });

        try {
          await cartApiClient.emptyCart();
          set({ loading: false, lastSync: Date.now() });
        } catch (error) {
          set({ items: currentItems });
          set({
            error: error instanceof Error ? error.message : "Failed to clear cart",
            loading: false
          });
          throw error;
        }
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const total = item.price * item.quantity;
          return sum + (isNaN(total) ? 0 : total);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce(
          (sum, item) => sum + (isNaN(item.quantity) ? 0 : item.quantity),
          0
        );
      },

      resetError: () => set({ error: null })
    }),
    {
      name: "cart-storage", // persists in localStorage
      partialize: (state) => ({
        items: state.items,
        lastSync: state.lastSync
      })
    }
  )
);
