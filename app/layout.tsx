import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
// import "antd/dist/reset.css";

const inter = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "The Bottle Store Abu Dhabi | Alcohol Delivery Abu Dhabi | 90 Min Home Delivery of Beer and Wine",
  description:
    "The Bottle Store - Experience fast and reliable alcohol home delivery in Abu Dhabi with The Bottle Store. We deliver top beer, wine, and spirit brands in under 90 minutes.",
  generator: "v0.dev",
  icons: {
    icon: "./logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
