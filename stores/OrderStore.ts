// stores/orderStore.ts

import { create } from "zustand";
import { orderApiClient } from "@/lib/api/orderClient";
import { OrderListItem, OrderDetail } from "@/types/orders";

interface OrderStore {
  orders: OrderListItem[];
  selectedOrder: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  fetchOrders: (page?: number, limit?: number) => Promise<{ success: boolean; error?: string }>;
  fetchOrderDetail: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  clearSelectedOrder: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  fetchOrders: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const res = await orderApiClient.getOrderList(limit, page);

      if (res.success && res.data) {
        set({
          orders: page === 1 ? res.data : [...get().orders, ...res.data],
          currentPage: page,
          hasMore: res.data.length === limit,
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to fetch orders";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch orders";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchOrderDetail: async (orderId) => {
    set({ isLoading: true, error: null });

    try {
      const res = await orderApiClient.getOrderDetail(orderId);

      if (res.success && res.data) {
        set({
          selectedOrder: res.data,
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to fetch order details";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch order details";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  clearSelectedOrder: () => set({ selectedOrder: null }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      orders: [],
      selectedOrder: null,
      error: null,
      currentPage: 1,
      hasMore: true
    })
}));
