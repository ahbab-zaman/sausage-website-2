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
                      <Link
                        href="/profile?tab=account"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                          <path
                            d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                        </svg>
                        <span className="font-semibold">Account Settings</span>
                      </Link>
                      <Link
                        href="/profile?tab=address"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                          <path
                            d="M3.62001 8.49C5.59001 -0.169998 18.42 -0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39001 20.54C5.63001 17.88 2.47001 13.57 3.62001 8.49Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                        </svg>
                        <span className="font-semibold">Addresses</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                          <path
                            d="M15 12H3.62"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                          <path
                            d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"></path>
                        </svg>
                        <span className="font-semibold">Sign Out</span>
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
                <div className="group relative">
                  <button
                    onClick={() => user && router.push("/wishlist")}
                    className="flex flex-col items-center text-white transition-transform hover:scale-105">
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

                  {/* Desktop Premium Tooltip */}
                  {!user && (
                    <div className="invisible absolute top-full left-1/2 mt-3 w-80 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 hover:visible hover:opacity-100">
                      <div className="relative">
                        {/* Elegant Arrow */}
                        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-t border-l border-gray-200 bg-white"></div>

                        {/* Premium Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                          {/* Subtle top accent line */}

                          <div className="p-6">
                            <button
                              onClick={closeTooltip}
                              className="absolute top-4 right-4 rounded-full p-1.5 transition-all hover:rotate-90 hover:bg-gray-100">
                              <X className="h-4 w-4 text-gray-400" />
                            </button>

                            {/* Message */}
                            <h3 className="mb-2 text-center text-lg font-bold tracking-tight text-gray-900">
                              Save Your Favorites
                            </h3>
                            <p className="mb-5 text-center text-sm leading-relaxed text-gray-600">
                              Create an account to save items to your wishlist and access them
                              anytime, anywhere.
                            </p>

                            {/* Premium Button */}
                            <Link
                              href="/auth/signin"
                              onClick={closeTooltip}
                              className="block w-full rounded-xl bg-black py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg active:scale-95">
                              Sign In to Continue
                            </Link>
                          </div>
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
          <button onClick={openTooltip} className="transition-transform active:scale-95">
            <Heart className="h-6 w-6 text-gray-800" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Mobile Premium Tooltip */}
          {showWishlistTooltip && (
            <div
              className="absolute bottom-full left-1/2 mb-4 w-72 -translate-x-1/2"
              style={{
                animation: "tooltipFadeInMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
              <div className="relative">
                {/* Premium Card */}
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                  {/* Subtle top accent line */}
                  <div className="absolute top-0 right-0 left-0 h-0.5"></div>

                  <div className="p-4">
                    <button
                      onClick={closeTooltip}
                      className="absolute top-3 right-3 rounded-full p-1 transition-all hover:rotate-90 hover:bg-gray-100">
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>

                    {/* Message */}
                    <h3 className="mb-1.5 pr-6 text-left text-base font-bold tracking-tight text-gray-900">
                      Save Your Favorites
                    </h3>
                    <p className="mb-4 text-left text-xs leading-relaxed text-gray-600">
                      Create an account to save items to your wishlist and access them anytime.
                    </p>

                    {/* Premium Button */}
                    <Link
                      href="/auth/signin"
                      onClick={closeTooltip}
                      className="block w-full rounded-lg bg-black py-2.5 text-center text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95">
                      Sign In to Continue
                    </Link>
                  </div>
                </div>

                {/* Elegant Arrow (bottom) */}
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-gray-200 bg-white"></div>
              </div>

              <style jsx>{`
                @keyframes tooltipFadeInMobile {
                  from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(8px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0) scale(1);
                  }
                }
              `}</style>
            </div>
          )}
        </div>

        <Link href={user ? "/profile" : "/auth/signin"}>
          <User className="h-6 w-6" />
        </Link>
      </div>

      {/* Click outside to close tooltip - Only show for mobile */}
      {showWishlistTooltip && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeTooltip} />
      )}
    </>
  );
}
