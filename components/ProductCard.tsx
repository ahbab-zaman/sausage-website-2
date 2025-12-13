"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/lib/schemas";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCartIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAddToCart = (quantity: number) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
    setShowDropdown(false);
  };

  return (
    <div className="mx-h-[360px] max-w-[300px] overflow-hidden rounded-lg bg-white px-2 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Top Part */}
      <div className="relative">
        {/* Badge Wrapper */}
        <div className="absolute top-2 left-2 z-10">
          {product.badge && (
            <span className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
          aria-label="wishlist button">
          <svg width="40" height="40" viewBox="0 0 40 40" className="h-5 w-5 text-gray-600">
            <path
              d="M20,35.07,4.55,19.62a8.5,8.5,0,0,1-.12-12l.12-.12a8.72,8.72,0,0,1,12.14,0L20,10.77l3.3-3.3A8.09,8.09,0,0,1,29.13,4.9a8.89,8.89,0,0,1,6.31,2.58,8.5,8.5,0,0,1,.12,12l-.12.12ZM10.64,7.13A6.44,6.44,0,0,0,6.07,18.19L20,32.06,33.94,18.12A6.44,6.44,0,0,0,34,9l0,0a6.44,6.44,0,0,0-4.77-1.85A6,6,0,0,0,24.83,9L20,13.78,15.21,9A6.44,6.44,0,0,0,10.64,7.13Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Image */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <Image
              fill
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="mx-auto max-h-[300px] max-w-[220px] object-contain p-4"
            />
          </div>
        </Link>
      </div>

      {/* Bottom Part */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-3">
          <Link
            href={`/products/${product.id}`}
            className="line-clamp-2 text-sm leading-relaxed text-gray-800 transition-colors hover:text-blue-600">
            {product.name}
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{product.price.toFixed(2)}</span>
            <span className="ml-1 text-xs text-gray-500">AED</span>
          </div>

          <div className="relative flex h-[38px] w-[38px] items-center gap-2 rounded-full">
            {/* Add to Cart Button */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#AA383A] px-3 py-3 text-white transition-colors">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19.401"
                height="18.259"
                viewBox="0 0 19.401 18.259"
                className="h-5 w-5">
                <path
                  d="M19.289,16.631a.622.622,0,0,0-.484-.266L6.77,15.846a.622.622,0,0,0-.053,1.244l11.22.484-2.206,6.883H5.913L4.14,14.8a.622.622,0,0,0-.385-.467L.85,13.191A.623.623,0,0,0,.395,14.35l2.583,1.015,1.8,9.827a.623.623,0,0,0,.612.51h.3l-.684,1.9A.519.519,0,0,0,5.5,28.3h.48a1.867,1.867,0,1,0,2.776,0h4.072a1.867,1.867,0,1,0,2.776,0h.583a.519.519,0,1,0,0-1.037H6.237L6.8,25.7h9.388a.622.622,0,0,0,.593-.432l2.594-8.092A.621.621,0,0,0,19.289,16.631ZM7.366,30.37a.83.83,0,1,1,.83-.83A.831.831,0,0,1,7.366,30.37Zm6.847,0a.83.83,0,1,1,.83-.83A.831.831,0,0,1,14.213,30.37Z"
                  transform="translate(0 -13.148)"
                  fill="currentColor"
                />
              </svg> */}
              <ShoppingCartIcon />
            </button>

            {/* Quantity Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 bottom-full z-20 mb-1 min-w-[60px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {[1, 2, 3, 4, 5].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => handleAddToCart(qty)}
                    className="w-full px-4 py-2 text-center text-sm text-gray-700 transition-colors hover:bg-gray-100">
                    {qty}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
