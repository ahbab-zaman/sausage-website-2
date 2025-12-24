"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import logo from "@/public/logo.png";
import appStore from "@/public/app-store.png";
import google from "@/public/google-play.png";

const Logo = () => (
  <div className="mb-4 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gray-200">
    <Image
      src={logo}
      alt="Scan QR to download our app"
      width={120}
      height={120}
      className="rounded-lg"
    />
  </div>
);

const QRCode = () => (
  <Image
    src={"https://thebottlestoredelivery.com/catalog/view/theme/new/assets/img/misc/qr-code.svg"}
    alt="Scan QR to download our app"
    width={120}
    height={120}
    className="rounded-lg"
  />
);

const AppStoreIcon = () => (
  <Image src={appStore} alt="Download on the App Store" width={24} height={24} className="mx-1" />
);

const GooglePlayIcon = () => (
  <Image src={google} alt="Get it on Google Play" width={24} height={24} className="mx-1" />
);

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ title, children, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div className="border-b border-gray-700">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold transition-colors hover:text-gray-300">
        <span>{title}</span>
        {isOpen ? (
          <Minus className="h-5 w-5 transition-transform" />
        ) : (
          <Plus className="h-5 w-5 transition-transform" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}>
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-[#3A3938] px-4 py-6 text-white">
      <div className="mx-auto md:px-12">
        {/* Back to Top */}
        <div className="mb-8 text-center md:text-left">
          <Link
            href="/"
            className="inline-block rounded-md px-4 py-2 text-sm font-medium text-white underline transition-colors">
            BACK TO TOP
          </Link>
        </div>

        {/* Mobile Accordion View */}
        <div className="px-2 md:hidden">
          {/* About Our Company */}
          <AccordionItem
            title="About Our Company"
            isOpen={openSection === "about"}
            onToggle={() => toggleSection("about")}>
            <div className="space-y-4">
              <Logo />
              <p className="text-sm text-gray-300">
                The Bottle Store home delivery service offers instant store, wine, spirit and other
                drink delivery throughout Abu Dhabi.
              </p>
              <p className="text-xs text-gray-400">Open 7 days a week from 9am-11:30pm</p>
            </div>
          </AccordionItem>

          {/* Products */}
          <AccordionItem
            title="Products"
            isOpen={openSection === "products"}
            onToggle={() => toggleSection("products")}>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products/beer-cider" className="transition-colors hover:text-white">
                  Beer & Cider
                </Link>
              </li>
              <li>
                <Link href="/products/spirits" className="transition-colors hover:text-white">
                  Spirits
                </Link>
              </li>
              <li>
                <Link href="/products/wine" className="transition-colors hover:text-white">
                  Wine
                </Link>
              </li>
              <li>
                <Link
                  href="/products/champagne-sparkling"
                  className="transition-colors hover:text-white">
                  Champagne & Sparkling
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="transition-colors hover:text-white">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/products/soft-drinks" className="transition-colors hover:text-white">
                  Soft Drinks
                </Link>
              </li>
            </ul>
          </AccordionItem>

          {/* General */}
          <AccordionItem
            title="General"
            isOpen={openSection === "general"}
            onToggle={() => toggleSection("general")}>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="transition-colors hover:text-white">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition-colors hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/refer" className="transition-colors hover:text-white">
                  Refer Your Friends
                </Link>
              </li>
            </ul>
          </AccordionItem>

          {/* Download Our App */}
          <AccordionItem
            title="Download Our App"
            isOpen={openSection === "app"}
            onToggle={() => toggleSection("app")}>
            <div className="flex flex-col rounded-xl border-[1px] p-4">
              <div className="mb-4 flex items-center justify-center space-x-2">
                <div className="rounded-lg bg-black p-2">
                  <AppStoreIcon />
                </div>
                <div className="rounded-lg bg-black p-2">
                  <GooglePlayIcon />
                </div>
              </div>
              <div className="flex flex-col items-center rounded-lg p-2">
                <p className="mb-2 text-center text-xs">Scan the QR code to download our app</p>
                <QRCode />
              </div>
            </div>
          </AccordionItem>

          {/* License Info for Mobile */}
          <div className="mt-6 space-y-2 border-t border-gray-700 pt-6 pb-2 text-center text-xs text-gray-400">
            <p>License Number: CN-431474321</p>
            <p>TRN 543530773324З</p>
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden grid-cols-1 gap-8 md:grid md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About Our Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Our Company</h3>
            <Logo />
            <p className="text-sm text-gray-300">
              The Bottle Store home delivery service offers instant store, wine, spirit and other
              drink delivery throughout Abu Dhabi.
            </p>
            <p className="text-xs text-gray-400">Open 7 days a week from 9am-11:30pm</p>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products/beer-cider" className="transition-colors hover:text-white">
                  Beer & Cider
                </Link>
              </li>
              <li>
                <Link href="/products/spirits" className="transition-colors hover:text-white">
                  Spirits
                </Link>
              </li>
              <li>
                <Link href="/products/wine" className="transition-colors hover:text-white">
                  Wine
                </Link>
              </li>
              <li>
                <Link
                  href="/products/champagne-sparkling"
                  className="transition-colors hover:text-white">
                  Champagne & Sparkling
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="transition-colors hover:text-white">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/products/soft-drinks" className="transition-colors hover:text-white">
                  Soft Drinks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="transition-colors hover:text-white">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition-colors hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/refer" className="transition-colors hover:text-white">
                  Refer Your Friends
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Download Our App */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Download Our App</h3>
            <div className="flex flex-col rounded-xl border-[1px] p-4">
              <div className="mb-4 flex items-center justify-center space-x-2">
                <div className="rounded-lg bg-black p-2">
                  <AppStoreIcon />
                </div>

                <div className="rounded-lg bg-black p-2">
                  <GooglePlayIcon />
                </div>
              </div>
              <div className="flex flex-col items-center rounded-lg p-2">
                <p className="mb-2 text-center text-xs">Scan the QR code to download our app</p>
                <QRCode />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Desktop Only */}
        <div className="mt-8 hidden border-t border-gray-700 pt-6 text-center text-xs text-gray-400 md:block">
          &copy; 2025 The Bottle Store. All rights reserved.
        </div>

        {/* Copyright - Mobile */}
        <div className="mt-4 text-center text-xs text-gray-400 md:hidden">
          <p>&copy; The Bottle Store • Design & Built by Fabric</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
