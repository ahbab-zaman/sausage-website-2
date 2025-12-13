import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export function useCart() {
  const store = useCartStore();

  // Auto-fetch cart on mount
  useEffect(() => {
    store.fetchCart();
  }, []);

  return {
    // State
    items: store.items,
    loading: store.loading,
    error: store.error,

    // Actions
    addItem: store.addItem,
    updateQuantity: store.updateQuantity,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    fetchCart: store.fetchCart,
    resetError: store.resetError,

    // Computed values
    total: store.getTotal(),
    itemCount: store.getItemCount(),
    isEmpty: store.items.length === 0,

    // Utility functions
    isInCart: (productId: string) => {
      return store.items.some((item) => item.product_id === productId);
    },

    getItemByProductId: (productId: string) => {
      return store.items.find((item) => item.product_id === productId);
    }
  };
}
