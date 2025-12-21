"use client";

import { useRouter } from "next/navigation";
import bgCover from "@/public/bg-shape.jpg";
import logo from "@/public/logo-white.png";
import Image from "next/image";

export default function AgeVerify() {
  const router = useRouter();

  const handleConfirm = () => {
    // Mark the user as verified for this session
    sessionStorage.setItem("ageVerified", "true");
    router.push("/"); // Go to home
  };

  const handleExit = () => {
    if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      window.location.href = "https://www.google.com"; // fallback
    }
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-4"
      style={{
        backgroundImage: `url(${bgCover.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
      <div className="mb-10 flex justify-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-full">
          <Image src={logo} width={150} height={150} alt="Bottle sausage Logo" />
        </div>
      </div>

      <h1 className="mb-4 text-4xl font-bold text-white">Age Verification</h1>

      <p className="mb-10 max-w-lg text-center text-lg leading-relaxed text-gray-300">
        The website requires you to be 21 years of age or older. Please verify your age to view the
        content, or click Exit to leave.
      </p>

      <div className="flex gap-6">
        <button
          onClick={handleConfirm}
          className="cursor-pointer rounded-md border-2 border-[#c35151] bg-[#9f2d2d] px-10 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-[#b13535]po">
          I AM OVER 21
        </button>

        <button
          onClick={handleExit}
          className="rounded-md border-2 border-gray-400 bg-transparent px-10 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-gray-700">
          EXIT
        </button>
      </div>
    </div>
  );
}
