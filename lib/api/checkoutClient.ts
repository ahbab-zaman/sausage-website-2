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
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5000; // 5 seconds cache to prevent duplicate requests

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

  // FIXED: Clear cache for specific endpoint
  private clearCache(endpoint: string) {
    const keysToDelete: string[] = [];
    this.requestCache.forEach((_, key) => {
      if (key.includes(endpoint)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.requestCache.delete(key));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getClientToken();
      const cacheKey = `${endpoint}-${JSON.stringify(options)}`;

      // Check cache if enabled
      if (useCache) {
        const cached = this.requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
          console.log("📦 Using cached response for:", endpoint);
          return cached.data;
        }
      }

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
      const normalizedResponse = this.normalizeResponse(backendRes);

      // Cache successful responses
      if (useCache && normalizedResponse.success) {
        this.requestCache.set(cacheKey, {
          data: normalizedResponse,
          timestamp: Date.now()
        });
      }

      return normalizedResponse;
    } catch (err: any) {
      console.error("Request error:", err);
      return { success: false, error: err.message || "Request failed" };
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    useCache: boolean = false
  ): Promise<ApiResponse<T>> {
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
      { method: "GET" },
      true // Use cache
    );
  }

  // Set shipping address
  async setShippingAddress(addressId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("address_id", addressId);

    // Clear cache when setting new address
    this.clearCache("shipping_address");
    this.clearCache("payment_method");

    return this.requestFormData<any>(
      "/index.php?route=rest/shipping_address/shippingaddress&existing=1",
      formData
    );
  }

  // Get payment and shipping methods
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

    console.log("📤 Setting payment method:", {
      shipping_method: data.shipping_method,
      payment_method: data.payment_method,
      comment: data.comment,
      agree: data.agree
    });

    return this.requestFormData<any>("/index.php?route=rest/payment_method/payments", formData);
  }

  // FIXED: Get time slots with cache busting
  async getTimeSlots(date: string): Promise<ApiResponse<TimeSlotResponse>> {
    const formData = new FormData();
    formData.append("date", date);

    // Add timestamp to prevent caching issues
    formData.append("_t", Date.now().toString());

    // Clear previous time slot cache
    this.clearCache("time_slots");

    console.log("📅 Fetching time slots for date:", date);

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

    console.log("🚚 Setting delivery:", data);

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

  // Confirm order
  async confirmOrder(data?: ConfirmOrderRequest): Promise<ApiResponse<OrderConfirmationResponse>> {
    const formData = new FormData();
    if (data?.device_type) {
      formData.append("device_type", data.device_type);
    }
    if (data?.device_version) {
      formData.append("device_version", data.device_version);
    }

    console.log("✅ Confirming order...");

    return this.requestFormData<OrderConfirmationResponse>(
      "/index.php?route=rest/confirm/confirm",
      formData
    );
  }

  // Payment success confirmation (PUT method)
  async confirmPayment(): Promise<ApiResponse<any>> {
    console.log("💳 Confirming payment...");

    return this.request<any>("/index.php?route=rest/confirm/confirm", {
      method: "PUT"
    });
  }

  /**
   * FIXED: Pay online - Proper redirect with authentication
   * Opens payment gateway in new window with proper token handling
   */
  async payOnline(): Promise<ApiResponse<any>> {
    try {
      const token = await this.getClientToken();
      const paymentUrl = `${this.baseUrl}/index.php?route=rest/confirm/confirm&page=pay`;

      console.log("🔗 Opening payment gateway:", paymentUrl);

      // Create a form to POST with authentication
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.target = "payment_window"; // Named window
      form.style.display = "none";

      // Add authorization token as hidden input
      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "Authorization";
      tokenInput.value = `Bearer ${token}`;
      form.appendChild(tokenInput);

      document.body.appendChild(form);

      // Open new window with specific dimensions
      const paymentWindow = window.open(
        "",
        "payment_window",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!paymentWindow) {
        document.body.removeChild(form);
        return {
          success: false,
          error: "Please allow popups for payment processing"
        };
      }

      // Submit form to new window
      form.submit();
      document.body.removeChild(form);

      // Setup message listener for payment completion
      const messageHandler = (event: MessageEvent) => {
        // Validate origin for security
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "PAYMENT_COMPLETE") {
          console.log("✅ Payment completed in gateway");
          window.removeEventListener("message", messageHandler);

          // Payment will be confirmed by the component
        } else if (event.data.type === "PAYMENT_FAILED") {
          console.error("❌ Payment failed in gateway");
          window.removeEventListener("message", messageHandler);
        }
      };

      window.addEventListener("message", messageHandler);

      // Timeout after 15 minutes
      setTimeout(() => {
        window.removeEventListener("message", messageHandler);
      }, 900000);

      return {
        success: true,
        data: {
          message: "Payment gateway opened. Complete your payment in the new window."
        }
      };
    } catch (err: any) {
      console.error("Pay online error:", err);
      return { success: false, error: err.message || "Failed to open payment gateway" };
    }
  }

  /**
   * Alternative: Full page redirect (if popup doesn't work)
   */
  async payOnlineRedirect(): Promise<ApiResponse<any>> {
    try {
      const token = await this.getClientToken();

      // Store token in sessionStorage for return
      sessionStorage.setItem("payment_token", token);
      sessionStorage.setItem("payment_return_url", window.location.href);

      const paymentUrl = `${this.baseUrl}/index.php?route=rest/confirm/confirm&page=pay`;

      console.log("🔗 Redirecting to payment gateway:", paymentUrl);

      // Full page redirect
      window.location.href = paymentUrl;

      return {
        success: true,
        data: { message: "Redirecting to payment gateway..." }
      };
    } catch (err: any) {
      console.error("Redirect error:", err);
      return { success: false, error: err.message || "Failed to redirect" };
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.requestCache.clear();
    console.log("🧹 All caches cleared");
  }
}

export const checkoutApiClient = new CheckoutApiClient();
