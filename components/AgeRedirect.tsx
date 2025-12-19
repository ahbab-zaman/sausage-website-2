"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AgeRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const ageVerified = sessionStorage.getItem("ageVerified");

    // Only redirect if user is NOT verified and not on /ageVerify
    if (!ageVerified && pathname !== "/ageVerify") {
      router.replace("/ageVerify");
    }
  }, [pathname, router]);

  return null;
}
