"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Trash2, ChevronRight, ShoppingCart, Heart, ArrowRight } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-black" />
          <p className="mt-4 text-sm font-medium text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* ---------- EMPTY STATE ---------- */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center px-6 py-4 text-sm">
            <Link href="/" className="text-gray-600 transition-colors hover:text-black">
              Home
            </Link>
            <ChevronRight className="mx-3 h-4 w-4 text-gray-400" />
            <span className="font-medium text-black">My Wish List</span>
          </div>
        </div>

        {/* Empty Message */}
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">
            Your Wish List is Empty
          </h1>
          <p className="mb-10 text-lg text-gray-600">
            Start adding items you love and keep them saved for later
          </p>
          <Link href="/products">
            <Button className="group rounded-full bg-black px-8 py-6 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-black hover:shadow-xl">
              Explore Products
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- WISHLIST ITEMS ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4 text-sm">
          <Link href="/" className="text-gray-600 transition-colors hover:text-black">
            Home
          </Link>
          <ChevronRight className="mx-3 h-4 w-4 text-gray-400" />
          <span className="font-medium text-black">My Wish List</span>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Wish List</h1>
            <p className="mt-2 text-sm text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 pb-2 sm:grid-cols-1">
          {items.map((item, index) => (
            <div
              key={item.product_id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}>
              <div className="flex items-start gap-6">
                {/* IMAGE */}
                <Link href={`/products/${item.product_id}`} className="shrink-0">
                  <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.product_id}`}>
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors hover:text-black">
                      {item.name}
                    </h3>
                  </Link>

                  {/* DESCRIPTION */}
                  {item.description && (
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {/* META INFO */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">AED {item.price}.00</div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="group/btn flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 shadow-sm transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                    aria-label="Remove from wishlist">
                    <Trash2 size={24} className="transition-transform group-hover/btn:scale-110" />
                  </button>

                  <button
                    onClick={() =>
                      addItem({
                        id: item.product_id,
                        name: item.name,
                        price: item.price,
                        image: item.image
                      })
                    }
                    className="group/cart flex h-16 w-16 items-center justify-center rounded-2xl bg-black p-0 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-black hover:shadow-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      className="w-"
                      viewBox="0 0 19.401 18.259">
                      <path
                        id="Path_3046"
                        data-name="Path 3046"
                        d="M19.289,16.631a.622.622,0,0,0-.484-.266L6.77,15.846a.622.622,0,0,0-.053,1.244l11.22.484-2.206,6.883H5.913L4.14,14.8a.622.622,0,0,0-.385-.467L.85,13.191A.623.623,0,0,0,.395,14.35l2.583,1.015,1.8,9.827a.623.623,0,0,0,.612.51h.3l-.684,1.9A.519.519,0,0,0,5.5,28.3h.48a1.867,1.867,0,1,0,2.776,0h4.072a1.867,1.867,0,1,0,2.776,0h.583a.519.519,0,1,0,0-1.037H6.237L6.8,25.7h9.388a.622.622,0,0,0,.593-.432l2.594-8.092A.621.621,0,0,0,19.289,16.631ZM7.366,30.37a.83.83,0,1,1,.83-.83A.831.831,0,0,1,7.366,30.37Zm6.847,0a.83.83,0,1,1,.83-.83A.831.831,0,0,1,14.213,30.37Z"
                        transform="translate(0 -13.148)"
                        fill="#fff"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover gradient effect */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(0,0,0,0.02) 0%, transparent 50%)"
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
