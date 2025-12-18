"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, X, Search, Globe, LayoutDashboard, Heart, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import Logo from "@/components/logo";
import CartSidebar from "@/components/CartSidebar";
import SearchDropdown from "@/components/SearchDropdown";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWishlistTooltip, setShowWishlistTooltip] = useState(false);

  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotal());

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  const { user, logout } = useAuthStore();

  const formatPrice = (price: number) => (isNaN(price) ? "0.00" : price.toFixed(2));

  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

  const openTooltip = () => {
    if (!user) {
      setShowWishlistTooltip(true);
    } else {
      router.push("/wishlist");
    }
  };

  const closeTooltip = () => setShowWishlistTooltip(false);

  useEffect(() => {
    if (showWishlistTooltip) {
      const timer = setTimeout(closeTooltip, 4000);
      return () => clearTimeout(timer);
    }
  }, [showWishlistTooltip]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm md:bg-[#3A3938]">
        <div className="mx-auto w-[90%]">
          <div className="flex h-24 items-center justify-between">
            {/* ================= MOBILE ================= */}
            <div className="flex w-full items-center justify-between md:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="rounded-md p-3 text-black hover:bg-gray-100">
                <svg className="h-10 w-10" viewBox="0 0 60 40">
                  <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                    <path d="M10,10 L50,10" />
                    <path d="M10,20 L50,20" />
                    <path d="M10,30 L50,30" />
                  </g>
                </svg>
              </button>
              <div className="absolute left-1/2 -translate-x-1/2">
                <Logo />
              </div>
              <div className="flex items-center gap-2">
                <button className="relative text-black">
                  <User className="h-6 w-6" />
                </button>
                <button onClick={() => setIsCartOpen(true)} className="relative ml-4 text-black">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden w-full items-center justify-between md:flex">
              <Logo />
              <div className="mx-8 max-w-lg flex-1">
                <SearchDropdown baseUrl={process.env.NEXT_PUBLIC_API_BASE_URL!} />
              </div>
              <div className="flex items-center space-x-6">
                {/* Language & Account (unchanged) */}
                <div className="group relative">
                  <button className="flex flex-col items-center text-white">
                    <Globe className="h-6 w-6" />
                    <span className="text-sm">Language</span>
                  </button>
                  <div className="invisible absolute right-0 mt-2 w-40 rounded-md bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100">
                      🇬🇧 English
                    </button>
                    <button className="block w-full px-4 py-2 text-sm hover:bg-gray-100">
                      🇦🇪 العربية
                    </button>
                  </div>
                </div>

                {user ? (
                  <div className="group relative">
                    <button className="flex flex-col items-center text-white">
                      <User className="h-6 w-6" />
                      <span className="text-sm">Account</span>
                    </button>
                    <div className="invisible absolute right-0 mt-2 w-48 rounded-md bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                      <div className="border-b px-4 py-2">
                        <p className="text-sm font-semibold">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/signin" className="flex flex-col items-center text-white">
                    <User className="h-6 w-6" />
                    <span className="text-sm">Login</span>
                  </Link>
                )}

                {/* Wishlist – DESKTOP */}
                <div className="relative">
                  <button
                    onClick={openTooltip}
                    // onMouseEnter={openTooltip}
                    className="flex flex-col items-center text-white">
                    <div className="relative">
                      <Heart className="h-6 w-6" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    <span className="text-sm">Wishlist</span>
                  </button>

                  {/* Desktop Tooltip (Small) */}
                  {showWishlistTooltip && (
                    <div className="animate-in fade-in slide-in-from-top-3 zoom-in-95 absolute top-full left-1/2 mt-2 w-64 -translate-x-1/2 duration-300">
                      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
                        <div className="p-4">
                          <button
                            onClick={closeTooltip}
                            className="absolute top-2 right-2 rounded-full p-1 transition hover:bg-gray-100">
                            <X className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                          <p className="pr-6 text-sm leading-snug font-medium text-gray-800">
                            You must login or create an account to save items to your wish list!
                          </p>
                          <Link
                            href="/auth/signin"
                            onClick={closeTooltip}
                            className="mt-3 block w-full rounded-full bg-[#3A3938] py-2 text-center text-sm font-semibold text-white transition hover:bg-[#2a2928]">
                            Login
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center space-x-3 text-white">
                  <div className="hidden flex-col items-end md:flex">
                    <span className="text-xs text-gray-400">Sub-Total</span>
                    <span className="text-sm font-semibold">{formatPrice(cartTotal)} AED</span>
                  </div>
                  <div className="relative">
                    <ShoppingCart className="h-7 w-7" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu & Cart Sidebar (unchanged) */}
        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transition-transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* ... menu content ... */}
        </div>
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsMenuOpen(false)} />
        )}
      </nav>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        total={cartTotal}
      />

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex justify-around border-t bg-white py-3 md:hidden">
        <Link href="/">
          <Home className="h-6 w-6" />
        </Link>
        <button>
          <Search className="h-6 w-6" />
        </button>
        <Link href="/dashboard">
          <LayoutDashboard className="h-6 w-6" />
        </Link>

        {/* Mobile Wishlist */}
        <div className="relative">
          <button onClick={openTooltip}>
            <Heart className="h-6 w-6 text-gray-800" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Mobile Tooltip (Small, Above) */}
          {showWishlistTooltip && (
            <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 duration-300">
              <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
                <div className="p-4">
                  <button
                    onClick={closeTooltip}
                    className="absolute top-2 right-2 rounded-full p-1 transition hover:bg-gray-100">
                    <X className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <p className="pr-6 text-sm leading-snug font-medium text-gray-800">
                    You must login or create an account to save items to your wish list!
                  </p>
                  <Link
                    href="/auth/signin"
                    onClick={closeTooltip}
                    className="mt-3 block w-full rounded-full bg-[#3A3938] py-2 text-center text-sm font-semibold text-white transition hover:bg-[#2a2928]">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link href={user ? "/profile" : "/auth/signin"}>
          <User className="h-6 w-6" />
        </Link>
      </div>

      {/* Click outside to close tooltip */}
      {showWishlistTooltip && <div className="fixed inset-0 z-40" onClick={closeTooltip} />}
    </>
  );
}
