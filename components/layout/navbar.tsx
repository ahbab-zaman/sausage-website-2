"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, X, Search, Globe, LayoutDashboard } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

import Logo from "@/components/logo";
import CartSidebar from "@/components/CartSidebar";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  // Get cart data
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotal());
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Get user data
  const { user, logout } = useAuthStore();

  // Format price safely
  const formatPrice = (price: number) => {
    return isNaN(price) ? "0.00" : price.toFixed(2);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCartOpen(true);
  };

  const handleLogout = () => {
    logout(); // clear auth state
    router.push("/auth/signin"); // redirect after logout
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm md:bg-[#3A3938]">
        <div className="mx-auto w-[90%]">
          <div className="flex h-24 items-center justify-between">
            {/* Mobile Layout */}
            <div className="flex w-full items-center justify-between md:hidden">
              {/* Left: Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="rounded-md p-3 text-black hover:bg-gray-100"
                aria-label="navigation-menu">
                <svg className="h-10 w-10" viewBox="0 0 60 40">
                  <g
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M10,10 L50,10 Z"></path>
                    <path d="M10,20 L50,20 Z"></path>
                    <path d="M10,30 L50,30 Z"></path>
                  </g>
                </svg>
              </button>

              {/* Center: Logo */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <Logo />
              </div>

              {/* Right: User and Cart Icons */}
              <div className="flex items-center space-x-4">
                {/* User Account */}
                {user ? (
                  <div className="group relative">
                    <button className="text-black">
                      <User className="h-6 w-6" />
                    </button>
                    <div className="invisible absolute right-0 mt-2 w-48 rounded-md bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                      <div className="border-b px-4 py-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>

                      <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/signin" className="text-black">
                    <User className="h-6 w-6" />
                  </Link>
                )}

                {/* Cart */}
                <button onClick={handleCartClick} className="relative text-black">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden w-full items-center justify-between md:flex">
              {/* Logo */}
              <div className="flex items-center">
                <Logo />
              </div>

              {/* Search Bar (Desktop only) */}
              <div className="mx-8 max-w-lg flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="w-full rounded-lg bg-white py-4 pr-4 pl-14 text-base text-gray-800 shadow-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-6">
                {/* Language Selector */}
                <div className="group relative">
                  <button className="flex flex-col items-center text-white transition-colors hover:text-gray-300">
                    <Globe className="h-6 w-6" />
                    <span className="text-sm">Language</span>
                  </button>
                  <div className="invisible absolute right-0 mt-2 w-44 rounded-md bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">🇬🇧</span> English
                    </button>
                    <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="mr-2">🇦🇪</span> العربية
                    </button>
                  </div>
                </div>

                {/* User Account */}
                {user ? (
                  <div className="group relative">
                    <button className="flex flex-col items-center space-x-0 text-white transition-colors hover:text-gray-300">
                      <User className="h-6 w-6" />
                      <span className="text-sm">Account</span>
                    </button>
                    <div className="invisible absolute right-0 mt-2 w-48 rounded-md bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                      <div className="border-b px-4 py-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                  <Link
                    href="/auth/signin"
                    className="flex flex-col items-center text-white transition-colors hover:text-gray-300">
                    <User className="h-6 w-6" />
                    <span className="text-sm">Login</span>
                  </Link>
                )}

                {/* Cart with Dynamic Total */}
                <button
                  onClick={handleCartClick}
                  className="flex items-center space-x-3 rounded-lg p-2 text-white transition-colors hover:text-gray-300">
                  <div className="hidden flex-col items-end md:flex">
                    <span className="text-xs text-gray-400">Sub-Total</span>
                    <span className="text-sm font-semibold">{formatPrice(cartTotal)} AED</span>
                  </div>

                  <div className="relative">
                    <ShoppingCart className="h-7 w-7" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sliding Menu */}
        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="flex items-center justify-between border-b p-4">
            <Logo />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100">
              <X className="h-8 w-8 text-black" />
            </button>
          </div>

          {/* Mobile Menu User Info */}
          {user && (
            <div className="border-b bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Cart Total:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(cartTotal)} AED
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-6 p-4 text-lg text-black">
            <Link
              href="/"
              className="rounded-md px-2 py-2 transition-colors hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-md px-2 py-2 transition-colors hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}>
              Shop
            </Link>
            <Link
              href="/about"
              className="rounded-md px-2 py-2 transition-colors hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </div>
        </div>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsMenuOpen(false)} />
        )}
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        total={cartTotal}
      />

      <div className="fixed right-0 bottom-0 left-0 z-50 flex w-full justify-around border-t bg-white py-2 shadow-md md:hidden">
        {/* Home */}
        <Link href="/" className="flex flex-col items-center py-2 text-gray-700 hover:text-black">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V12H9v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9z"
            />
          </svg>
        </Link>

        <button
          onClick={() => setIsMobileSearchOpen((prev) => !prev)}
          className="flex flex-col items-center py-2 text-gray-700 hover:text-black">
          <Search className="h-6 w-6" />
        </button>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="flex flex-col items-center py-2 text-gray-700 hover:text-black">
          <LayoutDashboard />
        </Link>

        {/* Cart */}
        <button
          onClick={handleCartClick}
          className="relative flex flex-col items-center bg-transparent py-2 text-black hover:text-black">
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {itemCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <Link
          href={user ? "/profile" : "/auth/signin"}
          className="flex flex-col items-center py-2 text-gray-700 hover:text-black">
          <User className="h-6 w-6" />
        </Link>
      </div>

      <div
        className={`overflow-hidden bg-white transition-all duration-300 ease-in-out md:hidden ${
          isMobileSearchOpen ? "max-h-28 opacity-100" : "max-h-0 opacity-0"
        }`}>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-lg bg-gray-100 py-3 pr-4 pl-12 text-base text-gray-800 focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      </div>
    </>
  );
}
