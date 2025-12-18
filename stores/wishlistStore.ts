import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WishlistItem } from "@/types/wishlist";
import { wishlistApiClient } from "@/lib/api/wishlistClient";
import { authApiClient } from "@/lib/api/authClient";

interface WishlistStore {
  items: WishlistItem[];
  guestItems: string[]; // Store only product IDs for guest users
  loading: boolean;
  error: string | null;
  lastSync: number | null;

  fetchWishlist: (force?: boolean) => Promise<void>;
  addItem: (productId: string, productDetails?: Partial<WishlistItem>) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  syncGuestWishlist: () => Promise<void>; // NEW: Sync guest items to server
  resetError: () => void;
  clearGuestItems: () => void; // NEW: Clear guest items after sync
}

const WISHLIST_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      guestItems: [],
      loading: false,
      error: null,
      lastSync: null,

      fetchWishlist: async (force = false) => {
        if (!authApiClient.isLoggedIn()) {
          // For guest users, show guest items as local wishlist
          set({ items: [], error: null });
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

      addItem: async (productId: string, productDetails?: Partial<WishlistItem>) => {
        const isLoggedIn = authApiClient.isLoggedIn();

        // GUEST USER: Add to local storage only
        if (!isLoggedIn) {
          const currentGuestItems = get().guestItems;

          // Check if already in guest wishlist
          if (currentGuestItems.includes(productId)) {
            set({ error: "Item already in wishlist" });
            return;
          }

          set({
            guestItems: [...currentGuestItems, productId],
            error: null
          });
          return;
        }

        // LOGGED IN USER: Add to server
        const currentItems = get().items;

        // Check if already in wishlist
        if (currentItems.some((item) => item.product_id === productId)) {
          set({ error: "Item already in wishlist" });
          return;
        }

        // Optimistic: Assume success and add immediately
        const optimisticItem: WishlistItem = {
          product_id: productId,
          name: productDetails?.name || "Loading...",
          price: productDetails?.price || 0,
          description: productDetails?.description || "",
          quantity: productDetails?.quantity || "0",
          price_formated: productDetails?.price_formated || "AED 0",
          image: productDetails?.image || "/placeholder.svg",
          model: productDetails?.model
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
        const isLoggedIn = authApiClient.isLoggedIn();

        // GUEST USER: Remove from local storage
        if (!isLoggedIn) {
          const currentGuestItems = get().guestItems;
          set({
            guestItems: currentGuestItems.filter((id) => id !== productId),
            error: null
          });
          return;
        }

        // LOGGED IN USER: Remove from server
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

      /**
       * Sync guest wishlist items to server after login/register
       * This should be called after successful login/register
       */
      syncGuestWishlist: async () => {
        const guestItems = get().guestItems;

        if (guestItems.length === 0) {
          return;
        }

        if (!authApiClient.isLoggedIn()) {
          console.warn("Cannot sync guest wishlist: User not logged in");
          return;
        }

        set({ loading: true, error: null });

        try {
          console.log(`🔄 Syncing ${guestItems.length} guest items to server...`);

          // Add each guest item to server wishlist
          for (const productId of guestItems) {
            try {
              await wishlistApiClient.addToWishlist(productId);
              console.log(`✅ Synced product ${productId}`);
            } catch (error) {
              console.error(`❌ Failed to sync product ${productId}:`, error);
              // Continue with other items even if one fails
            }
          }

          // Clear guest items after sync
          set({ guestItems: [] });

          // Fetch the updated wishlist from server
          await get().fetchWishlist(true);

          console.log("✅ Guest wishlist sync completed");
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to sync wishlist",
            loading: false
          });
        }
      },

      clearGuestItems: () => set({ guestItems: [] }),

      resetError: () => set({ error: null })
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        items: state.items,
        guestItems: state.guestItems, // Persist guest items
        lastSync: state.lastSync
      })
    }
  )
);
