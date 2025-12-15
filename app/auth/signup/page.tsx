"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/stores/authStore";
import { useForm } from "@/hooks/useForm";
import { SignUpSchema, type SignUpForm } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AiFillExclamationCircle } from "react-icons/ai";

export default function RegisterPage() {
  const router = useRouter();
  const { signup, isLoading, error: authError } = useAuthStore(); // Adjust to your store's register function
  const { data, errors, isSubmitting, setValue, handleSubmit } = useForm(SignUpSchema);
  const [subscribe, setSubscribe] = useState("no");
  const [agreePolicy, setAgreePolicy] = useState(false);

  const onSubmit = async (formData: SignUpForm) => {
    // Add subscribe and agreePolicy to your formData if needed
    const result = await signup({
      email: formData.email,
      password: formData.password,
      firstname: formData.firstName,
      lastname: formData.lastName,
      telephone: formData.telephone,
      country_code: formData.countryCode || "+880",
      dob: formData.dob
    });
    if (result.success) {
      router.push("/"); // or next step
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
          <span className="font-medium text-gray-900">Register</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-start justify-center bg-white px-4 pt-12 pb-20 sm:pt-20">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <h1 className="mb-2 text-center text-4xl font-bold text-gray-900">Register Account</h1>
          <p className="mb-8 text-center text-sm text-gray-600">
            If you already have an account with us, please login at the{" "}
            <Link href="/auth/signin" className="font-medium text-red-600 hover:text-red-500">
              login page
            </Link>
            .
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
          <div className="rounded-lg border border-gray-200 bg-white p-10 shadow-sm">
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (!agreePolicy) {
                  // Handle policy not agreed
                  return;
                }
                handleSubmit(onSubmit);
              }}>
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={data.firstName || ""}
                    onChange={(e) => setValue("firstName", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={data.lastName || ""}
                    onChange={(e) => setValue("lastName", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email & Mobile Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-Mail"
                    value={data.email || ""}
                    onChange={(e) => setValue("email", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="+971"
                      value={data.countryCode || "+971"}
                      onChange={(e) => setValue("countryCode", e.target.value)}
                      className="h-12 w-24 border-gray-300"
                    />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Mobile Number"
                      value={data.telephone || ""}
                      onChange={(e) => setValue("telephone", e.target.value)}
                      className="h-12 flex-1 border-gray-300 placeholder:text-gray-400"
                    />
                  </div>
                  {(errors.countryCode || errors.telephone) && (
                    <p className="text-sm text-red-600">{errors.countryCode || errors.telephone}</p>
                  )}
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={data.password || ""}
                    onChange={(e) => setValue("password", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Password Confirm
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Password Confirm"
                    value={data.confirmPassword || ""}
                    onChange={(e) => setValue("confirmPassword", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* ID Upload & DOB Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Please share an image of your Emirates ID to confirm your identity
                  </p>
                  <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4v-8m0 0V12a4 4 0 00-4-4H20l-4 4h-4"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-gray-900 hover:text-gray-700">
                          <span>Upload File</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={data.dob || ""}
                    onChange={(e) => setValue("dob", e.target.value)}
                    className="h-12 border-gray-300 placeholder:text-gray-400"
                  />
                  {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}
                </div>
              </div>

              {/* Newsletter Subscription */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Subscribe to newsletter</Label>
                <RadioGroup
                  value={subscribe}
                  onValueChange={setSubscribe}
                  className="flex items-center space-x-6 rounded-md bg-gray-100 p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="cursor-pointer font-normal">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy"
                  checked={agreePolicy}
                  onCheckedChange={(checked) => setAgreePolicy(checked as boolean)}
                />
                <Label
                  htmlFor="privacy"
                  className="cursor-pointer text-sm font-normal text-gray-700">
                  I have read and agree to the Privacy Policy
                </Label>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-gray-900 text-base font-medium hover:bg-gray-800"
                  disabled={isSubmitting || isLoading || !agreePolicy}>
                  {isSubmitting || isLoading ? "Processing..." : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
