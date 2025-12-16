"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Optional: for extra smooth modal animation

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function OTPModal({ isOpen, onClose, email }: OTPModalProps) {
  const router = useRouter();
  const { verifyOTP, isLoading, error, clearError, pendingOTP } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!otp || otp.length < 4) {
      setLocalError("Please enter a valid OTP");
      return;
    }

    const result = await verifyOTP(otp);

    if (result.success) {
      onClose();
      router.push("/auth/signin");
    } else {
      setLocalError(result.error || "OTP verification failed");
    }
  };

  const handleClose = () => {
    setOtp("");
    setLocalError(null);
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden rounded-2xl border-0 shadow-2xl sm:max-w-md">
        {/* Optional: Add motion wrapper for entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-center text-3xl font-bold text-black">
              Verify Your Email
            </DialogTitle>
            <DialogDescription className="mt-3 text-center text-base text-gray-700">
              We've sent a 6-digit verification code to
              <span className="font-semibold text-black"> {email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 pb-8">
            {pendingOTP && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
                <p className="mb-2 text-sm font-bold text-black">Your OTP Code (for testing):</p>
                <p className="text-3xl font-bold tracking-widest text-blue-600">{pendingOTP}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className={`h-14 border-2 text-center text-2xl font-semibold tracking-widest transition-all duration-300 ${
                    localError || error
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-black"
                  }`}
                  disabled={isLoading}
                />
                {(localError || error) && (
                  <p className="mt-2 text-center text-sm font-medium text-red-600">
                    {localError || error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl bg-black text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-900 hover:shadow-xl">
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl border-2 border-black bg-transparent text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-black hover:text-white">
                  Cancel
                </Button>
              </div>

              <p className="pt-2 text-center text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="font-bold text-black underline transition-colors hover:text-gray-800"
                  onClick={() => console.log("Resend OTP")}>
                  Resend
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
