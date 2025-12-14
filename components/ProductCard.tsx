"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import type { Product } from "@/lib/schemas";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCartIcon, X, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { products, fetchProducts } = useProductStore();
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load products if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Trigger animation after modal shows
  useEffect(() => {
    if (showModal) {
      setTimeout(() => setIsAnimating(true), 10);
    }
  }, [showModal]);

  // Get related products (same category, different product)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  console.log("Total products:", products.length);
  console.log("Current product category:", product.category);
  console.log("Related products found:", relatedProducts.length);

  const handleAddToCart = () => {
    addItem(product.id, 1);
    setAddedQuantity(1);
    setModalQuantity(1);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowModal(false);
      document.body.style.overflow = "unset";
    }, 300);
  };

  const handleAddMoreToCart = () => {
    if (modalQuantity > addedQuantity) {
      addItem(product.id, modalQuantity - addedQuantity);
      setAddedQuantity(modalQuantity);
    }
  };

  const handleAddRelatedToCart = (relatedProduct: Product) => {
    addItem(relatedProduct.id, 1);
  };

  const formatPrice = (price: number) => {
    return isNaN(price) ? "0.00" : price.toFixed(2);
  };

  // Carousel logic
  const itemsPerView = 4;
  const maxSlide = Math.max(0, Math.ceil(relatedProducts.length / itemsPerView) - 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const visibleProducts = relatedProducts.slice(
    currentSlide * itemsPerView,
    (currentSlide + 1) * itemsPerView
  );

  return (
    <>
      <div className="mx-h-[400px] max-w-[230px] overflow-hidden rounded-lg bg-white px-2 pt-8 shadow-sm transition-all duration-500 hover:border-[1px] hover:border-[#E1E2E3] hover:shadow-md">
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
            className="absolute -top-6 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
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
              className="line-clamp-2 text-[16px] leading-relaxed font-bold text-gray-800 transition-colors">
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
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#AA383A] px-3 py-3 text-white transition-colors hover:bg-[#8a2c2e]">
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with fade animation */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeModal}
          />

          {/* Modal with scale and fade animation */}
          <div
            className={`relative z-10 mx-4 w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300 ${
              isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 rounded-full bg-white p-2 text-gray-600 shadow-md transition-all hover:rotate-90 hover:bg-gray-100 hover:text-gray-900">
              <X className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto p-8">
              {/* Header */}
              <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                Successfully added to cart
              </h2>

              {/* Product Info Section */}
              <div className="mb-8 flex items-start gap-6">
                {/* Product Image */}
                <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span> {addedQuantity}
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Unit Price:</span> {formatPrice(product.price)}{" "}
                    AED
                  </p>

                  {/* Quantity Controls */}
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-2">
                      <button
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        disabled={modalQuantity <= 1}
                        className="p-2 text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40">
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="w-12 text-center text-lg font-semibold">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="p-2 text-gray-600 transition-colors hover:text-gray-900">
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddMoreToCart}
                      className="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-900 active:scale-95">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg border-2 border-gray-800 bg-white px-6 py-3 font-semibold text-gray-800 transition-all hover:bg-gray-50 active:scale-95">
                  Continue Shopping
                </button>
                <Link href="/cart" className="flex-1" onClick={closeModal}>
                  <button className="w-full rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-900 active:scale-95">
                    Submit Your Order
                  </button>
                </Link>
              </div>

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div>
                  <h3 className="mb-6 text-xl font-bold text-gray-900">You May Also Like</h3>

                  <div className="relative">
                    {/* Previous Button */}
                    {currentSlide > 0 && (
                      <button
                        onClick={prevSlide}
                        className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-gray-100">
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                      </button>
                    )}

                    {/* Products Grid - Matching ProductDetailPage style */}
                    <div className="grid grid-cols-4 gap-4">
                      {visibleProducts.map((relatedProduct) => (
                        <div
                          key={relatedProduct.id}
                          className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md">
                          {/* Product Image */}
                          <Link
                            href={`/products/${relatedProduct.id}`}
                            onClick={closeModal}
                            className="relative block aspect-square overflow-hidden bg-gray-50">
                            <Image
                              src={relatedProduct.image || "/placeholder.svg"}
                              alt={relatedProduct.name}
                              fill
                              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                            />
                          </Link>

                          {/* Product Info */}
                          <div className="p-3">
                            {/* Product Name */}
                            <Link href={`/products/${relatedProduct.id}`} onClick={closeModal}>
                              <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900 transition-colors hover:text-gray-700">
                                {relatedProduct.name}
                              </h4>
                            </Link>

                            {/* Price and Cart Button */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-base font-bold text-gray-900">
                                  {formatPrice(relatedProduct.price)}
                                </span>
                                <span className="text-xs text-gray-500">AED</span>
                              </div>

                              {/* Add to Cart Button */}
                              <button
                                onClick={() => handleAddRelatedToCart(relatedProduct)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition-all hover:scale-110 hover:bg-red-700 active:scale-95">
                                <ShoppingCartIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Next Button */}
                    {currentSlide < maxSlide && (
                      <button
                        onClick={nextSlide}
                        className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-gray-100">
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
