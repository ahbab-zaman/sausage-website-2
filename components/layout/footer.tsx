import Link from "next/link"; // For internal navigation
import Image from "next/image"; // For optimized images
import logo from "@/public/logo.png";
import appStore from "@/public/app-store.png";
import google from "@/public/google-play.png";
// Placeholder for logo: Replace with actual logo path
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

// Placeholder QR code: Replace with actual QR image URL
const QRCode = () => (
  <Image
    src={"https://thebottlestoredelivery.com/catalog/view/theme/new/assets/img/misc/qr-code.svg"} // Replace with your QR code image
    alt="Scan QR to download our app"
    width={120}
    height={120}
    className="rounded-lg"
  />
);

// App store icons: Use placeholders or actual SVGs
const AppStoreIcon = () => (
  <Image src={appStore} alt="Download on the App Store" width={24} height={24} className="mx-1" />
);

const GooglePlayIcon = () => (
  <Image src={google} alt="Get it on Google Play" width={24} height={24} className="mx-1" />
);

const Footer = () => {
  return (
    <footer className="bg-[#3A3938] px-4 py-6 text-white">
      <div className="mx-auto px-12">
        <div className="mb-8 text-center md:text-left">
          <Link
            href="/"
            className="inline-block rounded-md px-4 py-2 text-sm font-medium text-white underline transition-colors">
            BACK TO TOP
          </Link>
        </div>

        {/* Main Footer Grid: 1-col mobile, 4-col desktop */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Optional: Copyright or additional footer line */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
          &copy; 2025 The Bottle Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
