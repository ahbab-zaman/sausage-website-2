import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import AgeRedirect from "@/components/AgeRedirect";
import ClientLayoutWrapper from "@/components/ClientWrapper";

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
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <AgeRedirect />
      </body>
    </html>
  );
}
