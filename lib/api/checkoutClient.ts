import { API_CONFIG } from "./config";
import {
  ShippingAddressResponse,
  PaymentMethodsResponse,
  TimeSlotResponse,
  SetPaymentMethodRequest,
  DeliveryRequest,
  ConfirmOrderRequest,
  OrderConfirmationResponse,
  PayOnlineResponse
} from "@/types/checkout";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface BackendApiResponse<T> {
  success: number;
  error: string[];
  data?: T;
}

class CheckoutApiClient {
  private baseUrl = API_CONFIG.BASE_URL;

  private async getClientToken(): Promise<string> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token");
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      return token;
    }
    throw new Error("Cannot access localStorage");
  }

  private normalizeResponse<T>(backendRes: BackendApiResponse<T>): ApiResponse<T> {
    return {
      success: backendRes.success === 1,
      data: backendRes.data,
      error: backendRes.error?.length > 0 ? backendRes.error.join(", ") : undefined
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: "Unauthorized - Session expired" };
        }
        return { success: false, error: `HTTP error ${res.status}` };
      }

      const backendRes: BackendApiResponse<T> = await res.json();
      return this.normalizeResponse(backendRes);
    } catch (err: any) {
      console.error("Request error:", err);
      return { success: false, error: err.message || "Request failed" };
    }
  }

  private async requestFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, error: "Unauthorized - Session expired" };
        }
        return { success: false, error: `HTTP error ${res.status}` };
      }

      const backendRes: BackendApiResponse<T> = await res.json();
      return this.normalizeResponse(backendRes);
    } catch (err: any) {
      console.error("Request error:", err);
      return { success: false, error: err.message || "Request failed" };
    }
  }

  // Get shipping addresses
  async getShippingAddresses(): Promise<ApiResponse<ShippingAddressResponse>> {
    return this.request<ShippingAddressResponse>(
      "/index.php?route=rest/shipping_address/shippingaddress",
      { method: "GET" }
    );
  }

  // Set shipping address
  async setShippingAddress(addressId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("address_id", addressId);

    return this.requestFormData<any>(
      "/index.php?route=rest/shipping_address/shippingaddress&existing=1",
      formData
    );
  }

  // Get payment and shipping methods (must be called after setting shipping address)
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethodsResponse>> {
    return this.request<PaymentMethodsResponse>("/index.php?route=rest/payment_method/payments", {
      method: "GET"
    });
  }

  // Set payment and shipping method
  async setPaymentMethod(data: SetPaymentMethodRequest): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("shipping_method", data.shipping_method);
    formData.append("payment_method", data.payment_method);
    formData.append("agree", data.agree);
    if (data.comment) {
      formData.append("comment", data.comment);
    }

    return this.requestFormData<any>("/index.php?route=rest/payment_method/payments", formData);
  }

  // Get time slots for a date (format: DD-MM-YYYY)
  async getTimeSlots(date: string): Promise<ApiResponse<TimeSlotResponse>> {
    const formData = new FormData();
    formData.append("date", date);

    return this.requestFormData<TimeSlotResponse>(
      "/index.php?route=rest/cart/time_slots",
      formData
    );
  }

  // Set delivery date and time
  async setDelivery(data: DeliveryRequest): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("delivery_date", data.delivery_date);
    formData.append("delivery_time", data.delivery_time);

    return this.requestFormData<any>("/index.php?route=rest/cart/delivery", formData);
  }

  // Apply coupon
  async applyCoupon(coupon: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("coupon", coupon);

    return this.requestFormData<any>("/index.php?route=rest/cart/coupon", formData);
  }

  // Remove coupon
  async removeCoupon(): Promise<ApiResponse<any>> {
    return this.request<any>("/index.php?route=rest/cart/coupon", {
      method: "DELETE"
    });
  }

  // Confirm order (after payment method is set)
  async confirmOrder(data?: ConfirmOrderRequest): Promise<ApiResponse<OrderConfirmationResponse>> {
    const formData = new FormData();
    if (data?.device_type) {
      formData.append("device_type", data.device_type);
    }
    if (data?.device_version) {
      formData.append("device_version", data.device_version);
    }

    return this.requestFormData<OrderConfirmationResponse>(
      "/index.php?route=rest/confirm/confirm",
      formData
    );
  }

  // Payment success confirmation (PUT method)
  async confirmPayment(): Promise<ApiResponse<any>> {
    return this.request<any>("/index.php?route=rest/confirm/confirm", {
      method: "PUT"
    });
  }

  // Pay online - Get payment gateway HTML
  async payOnline(): Promise<ApiResponse<any>> {
    try {
      const token = await this.getClientToken();

      const res = await fetch(`${this.baseUrl}/index.php?route=rest/confirm/confirm&page=pay`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        return { success: false, error: `HTTP error ${res.status}` };
      }

      // For pay online, we get HTML content
      const htmlContent = await res.text();

      return {
        success: true,
        data: { html_content: htmlContent }
      };
    } catch (err: any) {
      console.error("Pay online error:", err);
      return { success: false, error: err.message || "Failed to load payment page" };
    }
  }
}

export const checkoutApiClient = new CheckoutApiClient();
