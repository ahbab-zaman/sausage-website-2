"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/cartStore";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  addedQuantity: number;
  relatedProducts?: Product[];
  onAddMore?: (quantity: number) => void;
  onAddRelatedToCart?: (product: Product) => void;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
  addedQuantity,
  relatedProducts = [],
  onAddMore,
  onAddRelatedToCart
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(addedQuantity);
  const [currentSlide, setCurrentSlide] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setQuantity(addedQuantity);
  }, [addedQuantity]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1) setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (onAddMore) {
      onAddMore(quantity);
    } else {
      // Fallback: direct add using store
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          model: product.model
        },
        quantity - addedQuantity
      );
    }
  };

  const handleAddRelated = (relatedProduct: Product) => {
    if (onAddRelatedToCart) {
      onAddRelatedToCart(relatedProduct);
    } else {
      addItem(
        {
          id: relatedProduct.id,
          name: relatedProduct.name,
          price: relatedProduct.price,
          image: relatedProduct.image,
          model: relatedProduct.model
        },
        1
      );
    }
  };

  const formatPrice = (price: number) => (isNaN(price) ? "0.00" : price.toFixed(2));

  const itemsPerView = 4;
  const maxSlide = Math.max(0, Math.ceil(relatedProducts.length / itemsPerView) - 1);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));
  const visibleProducts = relatedProducts.slice(
    currentSlide * itemsPerView,
    (currentSlide + 1) * itemsPerView
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-white p-2 text-gray-600 shadow-md hover:bg-gray-100 hover:text-gray-900">
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
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-medium">Quantity:</span> {addedQuantity}
              </p>
              <p className="mb-4 text-sm text-gray-600">
                <span className="font-medium">Unit Price:</span> {formatPrice(product.price)} AED
              </p>

              {/* Quantity Controls */}
              <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40">
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 text-gray-600 hover:text-gray-900">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-900">
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-800 bg-white px-6 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50">
              Continue Shopping
            </button>
            <Link href="/cart" className="flex-1" onClick={onClose}>
              <button className="w-full rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-900">
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
                    className="absolute top-1/2 -left-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </button>
                )}

                {/* Products Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {visibleProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct.id}
                      className="flex flex-col rounded-lg border border-gray-200 bg-white p-4">
                      {/* Product Image */}
                      <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                        <Image
                          src={relatedProduct.image || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          width={160}
                          height={160}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {/* Product Name */}
                      <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900">
                        {relatedProduct.name}
                      </h4>
                      {/* Price */}
                      <p className="mb-3 text-base font-bold text-gray-900">
                        {formatPrice(relatedProduct.price)}AED
                      </p>
                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddRelated(relatedProduct)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                {currentSlide < maxSlide && (
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 -right-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100">
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
