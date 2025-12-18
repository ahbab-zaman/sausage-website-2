"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Trash2, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

export default function WishlistPage() {
  const { items, loading, error, fetchWishlist, removeItem } = useWishlist();
  const { addItem } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  /* ---------- EMPTY STATE ---------- */
  if (items.length === 0) {
    return (
      <div className="bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-[#f2f2f2]">
          <div className="mx-auto mb-6 flex w-[90%] items-center py-1 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="font-medium text-gray-900">My Wish List</span>
          </div>
        </div>

        {/* Empty Message */}
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Your Wish List is Empty</h1>
          <p className="mb-8 text-gray-600">You have no items saved in your wish list</p>
          <Link href="/products">
            <Button className="rounded-full bg-black font-bold hover:bg-black" size="lg">
              Shop More
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- WISHLIST ITEMS ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 text-sm text-gray-600">
          <Link href="/">Home</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium text-black">My Wish List</span>
        </div>
      </div>

      {/* Wishlist */}
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-6">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-4 rounded border bg-white p-4">
            {/* IMAGE */}
            <Link href={`/products/${item.product_id}`}>
              <div className="relative h-24 w-24 shrink-0 bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-contain" />
              </div>
            </Link>

            {/* INFO */}
            <div className="flex-1">
              <Link href={`/products/${item.product_id}`}>
                <h3 className="line-clamp-1 text-sm font-medium text-black hover:underline">
                  {item.name}
                </h3>
              </Link>

              {/* DESCRIPTION */}
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs text-black/70">{item.description}</p>
              )}

              {/* QUANTITY */}
              <p className="mt-1 text-xs text-black">
                Available: <span className="font-medium">{item.quantity}</span>
              </p>

              {/* PRICE */}
              <p className="mt-2 text-sm font-semibold text-black">AED {item.price}.00</p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-gray-400 hover:text-red-600"
                aria-label="Remove">
                <Trash2 size={16} />
              </button>

              <Button
                onClick={() =>
                  addItem({
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    image: item.image
                  })
                }
                className="bg-black px-4 py-2 text-xs text-white hover:bg-black/90">
                <ShoppingCart />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
