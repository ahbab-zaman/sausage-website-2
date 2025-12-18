import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";

export function useWishlist() {
  const wishlistStore = useWishlistStore();
  const authStore = useAuthStore();

  const fetchWishlist = wishlistStore.fetchWishlist;
  const syncGuestWishlist = wishlistStore.syncGuestWishlist;
  const customerId = authStore.user?.customer_id;
  const isAuthenticated = authStore.isAuthenticated();

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist().catch((err) => {
        console.error("Failed to fetch wishlist:", err);
      });
    }
  }, [customerId, fetchWishlist, isAuthenticated]);

  // Sync guest items when user logs in
  useEffect(() => {
    if (isAuthenticated && wishlistStore.guestItems.length > 0) {
      console.log("🔄 User logged in, syncing guest wishlist...");
      syncGuestWishlist().catch((err) => {
        console.error("Failed to sync guest wishlist:", err);
      });
    }
  }, [isAuthenticated, syncGuestWishlist]); // Trigger when auth state changes

  return {
    items: wishlistStore.items,
    guestItems: wishlistStore.guestItems,
    loading: wishlistStore.loading,
    error: wishlistStore.error,
    addItem: wishlistStore.addItem,
    removeItem: wishlistStore.removeItem,
    fetchWishlist: wishlistStore.fetchWishlist,
    syncGuestWishlist: wishlistStore.syncGuestWishlist,
    resetError: wishlistStore.resetError,
    isInWishlist: (productId: string) => {
      // Check both server items and guest items
      const isLoggedIn = authStore.isAuthenticated();

      if (isLoggedIn) {
        return wishlistStore.items.some((item) => item.product_id === productId);
      } else {
        return wishlistStore.guestItems.includes(productId);
      }
    },
    wishlistCount: () => {
      const isLoggedIn = authStore.isAuthenticated();
      return isLoggedIn ? wishlistStore.items.length : wishlistStore.guestItems.length;
    }
  };
}
