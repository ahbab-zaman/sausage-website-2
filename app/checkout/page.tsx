"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  MapPin,
  CreditCard,
  Truck,
  Tag,
  Calendar,
  Clock,
  AlertCircle,
  X,
  Plus,
  Loader2
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useAddressStore } from "@/stores/addressStore";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const checkout = useCheckoutStore();
  const addressStore = useAddressStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      await Promise.all([checkout.fetchShippingAddresses(), addressStore.getAllAddresses()]);
    };
    initCheckout();
  }, []);

  const subtotal = getTotal();
  const shippingCost = checkout.selectedShippingMethod ? 5.99 : 0;
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
      if (methodsResult.success && checkout.shippingMethods.length > 0) {
        // Auto-select first shipping method if available
        checkout.selectedShippingMethod = checkout.shippingMethods[0].code;
      }
      setCurrentStep(2);
    }
    setIsProcessing(false);
  };

  const handleSelectDateTime = async () => {
    if (!selectedDate || !checkout.selectedTimeSlot) return;

    setIsProcessing(true);
    const result = await checkout.setDelivery(selectedDate, checkout.selectedTimeSlot);
    if (result.success) {
      setCurrentStep(3);
    }
    setIsProcessing(false);
  };

  const handleSelectPayment = async (paymentCode: any) => {
    if (!checkout.selectedShippingMethod) {
      checkout.error = "Please select a shipping method first";
      return;
    }

    setIsProcessing(true);
    const result = await checkout.setPaymentAndShipping(
      paymentCode,
      checkout.selectedShippingMethod,
      true
    );
    setIsProcessing(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsProcessing(true);
    const result = await checkout.applyCoupon(couponInput);
    if (result.success) {
      setCouponInput("");
    }
    setIsProcessing(false);
  };

  const handlePlaceOrder = async () => {
    if (!checkout.selectedPaymentMethod) {
      checkout.error = "Please select a payment method";
      return;
    }

    setIsProcessing(true);
    const result = await checkout.confirmOrder();

    if (result.success) {
      // If payment method is card, redirect to payment page
      if (
        checkout.selectedPaymentMethod === "paygcc_mpgs" ||
        checkout.selectedPaymentMethod === "paygccapple"
      ) {
        // Redirect to payment gateway
        window.location.href = `/payment?order_id=${result.orderId}`;
      } else {
        // COD - show success
        setShowSuccessModal(true);
      }
    }
    setIsProcessing(false);
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = async (e: any) => {
    const date = e.target.value;
    setSelectedDate(date);

    if (date) {
      setIsProcessing(true);
      const formattedDate = formatDate(date);
      await checkout.fetchTimeSlots(formattedDate);
      setIsProcessing(false);
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
        {/* Header */}
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
                      } `}>
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
                    onClick={() => router.push("/account/addresses")}
                    className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200">
                    <Plus size={20} />
                    <span className="font-medium">Add New</span>
                  </button>
                </div>

                {checkout.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-black" size={40} />
                  </div>
                ) : checkout.shippingAddresses.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-4 text-gray-600">No shipping addresses found</p>
                    <button
                      onClick={() => router.push("/account/addresses")}
                      className="rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900">
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {checkout.shippingAddresses.map((address) => (
                      <button
                        key={address.address_id}
                        onClick={() => handleSelectAddress(address.address_id)}
                        disabled={isProcessing}
                        className={`transform rounded-xl border-2 p-5 text-left transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 ${
                          checkout.selectedAddressId === address.address_id
                            ? "border-black bg-black text-white shadow-xl"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        } `}>
                        <div className="mb-3 flex items-start justify-between">
                          <span className="text-lg font-bold">{address.name}</span>
                          {address.default === 1 && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                checkout.selectedAddressId === address.address_id
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                              } `}>
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
                            onClick={() => checkout.setDelivery(formatDate(selectedDate), slot.id)}
                            disabled={!slot.available || isProcessing}
                            className={`rounded-xl border-2 p-4 text-left transition-all duration-300 disabled:opacity-50 ${
                              !slot.available
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : checkout.selectedTimeSlot === slot.id
                                  ? "scale-105 transform border-black bg-black text-white shadow-lg"
                                  : "border-gray-300 bg-white hover:border-gray-500 hover:shadow-md"
                            } `}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{slot.time}</span>
                              {slot.available ? (
                                checkout.selectedTimeSlot === slot.id && <Check size={20} />
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
                    disabled={!selectedDate || !checkout.selectedTimeSlot || isProcessing}
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
                ) : checkout.paymentMethods.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
                    <p className="mb-4 text-gray-600">No payment methods available</p>
                    <p className="text-sm text-gray-500">Please contact support for assistance</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 space-y-3">
                      {checkout.paymentMethods.map((method) => (
                        <button
                          key={method.code}
                          onClick={() => handleSelectPayment(method.code)}
                          disabled={isProcessing}
                          className={`w-full transform rounded-xl border-2 p-5 text-left transition-all duration-300 hover:scale-102 disabled:opacity-50 ${
                            checkout.selectedPaymentMethod === method.code
                              ? "border-black bg-black text-white shadow-xl"
                              : "border-gray-300 bg-white hover:border-gray-500 hover:shadow-md"
                          } `}>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{method.title}</span>
                            {checkout.selectedPaymentMethod === method.code && <Check size={24} />}
                          </div>
                          {method.code === "paygcc_mpgs" && (
                            <p className="mt-2 text-xs opacity-75">
                              Test Card: 5123 4567 8901 2346
                            </p>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!checkout.selectedPaymentMethod || isProcessing}
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
                      placeholder="Coupon code (e.g. TEST1)"
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
              onClick={() => router.push("/orders")}
              className="w-full rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-900">
              View Orders
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
