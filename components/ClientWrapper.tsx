"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAgeVerifyPage = pathname === "/ageVerify";

  return (
    <>
      {!isAgeVerifyPage && <Navbar />}
      {children}
      {!isAgeVerifyPage && <Footer />}
    </>
  );
}
