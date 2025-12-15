"use client";
import { useEffect } from "react";
import { X, ShoppingCart, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onRemoveItem?: (id: string) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  total,
  onRemoveItem
}: CartSidebarProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Auto navigate to cart page after 3 seconds
      const timer = setTimeout(() => {
        router.push("/cart");
        onClose();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, router, onClose]);

  const formatPrice = (price: number) => {
    return isNaN(price) ? "0.00" : price.toFixed(2);
  };

  const handleCheckout = () => {
    router.push("/checkout");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-500 ease-in-out sm:w-[500px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="border-b bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center text-gray-700 transition-colors hover:text-gray-900">
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-1 text-base font-medium">Go Back</span>
            </button>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length})</h2>
          </div>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-4 h-20 w-20 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Your cart is empty</p>
              <p className="mt-2 text-sm text-gray-400">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 border-b pb-6 last:border-b-0">
                  {/* Product Image */}
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-base leading-snug font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <div className="mt-3 flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Quantity</span>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                            {item.quantity}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem?.(item.id)}
                        className="text-gray-400 transition-colors hover:text-red-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mt-3">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}{" "}
                        <span className="text-base font-medium text-gray-600">AED</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed at Bottom */}
        {items.length > 0 && (
          <div className="border-t bg-white px-6 py-6">
            {/* Total */}
            <div className="mb-5 flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="text-base font-medium text-gray-600">Total:</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(total)} <span className="text-lg font-medium text-gray-600">AED</span>
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full rounded-lg bg-gray-800 py-4 text-center text-lg font-semibold text-white transition-all hover:bg-gray-900 active:scale-[0.98]">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
