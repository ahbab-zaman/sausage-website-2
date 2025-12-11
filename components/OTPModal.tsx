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

    const { success, error: verifyError } = await verifyOTP(otp);

    if (success) {
      onClose();
      router.push("/auth/signin");
    } else {
      setLocalError(verifyError || "OTP verification failed");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We have sent a verification code to <strong>{email}</strong>. Please enter it below.
          </DialogDescription>
        </DialogHeader>

        {pendingOTP && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-1 text-sm font-medium text-blue-900">Your OTP Code:</p>
            <p className="text-center text-2xl font-bold tracking-wider text-blue-600">
              {pendingOTP}
            </p>
            <p className="mt-2 text-center text-xs text-blue-700">(For testing purposes only)</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className={localError || error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {(localError || error) && (
              <p className="mt-1 text-sm text-red-600">{localError || error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={isLoading}>
              Cancel
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Did not receive the code?{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium"
              onClick={() => {
                // Implement resend OTP logic here if needed
                console.log("Resend OTP");
              }}>
              Resend
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
