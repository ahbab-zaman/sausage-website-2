// stores/checkoutStore.ts

import { create } from "zustand";
import { checkoutApiClient } from "@/lib/api/checkoutClient";
import { ShippingAddress, PaymentMethod, ShippingMethod, TimeSlot } from "@/types/checkout";

interface CheckoutStore {
  // State
  shippingAddresses: ShippingAddress[];
  selectedAddressId: string | null;
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  selectedPaymentMethod: string | null;
  selectedShippingMethod: string | null;
  timeSlots: TimeSlot[];
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  couponCode: string | null;
  comment: string;
  isLoading: boolean;
  error: string | null;
  orderId: string | null;

  // Actions
  fetchShippingAddresses: () => Promise<{ success: boolean; error?: string }>;
  setShippingAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  fetchPaymentMethods: () => Promise<{ success: boolean; error?: string }>;
  setPaymentAndShipping: (
    paymentMethod: string,
    shippingMethod: string,
    agree: boolean,
    comment?: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchTimeSlots: (date: string) => Promise<{ success: boolean; error?: string }>;
  setDelivery: (date: string, time: string) => Promise<{ success: boolean; error?: string }>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => Promise<{ success: boolean; error?: string }>;
  confirmOrder: () => Promise<{ success: boolean; error?: string; orderId?: string }>;
  clearError: () => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  // Initial state
  shippingAddresses: [],
  selectedAddressId: null,
  paymentMethods: [],
  shippingMethods: [],
  selectedPaymentMethod: null,
  selectedShippingMethod: null,
  timeSlots: [],
  selectedDate: null,
  selectedTimeSlot: null,
  couponCode: null,
  comment: "",
  isLoading: false,
  error: null,
  orderId: null,

  fetchShippingAddresses: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.getShippingAddresses();

      if (res.success && res.data) {
        set({
          shippingAddresses: res.data.addresses || [],
          selectedAddressId: res.data.address_id !== "0" ? res.data.address_id : null,
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to fetch addresses";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch addresses";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  setShippingAddress: async (addressId) => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.setShippingAddress(addressId);

      if (res.success) {
        set({ selectedAddressId: addressId, isLoading: false });
        return { success: true };
      }

      const errMsg = res.error || "Failed to set shipping address";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to set shipping address";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchPaymentMethods: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.getPaymentMethods();

      if (res.success && res.data) {
        set({
          paymentMethods: res.data.payment_methods || [],
          shippingMethods: res.data.shipping_methods || [],
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to fetch payment methods";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch payment methods";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  setPaymentAndShipping: async (paymentMethod, shippingMethod, agree, comment) => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.setPaymentMethod({
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        agree: agree ? "1" : "0",
        comment: comment || ""
      });

      if (res.success) {
        set({
          selectedPaymentMethod: paymentMethod,
          selectedShippingMethod: shippingMethod,
          comment: comment || "",
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to set payment method";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to set payment method";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  fetchTimeSlots: async (date) => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.getTimeSlots(date);

      if (res.success && res.data) {
        set({
          timeSlots: res.data.time || [],
          selectedDate: date,
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to fetch time slots";
      set({ error: errMsg, isLoading: false, timeSlots: [] });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch time slots";
      set({ error: errMsg, isLoading: false, timeSlots: [] });
      return { success: false, error: errMsg };
    }
  },

  setDelivery: async (date, time) => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.setDelivery({
        delivery_date: date,
        delivery_time: time
      });

      if (res.success) {
        set({
          selectedDate: date,
          selectedTimeSlot: time,
          isLoading: false
        });
        return { success: true };
      }

      const errMsg = res.error || "Failed to set delivery";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to set delivery";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  applyCoupon: async (code) => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.applyCoupon(code);

      if (res.success) {
        set({ couponCode: code, isLoading: false });
        return { success: true };
      }

      const errMsg = res.error || "Failed to apply coupon";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to apply coupon";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.removeCoupon();

      if (res.success) {
        set({ couponCode: null, isLoading: false });
        return { success: true };
      }

      const errMsg = res.error || "Failed to remove coupon";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to remove coupon";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  confirmOrder: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.confirmOrder({
        device_type: "web",
        device_version: "1.0.0"
      });

      if (res.success && res.data) {
        set({
          orderId: res.data.order_id,
          isLoading: false
        });
        return { success: true, orderId: res.data.order_id };
      }

      const errMsg = res.error || "Failed to confirm order";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to confirm order";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      selectedAddressId: null,
      selectedPaymentMethod: null,
      selectedShippingMethod: null,
      selectedDate: null,
      selectedTimeSlot: null,
      couponCode: null,
      comment: "",
      error: null,
      orderId: null
    })
}));
