import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

export function useCart() {
  const cartStore = useCartStore();
  const authStore = useAuthStore();

  // Auto-fetch cart when user is authenticated
  useEffect(() => {
    // Only fetch if user is authenticated
    if (authStore.isAuthenticated()) {
      console.log("🛒 Auto-fetching cart for authenticated user");
      cartStore.fetchCart().catch((err) => {
        console.error("Failed to fetch cart:", err);
      });
    } else {
      console.log("⚠️ User not authenticated, skipping cart fetch");
    }
  }, [authStore.user?.customer_id]); // Re-fetch when user changes

  return {
    // State
    items: cartStore.items,
    loading: cartStore.loading,
    error: cartStore.error,

    // Actions
    addItem: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
    fetchCart: cartStore.fetchCart,
    resetError: cartStore.resetError,

    // Computed values
    total: cartStore.getTotal(),
    itemCount: cartStore.getItemCount(),
    isEmpty: cartStore.items.length === 0,

    // Auth-aware flag
    isAuthenticated: authStore.isAuthenticated(),

    // Utility functions
    isInCart: (productId: string) => {
      return cartStore.items.some((item) => item.product_id === productId);
    },

    getItemByProductId: (productId: string) => {
      return cartStore.items.find((item) => item.product_id === productId);
    },

    // Get item quantity by product ID
    getItemQuantity: (productId: string) => {
      const item = cartStore.items.find((item) => item.product_id === productId);
      return item?.quantity || 0;
    }
  };
}
