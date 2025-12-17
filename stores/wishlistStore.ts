import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WishlistItem } from "@/types/wishlist";
import { wishlistApiClient } from "@/lib/api/wishlistClient";
import { authApiClient } from "@/lib/api/authClient";

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  lastSync: number | null;

  fetchWishlist: (force?: boolean) => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  resetError: () => void;
}

const WISHLIST_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastSync: null,

      fetchWishlist: async (force = false) => {
        if (!authApiClient.isLoggedIn()) {
          set({ items: [], error: "Please login to view your wishlist" });
          return;
        }

        const state = get();
        const now = Date.now();

        if (
          !force &&
          state.items.length > 0 &&
          state.lastSync &&
          now - state.lastSync < WISHLIST_STALE_TIME
        ) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const items = await wishlistApiClient.getWishlist();
          set({ items, loading: false, lastSync: now });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch wishlist",
            loading: false
          });
        }
      },

      addItem: async (productId: string) => {
        if (!authApiClient.isLoggedIn()) {
          set({ error: "Please login to manage your wishlist" });
          return;
        }

        const currentItems = get().items;

        // Optimistic: Assume success and add immediately
        const optimisticItem: WishlistItem = {
          product_id: productId,
          name: "Loading...",
          price: 0,
          description: "",
          quantity: "0",
          price_formated: "AED 0",
          image: "/placeholder.svg",
          model: undefined
        };

        const optimisticItems = [...currentItems, optimisticItem];
        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items = await wishlistApiClient.addToWishlist(productId);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          // Rollback on failure
          set({
            items: currentItems,
            error: error instanceof Error ? error.message : "Failed to add to wishlist",
            loading: false
          });
        }
      },

      removeItem: async (productId: string) => {
        if (!authApiClient.isLoggedIn()) {
          set({ error: "Please login to manage your wishlist" });
          return;
        }

        const currentItems = get().items;

        // Optimistic: Remove immediately
        const optimisticItems = currentItems.filter((item) => item.product_id !== productId);
        set({ items: optimisticItems, loading: true, error: null });

        try {
          const items = await wishlistApiClient.removeFromWishlist(productId);
          set({ items, loading: false, lastSync: Date.now() });
        } catch (error) {
          // Rollback on failure
          set({
            items: currentItems,
            error: error instanceof Error ? error.message : "Failed to remove from wishlist",
            loading: false
          });
        }
      },

      resetError: () => set({ error: null })
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        items: state.items,
        lastSync: state.lastSync
      })
    }
  )
);
