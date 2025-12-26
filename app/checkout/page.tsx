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
  Tag
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddressStore } from "@/stores/addressStore";
import { useRouter } from "next/navigation";
import AddressModal from "@/components/AddressModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const checkout = useCheckoutStore();
  const addressStore = useAddressStore();

  // Subscribe to store values - FIXED: Added state subscription
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const paymentMethods = useCheckoutStore((state) => state.paymentMethods);

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<any>(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // FIXED: Sync local state with store
  useEffect(() => {
    setSelectedPaymentMethod(checkout.selectedPaymentMethod);
    setSelectedShippingMethod(checkout.selectedShippingMethod);
  }, [checkout.selectedPaymentMethod, checkout.selectedShippingMethod]);

  useEffect(() => {
    const initCheckout = async () => {
      await Promise.all([checkout.fetchShippingAddresses(), addressStore.getAllAddresses()]);
    };
    initCheckout();
  }, []);

  const handleAddressSuccess = async () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    await checkout.fetchShippingAddresses();
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
      await checkout.fetchShippingAddresses();
    }
    setDeletingAddressId(null);
    setShowDeleteConfirmModal(false);
    setAddressToDelete(null);
  };

  const subtotal = getTotal();
  const shippingCost = selectedShippingMethod ? 5.99 : 0;
  const discount = checkout.couponCode ? 10 : 0;
  const total = subtotal + shippingCost - discount;

  const steps = [
    { number: 1, title: "Shipping Address", icon: MapPin },
    { number: 2, title: "Delivery Time", icon: Clock },
    { number: 3, title: "Payment Method", icon: CreditCard }
  ];

  const handleSelectAddress = async (addressId: any) => {
    setIsProcessing(true);
    const result = await checkout.setShippingAddress(addressId);
    if (result.success) {
      const methodsResult = await checkout.fetchPaymentMethods();
      // FIXED: Shipping method is now auto-selected in store
      if (methodsResult.success) {
        setCurrentStep(2);
      }
    }
    setIsProcessing(false);
  };

  const formatDateForBackend = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = async (e: any) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    if (date) {
      setIsProcessing(true);
      await checkout.fetchTimeSlots(formatDateForBackend(date));
      setIsProcessing(false);
    }
  };

  const handleSelectDateTime = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    setIsProcessing(true);
    const result = await checkout.setDelivery(formatDateForBackend(selectedDate), selectedTimeSlot);
    if (result.success) {
      setCurrentStep(3);
    }
    setIsProcessing(false);
  };

  const handleSelectPayment = (paymentCode: string) => {
    // Update both local state and store
    setSelectedPaymentMethod(paymentCode);
    checkout.setPaymentMethod(paymentCode);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsProcessing(true);
    const result = await checkout.applyCoupon(couponInput);
    if (result.success) setCouponInput("");
    setIsProcessing(false);
  };

  // Only showing the handlePlaceOrder function that needs to be updated
  // Replace your existing handlePlaceOrder function with this:

  const handlePlaceOrder = async () => {
    // FIXED: Better validation with clear error messages
    if (!selectedPaymentMethod) {
      checkout.setError("Please select a payment method");
      return;
    }

    if (!selectedShippingMethod) {
      checkout.setError("Please select a shipping method first");
      return;
    }

    console.log("🚀 Starting order placement...");
    console.log("Payment Method:", selectedPaymentMethod);
    console.log("Shipping Method:", selectedShippingMethod);

    setIsProcessing(true);

    // Step 1: Set payment and shipping method via API
    console.log("📝 Step 1: Setting payment and shipping method...");
    const paymentResult = await checkout.setPaymentAndShipping(
      selectedPaymentMethod,
      selectedShippingMethod,
      true
    );

    if (!paymentResult.success) {
      console.error("❌ Failed to set payment method:", paymentResult.error);
      setIsProcessing(false);
      return;
    }
    console.log("✅ Payment and shipping method set successfully");

    // Step 2: Confirm the order
    console.log("📝 Step 2: Confirming order...");
    const confirmResult = await checkout.confirmOrder();
    if (!confirmResult.success) {
      console.error("❌ Failed to confirm order:", confirmResult.error);
      setIsProcessing(false);
      return;
    }
    console.log("✅ Order confirmed, Order ID:", confirmResult.orderId);

    // Step 3: Handle payment based on method
    if (selectedPaymentMethod === "cod") {
      console.log("💰 Payment Method: COD - Confirming payment...");
      const paymentConfirmResult = await checkout.confirmPayment();
      setIsProcessing(false);
      if (paymentConfirmResult.success) {
        console.log("✅ COD payment confirmed successfully");
        setShowSuccessModal(true);
      } else {
        console.error("❌ Failed to confirm COD payment:", paymentConfirmResult.error);
      }
    } else if (
      selectedPaymentMethod === "paygcc_mpgs" ||
      selectedPaymentMethod === "googlepay" ||
      selectedPaymentMethod === "samsungpay"
    ) {
      console.log("💳 Payment Method: Online - Opening payment gateway...");
      const payOnlineResult = await checkout.payOnline();
      setIsProcessing(false);

      if (payOnlineResult.success) {
        console.log("✅ Payment gateway opened");

        // Listen for payment completion (optional)
        const checkPaymentStatus = setInterval(() => {
          // You can implement a callback or polling mechanism here
          // to check if payment was completed
        }, 2000);

        // Show info message
        checkout.setError("Payment window opened. Complete your payment in the new window.");

        // Clear the interval after 5 minutes
        setTimeout(() => clearInterval(checkPaymentStatus), 300000);
      } else {
        console.error("❌ Failed to open payment gateway:", payOnlineResult.error);
      }
    } else {
      setIsProcessing(false);
      checkout.setError("Payment method not yet implemented");
      console.error("❌ Payment method not implemented:", selectedPaymentMethod);
    }
  };

  const renderPaymentGateway = (htmlContent: string) => {
    const container = document.createElement("div");
    container.id = "payment-gateway-container";
    container.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;overflow:auto";
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const scripts = container.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const newScript = document.createElement("script");
      if (script.src) newScript.src = script.src;
      else newScript.textContent = script.textContent;
      document.head.appendChild(newScript);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <button
            onClick={() => router.push("/products")}
            className="rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
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
                          ? "scale-110 bg-green-500 text-white"
                          : isActive
                            ? "scale-110 bg-black text-white"
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
                      className={`h-1 w-24 transition-all duration-300 ${
                        step.number < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {checkout.error && (
          <div className="animate-slideIn mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{checkout.error}</span>
            </div>
            <button onClick={checkout.clearError} className="text-red-500 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        )}

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
                    className="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 font-medium text-white transition-colors hover:bg-gray-900">
                    <Plus size={20} />
                    <span>Add New</span>
                  </button>
                </div>

                {checkout.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-black" size={40} />
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
                        className={`relative rounded-xl border-2 p-5 transition-all duration-300 ${
                          checkout.selectedAddressId === address.address_id
                            ? "border-black bg-black text-white shadow-xl"
                            : "border-gray-200 bg-white hover:border-gray-400"
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
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                    />
                  </div>

                  {isProcessing && selectedDate ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-black" size={32} />
                    </div>
                  ) : checkout.timeSlots.length > 0 ? (
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        Select Time Slot
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
                                  ? "scale-105 transform border-black bg-black text-white shadow-lg"
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
                        <AlertCircle className="mx-auto mb-2" size={32} />
                        <p>No time slots available for this date</p>
                      </div>
                    )
                  )}

                  <button
                    onClick={handleSelectDateTime}
                    disabled={!selectedDate || !selectedTimeSlot || isProcessing}
                    className="mt-6 flex w-full transform items-center justify-center rounded-xl bg-black px-6 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-gray-900 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-300">
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

                {checkout.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-black" size={40} />
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
                    <p className="mb-4 text-gray-600">No payment methods available</p>
                    <p className="text-sm text-gray-500">Please contact support for assistance</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 space-y-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.code}
                          onClick={() => handleSelectPayment(method.code)}
                          disabled={isProcessing}
                          className={`w-full transform rounded-xl border-2 p-5 text-left transition-all duration-300 hover:scale-102 disabled:opacity-50 ${
                            selectedPaymentMethod === method.code
                              ? "border-black bg-black text-white shadow-xl"
                              : "border-gray-300 bg-white hover:border-gray-500 hover:shadow-md"
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{method.title}</span>
                            {selectedPaymentMethod === method.code && <Check size={24} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* FIXED: Show selected method confirmation */}
                    {selectedPaymentMethod && (
                      <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        <strong>Selected:</strong>{" "}
                        {paymentMethods.find((m) => m.code === selectedPaymentMethod)?.title}
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!selectedPaymentMethod || isProcessing}
                      className="flex w-full transform items-center justify-center rounded-xl bg-black px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-900 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-300">
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={20} />
                          Processing Order...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </>
                )}
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
                  <span>{shippingCost === 0 ? "TBD" : `$${shippingCost.toFixed(2)}`}</span>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-slideUp w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <Check size={40} className="text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Order Placed Successfully!</h3>
            <p className="mb-6 text-gray-600">
              Your order has been confirmed and will be delivered soon.
            </p>
            <button
              onClick={() => router.push("/profile?tab=orders")}
              className="w-full rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900">
              View Orders
            </button>
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

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
