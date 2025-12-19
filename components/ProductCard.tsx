"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/stores/authStore";
import type { Product } from "@/lib/schemas";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingCartIcon,
  X,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { products, fetchProducts } = useProductStore();
  const {
    isInWishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    loading: wishlistLoading
  } = useWishlist();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, [products.length, fetchProducts]);

  /** close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowQuantityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQuantitySelect = (qty: number) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        model: product.model
      },
      qty
    );
    setShowQuantityDropdown(false);
  };

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const action = inWishlist ? removeFromWishlist : addToWishlist;

      action(product.id)
        .then(() => {
          toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
        })
        .catch(() => {
          toast.error("Wishlist action failed");
        });
    },
    [inWishlist, product.id, addToWishlist, removeFromWishlist]
  );

  // 1. Add a state to track if this product is in wishlist
  const [wishlistClicked, setWishlistClicked] = useState(inWishlist);

  // 2. Update handleWishlistToggle to also update this state
  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const action = wishlistClicked ? removeFromWishlist : addToWishlist;

    action(product.id)
      .then(() => {
        toast.success(wishlistClicked ? "Removed from wishlist" : "Added to wishlist");
        setWishlistClicked(!wishlistClicked); // toggle fill state
      })
      .catch(() => {
        toast.error("Wishlist action failed");
      });
  };

  return (
    <div className="relative mx-auto flex h-[400px] max-w-[260px] flex-col rounded-lg border border-[#E1E2E3] bg-white p-4 shadow-sm hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="flex-shrink-0">
        <div className="relative mt-12 aspect-square">
          <Image
            fill
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full object-contain p-4 pb-6"
          />
        </div>
      </Link>
      {/* Spacer */}
      <div className="flex-1"></div> {/* This pushes the content below to the bottom */}
      {/* Bottom content */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Title */}
        <h3 className="line-clamp-2 text-[16px] font-bold text-gray-800">{product.name}</h3>

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">{product.price.toFixed(2)}</span>
            <span className="ml-1 text-xs font-bold">AED</span>
          </div>

          {/* CART + DROPDOWN */}
          <div className="relative w-[38px]" ref={dropdownRef}>
            <button
              onClick={() => setShowQuantityDropdown((p) => !p)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#AA383A] text-white hover:bg-[#8a2c2e]">
              {/* <ShoppingCartIcon className="h-5 w-5" /> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19.401"
                height="18.259"
                className="transition-transform duration-300 ease-in-out hover:scale-110"
                viewBox="0 0 19.401 18.259">
                <path
                  id="Path_3046"
                  data-name="Path 3046"
                  d="M19.289,16.631a.622.622,0,0,0-.484-.266L6.77,15.846a.622.622,0,0,0-.053,1.244l11.22.484-2.206,6.883H5.913L4.14,14.8a.622.622,0,0,0-.385-.467L.85,13.191A.623.623,0,0,0,.395,14.35l2.583,1.015,1.8,9.827a.623.623,0,0,0,.612.51h.3l-.684,1.9A.519.519,0,0,0,5.5,28.3h.48a1.867,1.867,0,1,0,2.776,0h4.072a1.867,1.867,0,1,0,2.776,0h.583a.519.519,0,1,0,0-1.037H6.237L6.8,25.7h9.388a.622.622,0,0,0,.593-.432l2.594-8.092A.621.621,0,0,0,19.289,16.631ZM7.366,30.37a.83.83,0,1,1,.83-.83A.831.831,0,0,1,7.366,30.37Zm6.847,0a.83.83,0,1,1,.83-.83A.831.831,0,0,1,14.213,30.37Z"
                  transform="translate(0 -13.148)"
                  fill="#fff"></path>
              </svg>
            </button>

            {/* DROPDOWN */}
            <div
              className={`absolute right-0 bottom-0 left-0 z-50 overflow-hidden rounded-t-md bg-[#AA383A] transition-all duration-300 ease-in-out ${
                showQuantityDropdown ? "h-[200px]" : "h-0"
              }`}>
              <div className="flex flex-col">
                {[1, 2, 3, 4, 5].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => handleQuantitySelect(qty)}
                    className="w-full py-2 text-center text-[15px] font-semibold text-white transition hover:bg-[#C95467]">
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Wishlist button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-0 right-4 mt-3 flex items-center justify-center text-gray-600 transition-transform duration-200 hover:scale-125">
        <svg width="30" height="30" viewBox="0 0 24 24" className="transition-colors duration-200">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={wishlistClicked ? "#EF4444" : "white"} // red or white
            stroke="#000"
            strokeWidth="1"
          />
        </svg>
      </button>
    </div>
  );
}
