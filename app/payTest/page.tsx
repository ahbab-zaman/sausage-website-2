"use client"
import React, { useState, useEffect } from "react";
import { CreditCard, Lock, AlertCircle, Check, X, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkoutApiClient } from "@/lib/api/checkoutClient";

export default function PaymentTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const testCards = [
    {
      type: "Visa",
      number: "4111 1111 1111 1111",
      expiry: "12/25",
      cvv: "123",
      status: "Success"
    },
    {
      type: "Visa",
      number: "4242 4242 4242 4242",
      expiry: "12/25",
      cvv: "123",
      status: "Success"
    },
    {
      type: "Mastercard",
      number: "5555 5555 5555 4444",
      expiry: "12/25",
      cvv: "123",
      status: "Success"
    },
    {
      type: "Mastercard",
      number: "5123 4567 8901 2346",
      expiry: "12/25",
      cvv: "123",
      status: "Success"
    },
    {
      type: "Amex",
      number: "3782 822463 10005",
      expiry: "12/25",
      cvv: "1234",
      status: "Success"
    },
    {
      type: "Declined",
      number: "4000 0000 0000 0002",
      expiry: "12/25",
      cvv: "123",
      status: "Card Declined"
    },
    {
      type: "Insufficient",
      number: "4000 0000 0000 9995",
      expiry: "12/25",
      cvv: "123",
      status: "Insufficient Funds"
    }
  ];

  const formatCardNumber = (value: any) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: any) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: any) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: any) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: any) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const useTestCard = (card: any) => {
    setCardNumber(card.number);
    setExpiryDate(card.expiry);
    setCvv(card.cvv);
    setCardHolder("TEST CARDHOLDER");
  };

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) {
      setError("Invalid card number");
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      setError("Invalid expiry date");
      return false;
    }
    if (!cvv || cvv.length < 3) {
      setError("Invalid CVV");
      return false;
    }
    if (!cardHolder.trim()) {
      setError("Card holder name is required");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    setError("");

    if (!validateCard()) return;

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard === "4000000000000002") {
        throw new Error("Card declined by issuer");
      }
      if (cleanCard === "4000000000009995") {
        throw new Error("Insufficient funds");
      }

      const result = await checkoutApiClient.confirmPayment();

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err: unknown) {
      setError((err.message) || "Payment processing failed");
      setIsProcessing(false);
    }
  };

  const getCardType = () => {
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.startsWith("4")) return "Visa";
    if (cleanNumber.startsWith("5")) return "Mastercard";
    if (cleanNumber.startsWith("3")) return "Amex";
    return "Card";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <CreditCard className="text-white" size={32} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600">Order #{orderId}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Card Details</h2>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Lock size={16} />
                  <span>Secure Payment</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <span className="text-red-700">{error}</span>
                  </div>
                  <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                    <X size={20} />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-16 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      disabled={isProcessing}
                    />
                    {cardNumber && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-600">
                        {getCardType()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="JOHN DOE"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 uppercase transition-all outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                    disabled={isProcessing}
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="mt-6 flex w-full transform items-center justify-center rounded-xl bg-black px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-900 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-300">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2" size={20} />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <Lock className="mt-0.5 flex-shrink-0 text-blue-600" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-semibold">Secure Payment</p>
                  <p>
                    Your payment information is encrypted and secure. We never store your full card
                    details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Test Cards</h3>
              <p className="mb-4 text-sm text-gray-600">
                Use these test cards to simulate different payment scenarios
              </p>

              <div className="space-y-3">
                {testCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => useTestCard(card)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-100">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{card.type}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          card.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {card.status}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-gray-600">{card.number}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> These are test cards for development purposes only. No real
                  transactions will be processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-slideUp w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <Check size={40} className="text-white" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Payment Successful!</h3>
            <p className="mb-6 text-gray-600">
              Your payment has been processed successfully. Redirecting to order details...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin text-black" size={24} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
