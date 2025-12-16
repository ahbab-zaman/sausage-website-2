"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, X, Search, Globe, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

import Logo from "@/components/logo";
import CartSidebar from "@/components/CartSidebar";
import SearchDropdown from "@/components/SearchDropdown";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const router = useRouter();

  /* ---------------- Cart ---------------- */
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotal());

  /* ---------------- Auth ---------------- */
  const { user, logout } = useAuthStore();

  const formatPrice = (price: number) => (isNaN(price) ? "0.00" : price.toFixed(2));

  const handleLogout = () => {
    logout();
    router.push("/auth/signin");
  };

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

              <button onClick={() => setIsCartOpen(true)} className="relative text-black">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden w-full items-center justify-between md:flex">
              {/* Logo */}
              <Logo />

              {/* 🔍 SEARCH (DESKTOP) */}
              <div className="mx-8 max-w-lg flex-1">
                <SearchDropdown baseUrl={process.env.NEXT_PUBLIC_API_BASE_URL!} />
              </div>

              {/* Right */}
              <div className="flex items-center space-x-6">
                {/* Language */}
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

                {/* Account */}
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

        {/* ================= MOBILE MENU ================= */}
        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transition-transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="flex items-center justify-between border-b p-4">
            <Logo />
            <button onClick={() => setIsMenuOpen(false)}>
              <X className="h-8 w-8" />
            </button>
          </div>

          <div className="flex flex-col space-y-4 p-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" onClick={() => setIsMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsMenuOpen(false)} />
        )}
      </nav>

      {/* ================= CART SIDEBAR ================= */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        total={cartTotal}
      />

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex justify-around border-t bg-white py-2 md:hidden">
        <Link href="/">
          <Search />
        </Link>

        <button onClick={() => setIsMobileSearchOpen((p) => !p)}>
          <Search />
        </button>

        <Link href="/dashboard">
          <LayoutDashboard />
        </Link>

        <button onClick={() => setIsCartOpen(true)} className="relative">
          <ShoppingCart />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {itemCount}
            </span>
          )}
        </button>

        <Link href={user ? "/profile" : "/auth/signin"}>
          <User />
        </Link>
      </div>
    </>
  );
}
