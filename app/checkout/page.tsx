"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  MapPin,
  CreditCard,
  Clock,
  AlertCircle,
  X,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
  CheckCircle,
  XCircle,
  MessageSquare
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddressStore } from "@/stores/addressStore";
import { useRouter } from "next/navigation";
import AddressModal from "@/components/AddressModal";

// Premium Notification Component
const PremiumNotification = ({
  type,
  message,
  onClose
}: {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-gradient-to-r from-green-500 to-emerald-600"
      : type === "error"
        ? "bg-gradient-to-r from-red-500 to-rose-600"
        : "bg-gradient-to-r from-blue-500 to-indigo-600";

  const Icon = type === "success" ? CheckCircle : type === "error" ? XCircle : AlertCircle;

  return (
    <div className="animate-slideInRight fixed top-4 right-4 z-[100]">
      <div className={`${bgColor} max-w-md min-w-[320px] rounded-2xl p-6 shadow-2xl`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-white/20 p-2">
              <Icon className="text-white" size={24} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-bold text-white">
              {type === "success" ? "Success!" : type === "error" ? "Error!" : "Notice"}
            </h3>
            <p className="text-sm text-white/90">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 transition-colors hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/20">
          <div className="animate-shrink h-full bg-white/50" />
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();

  // FIXED: Use actual stores instead of mock data
  const { items, getTotal, clearCart } = useCartStore();
  const checkout = useCheckoutStore();
  const addressStore = useAddressStore();

  // State management
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<any>(null);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{ id: number; type: "success" | "error" | "info"; message: string }>
  >([]);
  const [previousDate, setPreviousDate] = useState("");
  const [notificationQueue, setNotificationQueue] = useState<Set<string>>(new Set());

  // FIXED: Sync local state with store
  useEffect(() => {
    setSelectedPaymentMethod(checkout.selectedPaymentMethod);
    setSelectedShippingMethod(checkout.selectedShippingMethod);
  }, [checkout.selectedPaymentMethod, checkout.selectedShippingMethod]);

  // Auto redirect after success
  useEffect(() => {
    if (!showSuccessModal) return;

    let seconds = 5;
    const countdownElement = document.getElementById("countdown");
    if (countdownElement) countdownElement.textContent = seconds.toString();

    const timer = setInterval(() => {
      seconds--;
      if (countdownElement) countdownElement.textContent = seconds.toString();

      if (seconds <= 0) {
        clearInterval(timer);
        router.push("/profile?tab=orders");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showSuccessModal, router]);

  // Premium notification system - FIXED: Prevent duplicates
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    const key = `${type}-${message}`;

    // Prevent duplicate notifications
    if (notificationQueue.has(key)) return;

    setNotificationQueue((prev) => new Set(prev).add(key));
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Clear from queue after 5 seconds
    setTimeout(() => {
      setNotificationQueue((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // FIXED: Initialize checkout with actual API calls
  useEffect(() => {
    const initCheckout = async () => {
      setIsProcessing(true);

      const [shippingResult, addressResult] = await Promise.all([
        checkout.fetchShippingAddresses(),
        addressStore.getAllAddresses()
      ]);

      if (shippingResult.success) {
        showNotification("success", "Shipping addresses loaded successfully!");
      } else {
        showNotification("error", shippingResult.error || "Failed to load shipping addresses");
      }

      setIsProcessing(false);
    };

    initCheckout();
  }, []);

  // Address modal handlers
  const handleAddressSuccess = async () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    await checkout.fetchShippingAddresses();
    showNotification("success", "Address saved successfully!");
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteClick = (address: any) => {
    setAddressToDelete(address);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setDeletingAddressId(addressToDelete.address_id);
    const result = await addressStore.deleteAddress(addressToDelete.address_id);

    if (result.success) {
      showNotification("success", "Address deleted successfully!");
      await checkout.fetchShippingAddresses();
    } else {
      showNotification("error", result.error || "Failed to delete address");
    }

    setDeletingAddressId(null);
    setShowDeleteConfirmModal(false);
    setAddressToDelete(null);
  };

  // FIXED: Calculate shipping cost dynamically
  const getShippingCost = () => {
    if (!selectedShippingMethod || !checkout.shippingMethods.length) return 0;

    const method = checkout.shippingMethods.find((m) =>
      m.quote.some((q) => q.code === selectedShippingMethod)
    );

    if (method && method.quote.length > 0) {
      return method.quote[0].cost || 0;
    }

    return 0;
  };

  const subtotal = getTotal();
  const shippingCost = getShippingCost();
  const discount = checkout.couponCode ? 10 : 0;
  const total = subtotal + shippingCost - discount;

  const steps = [
    { number: 1, title: "Shipping Address", icon: MapPin },
    { number: 2, title: "Delivery Time", icon: Clock },
    { number: 3, title: "Payment Method", icon: CreditCard }
  ];

  const handleSelectAddress = async (addressId: string) => {
    setIsProcessing(true);
    const result = await checkout.setShippingAddress(addressId);

    if (result.success) {
      const methodsResult = await checkout.fetchPaymentMethods();
      if (methodsResult.success) {
        showNotification("success", "Shipping address selected successfully!");
        setCurrentStep(2);
      } else {
        showNotification("error", methodsResult.error || "Failed to load payment methods");
      }
    } else {
      showNotification("error", result.error || "Failed to set shipping address");
    }
    setIsProcessing(false);
  };

  const formatDateForBackend = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTimeSlot(null);

    if (date) {
      // FIXED: Clear time slots using store method
      checkout.clearTimeSlots();

      if (date === previousDate) {
        showNotification("info", "Refreshing time slots...");
      }

      setPreviousDate(date);
      setIsProcessing(true);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = await checkout.fetchTimeSlots(formatDateForBackend(date));

      if (result.success) {
        if (checkout.timeSlots.length > 0) {
          showNotification("success", `${checkout.timeSlots.length} time slots available!`);
        } else {
          showNotification("error", "No time slots available for this date");
        }
      } else {
        showNotification("error", result.error || "Failed to fetch time slots");
      }
      setIsProcessing(false);
    }
  };

  const handleSelectDateTime = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      showNotification("error", "Please select both date and time slot");
      return;
    }

    setIsProcessing(true);
    const result = await checkout.setDelivery(formatDateForBackend(selectedDate), selectedTimeSlot);

    if (result.success) {
      showNotification("success", "Delivery time set successfully!");
      setCurrentStep(3);
    } else {
      showNotification("error", result.error || "Failed to set delivery time");
    }
    setIsProcessing(false);
  };

  const handleSelectPayment = (paymentCode: string) => {
    setSelectedPaymentMethod(paymentCode);
    checkout.setPaymentMethod(paymentCode);
    showNotification("success", "Payment method selected");
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      showNotification("error", "Please enter a coupon code");
      return;
    }

    setIsProcessing(true);
    const result = await checkout.applyCoupon(couponInput);

    if (result.success) {
      showNotification("success", "Coupon applied successfully!");
      setCouponInput("");
    } else {
      showNotification("error", result.error || "Invalid coupon code");
    }
    setIsProcessing(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      showNotification("error", "Please select a payment method");
      return;
    }

    if (!selectedShippingMethod) {
      showNotification("error", "Please select a shipping method");
      return;
    }

    console.log("🚀 Starting order placement...");
    setIsProcessing(true);

    try {
      // Step 1: Set payment and shipping method with comment
      console.log("📝 Step 1: Setting payment and shipping method...");
      const paymentResult = await checkout.setPaymentAndShipping(
        selectedPaymentMethod,
        selectedShippingMethod,
        true,
        commentInput.trim() || undefined
      );

      if (!paymentResult.success) {
        showNotification("error", paymentResult.error || "Failed to set payment method");
        setIsProcessing(false);
        return;
      }

      showNotification("success", "Payment method configured!");

      // Step 2: Confirm the order
      console.log("📝 Step 2: Confirming order...");
      const confirmResult = await checkout.confirmOrder();

      if (!confirmResult.success) {
        showNotification("error", confirmResult.error || "Failed to confirm order");
        setIsProcessing(false);
        return;
      }

      console.log("✅ Order confirmed, Order ID:", confirmResult.orderId);
      showNotification("success", `Order #${confirmResult.orderId} created!`);

      // Step 3: Handle payment based on method
      if (selectedPaymentMethod === "cod") {
        console.log("💰 Payment Method: COD - Confirming payment...");
        const paymentConfirmResult = await checkout.confirmPayment();

        if (paymentConfirmResult.success) {
          console.log("✅ COD payment confirmed successfully");
          showNotification("success", "Order placed successfully!");

          // FIXED: Clear cart using actual store method
          await clearCart();

          setIsProcessing(false);
          setShowSuccessModal(true);
        } else {
          showNotification("error", paymentConfirmResult.error || "Failed to confirm payment");
          setIsProcessing(false);
        }
      } else if (
        selectedPaymentMethod === "paygcc_mpgs" ||
        selectedPaymentMethod === "googlepay" ||
        selectedPaymentMethod === "samsungpay"
      ) {
        console.log("💳 Payment Method: Online - Redirecting to payment gateway...");
        showNotification("info", "Redirecting to payment gateway...");

        const payOnlineResult = await checkout.payOnline();

        if (payOnlineResult.success) {
          console.log("✅ Payment gateway opened");

          const handlePaymentMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === "PAYMENT_COMPLETE") {
              console.log("💳 Payment completed, confirming...");

              const paymentConfirmResult = await checkout.confirmPayment();

              if (paymentConfirmResult.success) {
                console.log("✅ Payment confirmed successfully");
                showNotification("success", "Payment completed successfully!");

                // FIXED: Clear cart using actual store method
                await clearCart();

                setIsProcessing(false);
                setShowSuccessModal(true);
              } else {
                showNotification("error", "Payment confirmation failed");
                setIsProcessing(false);
              }

              window.removeEventListener("message", handlePaymentMessage);
            } else if (event.data.type === "PAYMENT_FAILED") {
              showNotification("error", "Payment failed. Please try again.");
              setIsProcessing(false);
              window.removeEventListener("message", handlePaymentMessage);
            }
          };

          window.addEventListener("message", handlePaymentMessage);

          setTimeout(() => {
            window.removeEventListener("message", handlePaymentMessage);
          }, 900000);
        } else {
          showNotification("error", payOnlineResult.error || "Failed to open payment gateway");
          setIsProcessing(false);
        }
      } else {
        showNotification("error", "Payment method not yet implemented");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("❌ Order placement error:", error);
      showNotification("error", "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      {/* Premium Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-3">
        {notifications.map((notification) => (
          <PremiumNotification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.number < currentStep;
              const isActive = step.number === currentStep;
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "scale-110 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : isActive
                            ? "scale-110 bg-gradient-to-r from-black to-gray-800 text-white shadow-lg"
                            : "bg-gray-300 text-gray-600"
                      }`}>
                      {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${isActive ? "text-black" : "text-gray-600"}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 w-24 rounded-full transition-all duration-300 ${
                        step.number < currentStep
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center text-2xl font-bold text-gray-900">
                    <MapPin className="mr-3 text-black" size={28} />
                    Select Shipping Address
                  </h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressModal(true);
                    }}
                    className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-black to-gray-800 px-4 py-2 font-medium text-white transition-all hover:shadow-lg">
                    <Plus size={20} />
                    <span>Add New</span>
                  </button>
                </div>

                {checkout.isLoading || isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="mb-4 animate-spin text-black" size={40} />
                    <p className="text-gray-600">Loading addresses...</p>
                  </div>
                ) : checkout.shippingAddresses.length === 0 ? (
                  <div className="py-12 text-center">
                    <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="mb-4 text-gray-600">No shipping addresses found</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900">
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {checkout.shippingAddresses.map((address) => (
                      <div
                        key={address.address_id}
                        className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
                          checkout.selectedAddressId === address.address_id
                            ? "scale-105 transform border-black bg-gradient-to-r from-black to-gray-800 text-white shadow-xl"
                            : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md"
                        }`}>
                        <button
                          onClick={() => handleSelectAddress(address.address_id)}
                          disabled={isProcessing || deletingAddressId === address.address_id}
                          className="w-full text-left">
                          <div className="mb-3 flex items-start justify-between">
                            <span className="text-lg font-bold">{address.name}</span>
                            {address.default === 1 && (
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  checkout.selectedAddressId === address.address_id
                                    ? "bg-white text-black"
                                    : "bg-black text-white"
                                }`}>
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mb-1 text-sm">{address.address_1}</p>
                          {address.address_2 && <p className="mb-1 text-sm">{address.address_2}</p>}
                          <p className="mb-1 text-sm">
                            {address.road}, {address.area}
                          </p>
                          {address.landmark && (
                            <p className="mb-1 text-sm">Near: {address.landmark}</p>
                          )}
                          <p className="mt-3 text-sm font-medium">
                            {address.mobile_country_code} {address.mobile}
                          </p>
                        </button>

                        <div className="mt-4 flex items-center space-x-2 border-t border-gray-200 pt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            disabled={isProcessing || deletingAddressId === address.address_id}
                            className={`flex flex-1 items-center justify-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              checkout.selectedAddressId === address.address_id
                                ? "bg-white text-black hover:bg-gray-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}>
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(address);
                            }}
                            disabled={isProcessing || deletingAddressId === address.address_id}
                            className={`flex flex-1 items-center justify-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              checkout.selectedAddressId === address.address_id
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}>
                            {deletingAddressId === address.address_id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery Time */}
            {currentStep === 2 && (
              <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
                  <Clock className="mr-3 text-black" size={28} />
                  Choose Delivery Time
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={isProcessing}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20 disabled:bg-gray-100"
                    />
                  </div>

                  {isProcessing && selectedDate ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="mb-4 animate-spin text-black" size={32} />
                      <p className="text-gray-600">Loading time slots...</p>
                    </div>
                  ) : checkout.timeSlots.length > 0 ? (
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        Select Time Slot ({checkout.timeSlots.length} available)
                      </label>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {checkout.timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedTimeSlot(slot.id)}
                            disabled={!slot.available || isProcessing}
                            className={`rounded-xl border-2 p-4 text-left transition-all duration-300 disabled:opacity-50 ${
                              !slot.available
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : selectedTimeSlot === slot.id
                                  ? "scale-105 transform border-black bg-gradient-to-r from-black to-gray-800 text-white shadow-lg"
                                  : "border-gray-300 bg-white hover:border-gray-500 hover:shadow-md"
                            }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{slot.time}</span>
                              {slot.available ? (
                                selectedTimeSlot === slot.id && <Check size={20} />
                              ) : (
                                <span className="text-xs">Not Available</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    selectedDate && (
                      <div className="py-8 text-center text-gray-600">
                        <AlertCircle className="mx-auto mb-2 text-orange-500" size={32} />
                        <p className="font-medium">No time slots available for this date</p>
                        <p className="mt-2 text-sm">Please try selecting a different date</p>
                      </div>
                    )
                  )}

                  <button
                    onClick={handleSelectDateTime}
                    disabled={!selectedDate || !selectedTimeSlot || isProcessing}
                    className="mt-6 flex w-full transform items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-6 py-4 font-bold text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
                  <CreditCard className="mr-3 text-black" size={28} />
                  Select Payment Method
                </h2>

                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    {checkout.paymentMethods.map((method) => (
                      <button
                        key={method.code}
                        onClick={() => handleSelectPayment(method.code)}
                        disabled={isProcessing}
                        className={`w-full transform rounded-xl border-2 p-5 text-left transition-all duration-300 hover:scale-102 disabled:opacity-50 ${
                          selectedPaymentMethod === method.code
                            ? "border-black bg-gradient-to-r from-black to-gray-800 text-white shadow-xl"
                            : "border-gray-300 bg-white hover:border-gray-500 hover:shadow-md"
                        }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard size={24} />
                            <span className="text-lg font-medium">{method.title}</span>
                          </div>
                          {selectedPaymentMethod === method.code && <Check size={24} />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Comment Section */}
                  <div>
                    <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                      <MessageSquare className="mr-2" size={18} />
                      Order Comments (Optional)
                    </label>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add any special instructions for your order..."
                      rows={3}
                      className="w-full resize-none rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  {/* Selected Payment Confirmation */}
                  {selectedPaymentMethod && (
                    <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-sm font-medium text-green-700">
                          Payment method selected:{" "}
                          <strong>
                            {
                              checkout.paymentMethods.find((m) => m.code === selectedPaymentMethod)
                                ?.title
                            }
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={!selectedPaymentMethod || isProcessing}
                    className="hover:scale-105disabled:to-gray-400 flex w-full transform items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-2xl disabled:cursor-not-allowed">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Processing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Order Summary</h3>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`cart-item-${item.id}-${item.key || item.product_id}`}
                    className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4 border-b border-gray-200 pb-4">
                {!checkout.couponCode ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || isProcessing}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:bg-gray-300">
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-green-700">
                        {checkout.couponCode} applied
                      </span>
                    </div>
                    <button
                      onClick={checkout.removeCoupon}
                      className="text-red-500 hover:text-red-700">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "TBD" : `${shippingCost}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="animate-fadeIn fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="animate-slideUp w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>

            <h3 className="mb-2 text-center text-xl font-bold text-gray-900">Delete Address?</h3>
            <p className="mb-2 text-center text-gray-600">
              Are you sure you want to delete this address?
            </p>
            {addressToDelete && (
              <p className="mb-6 text-center text-sm font-medium text-gray-700">
                "{addressToDelete.name}"
              </p>
            )}
            <p className="mb-6 text-center text-sm text-gray-500">This action cannot be undone.</p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setAddressToDelete(null);
                }}
                disabled={deletingAddressId !== null}
                className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingAddressId !== null}
                className="flex flex-1 items-center justify-center rounded-xl bg-black px-6 py-3 font-bold text-white transition-all disabled:bg-gray-400">
                {deletingAddressId !== null ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Success Modal - White Theme */}
      {showSuccessModal && (
        <div className="animate-fadeIn fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
          <div className="animate-modalScaleIn relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Elegant top accent bar */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

            <div className="px-8 pt-12 pb-10 text-center">
              {/* Large Success Check with subtle ring */}
              <div className="mx-auto mb-8 inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl ring-8 ring-emerald-500/20">
                <Check className="h-14 w-14 text-white" strokeWidth={3} />
              </div>

              <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900">
                Order Confirmed!
              </h2>

              <p className="mx-auto mb-10 max-w-sm text-lg leading-relaxed text-gray-600">
                Thank you for your purchase. Your order has been successfully placed and is being
                prepared with care.
              </p>

              {/* Countdown */}
              <p className="mb-12 text-sm text-gray-500">
                Redirecting to your orders in{" "}
                <span className="font-semibold text-emerald-600" id="countdown">
                  5
                </span>{" "}
                seconds...
              </p>

              {/* Black Button with White Text */}
              <button
                onClick={() => router.push("/profile?tab=orders")}
                className="w-full rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-gray-900 hover:shadow-xl active:scale-98">
                View My Orders
              </button>

              <p className="mt-6 text-xs text-gray-400">
                You’ll be automatically redirected shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        editAddress={editingAddress}
        onSuccess={handleAddressSuccess}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-modalScaleIn {
          animation: modalScaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
