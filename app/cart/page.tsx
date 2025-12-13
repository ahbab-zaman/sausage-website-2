"use client";

import { useEffect } from "react";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, loading, error, updateQuantity, removeItem, getTotal, fetchCart, resetError } =
    useCartStore();

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Show loading state
  if (loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  // Show error if any
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

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.key} className="flex items-center space-x-4 p-6">
              <Image
                width={80}
                height={80}
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="h-20 w-20 rounded-lg object-cover"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-muted-foreground">{item.price.toFixed(2)} AED</p>
                {item.model && <p className="text-sm text-gray-500">Model: {item.model}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.key, Math.max(0, item.quantity - 1))}
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  disabled={loading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {(item.price * item.quantity).toFixed(2)} AED
                </p>
              </div>

              <button
                onClick={() => removeItem(item.key)}
                disabled={loading}
                className="p-2 text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-primary text-2xl font-bold">{getTotal().toFixed(2)} AED</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
