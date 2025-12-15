"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useForm } from "@/hooks/useForm";
import { SignInSchema, type SignInForm } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AiFillExclamationCircle } from "react-icons/ai";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore();
  const { data, errors, isSubmitting, setValue, handleSubmit } = useForm(SignInSchema);

  const onSubmit = async (formData: SignInForm) => {
    const result = await login({
      email: formData.email,
      password: formData.password
    });
    if (result.success) {
      router.push("/");
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#f2f2f2] py-3">
        <div className="mx-auto flex max-w-7xl items-center px-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="mx-3 h-4 w-4" />
          <Link href="/auth/account" className="hover:text-gray-900">
            Account
          </Link>
          <ChevronRight className="mx-3 h-4 w-4" />
          <span className="font-medium text-gray-900">Login</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-start justify-center bg-white px-4 pt-12 pb-20 sm:pt-20">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="mb-2 text-center text-4xl font-bold text-gray-900">Login</h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-red-600 hover:text-red-500">
              Register Now
            </Link>
          </p>

          {authError && (
            <div className="mb-6 rounded-md bg-[#BF3334] p-4 font-semibold text-white">
              <div className="flex items-center gap-4">
                <AiFillExclamationCircle />
                <p className="text-sm text-white">{authError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit);
              }}>
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">
                  E-Mail Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-Mail Address"
                  value={data.email || ""}
                  onChange={(e) => setValue("email", e.target.value)}
                  className="h-12 border-gray-300 text-base placeholder:text-gray-400 focus-visible:ring-1"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={data.password || ""}
                  onChange={(e) => setValue("password", e.target.value)}
                  className="h-12 border-gray-300 text-base placeholder:text-gray-400 focus-visible:ring-1"
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-gray-900 text-base font-medium hover:bg-gray-800"
                disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="pt-4 text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-600 underline hover:text-gray-900">
                  Forgotten Password
                </Link>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/auth/signup"
                  className="text-sm text-gray-600 underline hover:text-gray-900">
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
