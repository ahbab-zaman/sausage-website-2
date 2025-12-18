"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import Image from "next/image";
import apple from "@/public/payment-apple-pay.png";
import benefit from "@/public/payment-benefit.png";
import jcb from "@/public/payment-jcb.png";
import payK from "@/public/payment-k.png";
import mada from "@/public/payment-mada.png";
import master from "@/public/payment-master.png";
import paygcc from "@/public/payment-paygcc.png";
import visa from "@/public/payment-visa.png";

export default function CartPage() {
  const {
    items,
    loading,
    error,
    updateQuantity,
    removeItem,
    getTotal,
    fetchCart,
    resetError,
    clearCart
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch cart on mount if authenticated
  useEffect(() => {
    const initializeCart = async () => {
      if (isAuthenticated()) {
        await fetchCart();
      }
      setIsInitialLoading(false);
    };

    initializeCart();
  }, [fetchCart, isAuthenticated]);

  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!isAuthenticated()) {
      e.preventDefault();
      setIsLoginModalOpen(true);
    }
  };

  if (isInitialLoading || (loading && items.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-50 p-6">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => {
              resetError();
              fetchCart();
            }}
            className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="bg-[#f2f2f2]">
          <div className="mx-auto mb-6 flex w-[90%] items-center py-1 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href="/products" className="hover:text-gray-900">
              All Products
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="font-medium text-gray-900">Shopping Cart</span>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Your Shopping Cart is Empty</h1>
          <p className="mb-8 text-gray-600">You have no items in your shopping cart</p>
          <Link href="/products">
            <Button className="rounded-full bg-black font-bold hover:bg-black" size="lg">
              Shop More
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const formatPrice = (price: number) => {
    return isNaN(price) ? "0.00" : price.toFixed(2);
  };

  const subtotal = getTotal();
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode.toLowerCase() === "save20") {
      setDiscount(subtotal * 0.2);
    } else {
      setDiscount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/products" className="hover:text-gray-900">
            All Products
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium text-gray-900">Shopping Cart</span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            disabled={loading}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50">
            <Trash2 className="mr-1 h-4 w-4" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-900">
                <div className="col-span-5">Product Name</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const originalPrice = item.price * 1.18;

                  return (
                    <div key={item.key} className="grid grid-cols-12 gap-4 px-6 py-6">
                      <div className="col-span-5 flex space-x-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                          <Image
                            width={96}
                            height={96}
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="mb-2 flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(item.price)} AED
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(originalPrice)} AED
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{item.name}</p>
                          {item.model && (
                            <p className="text-xs text-gray-500">Model: {item.model}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center justify-center">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.key, Math.max(1, item.quantity - 1))}
                            disabled={loading || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={loading}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center justify-end">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(itemTotal)} AED
                        </span>
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => removeItem(item.key)}
                          disabled={loading}
                          className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-gray-900">Use Coupon Code</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter your coupon here"
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    Submit
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-8">
                <h2 className="mb-4 text-base font-semibold text-gray-900">Summary</h2>
                <div className="space-y-3 border-b border-gray-200 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub-Total</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)} AED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-gray-900">{formatPrice(discount)} AED</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(total)} AED</span>
                </div>

                {isAuthenticated() ? (
                  <Link href="/checkout" className="mt-6 block">
                    <button
                      disabled={loading}
                      className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Checkout"
                      )}
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={handleCheckoutClick}
                    disabled={loading}
                    className="mt-6 w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                    Checkout
                  </button>
                )}

                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <Image src={visa} alt="visa" width={42} height={27} />
                    <Image src={apple} alt="apple-pay" width={42} height={27} />
                    <Image src={benefit} alt="benefit" width={42} height={27} />
                    <Image src={jcb} alt="jcb" width={42} height={27} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image src={payK} alt="knet" width={42} height={27} />
                    <Image src={mada} alt="mada" width={42} height={27} />
                    <Image src={master} alt="master" width={42} height={27} />
                    <Image src={paygcc} alt="paygcc" width={42} height={27} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Login Required</DialogTitle>
            <DialogDescription className="text-base">
              Please login to proceed to checkout and complete your purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full rounded-full bg-black py-6 text-base font-semibold hover:bg-gray-800">
                Login
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
