import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";

export function useWishlist() {
  const wishlistStore = useWishlistStore();
  const authStore = useAuthStore();

  // FIX: Extract only the function we need, not the entire store
  const fetchWishlist = wishlistStore.fetchWishlist;
  const customerId = authStore.user?.customer_id;

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      fetchWishlist().catch((err) => {
        console.error("Failed to fetch wishlist:", err);
      });
    }
  }, [customerId, fetchWishlist]); // Only depend on customer ID and the function

  return {
    items: wishlistStore.items,
    loading: wishlistStore.loading,
    error: wishlistStore.error,
    addItem: wishlistStore.addItem,
    removeItem: wishlistStore.removeItem,
    fetchWishlist: wishlistStore.fetchWishlist,
    resetError: wishlistStore.resetError,
    isInWishlist: (productId: string) =>
      wishlistStore.items.some((item) => item.product_id === productId)
  };
}
