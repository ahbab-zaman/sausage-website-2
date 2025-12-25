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
  setPaymentMethod: (paymentMethod: string) => void;
  setPaymentAndShipping: (
    paymentMethod: string,
    shippingMethod: string,
    agree: boolean,
    comment?: string
  ) => Promise<{ success: boolean; error?: string }>;
  setShippingMethod: (shippingMethod: string) => Promise<{ success: boolean }>;
  fetchTimeSlots: (date: string) => Promise<{ success: boolean; error?: string }>;
  setDelivery: (date: string, time: string) => Promise<{ success: boolean; error?: string }>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => Promise<{ success: boolean; error?: string }>;
  confirmOrder: () => Promise<{ success: boolean; error?: string; orderId?: string }>;
  payOnline: () => Promise<{ success: boolean; error?: string; htmlContent?: string }>;
  confirmPayment: () => Promise<{ success: boolean; error?: string }>;
  setError: (error: string) => void;
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
        const shippingMethods = res.data.shipping_methods || [];
        const flattenedMethods: ShippingMethod[] = [];

        // Flatten shipping methods
        shippingMethods.forEach((method: any) => {
          if (method.quote && Array.isArray(method.quote)) {
            method.quote.forEach((quote: any) => {
              flattenedMethods.push({
                title: quote.title,
                quote: [quote],
                sort_order: method.sort_order,
                error: method.error || false
              });
            });
          }
        });

        set({
          paymentMethods: res.data.payment_methods || [],
          shippingMethods: flattenedMethods,
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

  // NEW: Separate method to set shipping method
  setShippingMethod: async (shippingMethod) => {
    set({ selectedShippingMethod: shippingMethod });
    return { success: true };
  },

  // NEW: Simple method to set payment method (local state only, no API call)
  setPaymentMethod: (paymentMethod) => {
    set({ selectedPaymentMethod: paymentMethod, error: null });
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
          isLoading: false,
          error: null
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
        const slots: TimeSlot[] = (res.data.time || []).map(
          (timeString: string, index: number) => ({
            id: timeString,
            time: timeString,
            available: true
          })
        );

        set({
          timeSlots: slots,
          selectedDate: date,
          selectedTimeSlot: null,
          isLoading: false,
          error: null
        });
        return { success: true };
      }

      const errMsg = res.error || "No time slots available for this date";
      set({ error: errMsg, isLoading: false, timeSlots: [], selectedTimeSlot: null });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to fetch time slots";
      set({ error: errMsg, isLoading: false, timeSlots: [], selectedTimeSlot: null });
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

      const errMsg = res.error || "Invalid coupon code";
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

  payOnline: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.payOnline();

      if (res.success && res.data) {
        set({ isLoading: false });
        return { success: true, htmlContent: res.data.html_content };
      }

      const errMsg = res.error || "Failed to load payment page";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to load payment page";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  confirmPayment: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await checkoutApiClient.confirmPayment();

      if (res.success) {
        set({ isLoading: false });
        return { success: true };
      }

      const errMsg = res.error || "Failed to confirm payment";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to confirm payment";
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  // NEW: Method to set error from outside the store
  setError: (error) => set({ error }),

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
