"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Activity,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type TabType = "profile" | "security" | "notifications" | "activity";

export default function AccountPage() {
  const { user, fetchAccountInfo, updateAccountInfo, isLoading, error } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [editMode, setEditMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    country_code: "",
    dob: ""
  });

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        telephone: user.telephone || "",
        country_code: user.country_code || "+880",
        dob: user.dob || ""
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstname.trim()) newErrors.firstname = "First name is required";
    if (!form.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.telephone.trim()) newErrors.telephone = "Phone number is required";
    else if (form.telephone.length < 10)
      newErrors.telephone = "Phone number must be at least 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    const res = await updateAccountInfo(form);
    if (res.success) {
      setEditMode(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } else {
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        telephone: user.telephone || "",
        country_code: user.country_code || "+880",
        dob: user.dob || ""
      });
    }
    setEditMode(false);
    setErrors({});
  };

  const getInitials = () => {
    const first = form.firstname || user?.firstname || "";
    const last = form.lastname || user?.lastname || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  if (!user && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#2222]" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/auth/signin")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "activity", label: "Activity", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="relative h-32 bg-[#f2f2f2]">
              <div className="absolute -bottom-16 left-8">
                <div className="group relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#f2f2f2] text-4xl font-bold text-white shadow-xl transition-transform duration-300 hover:scale-105">
                    {getInitials()}
                  </div>
                  <button className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl">
                    <Camera className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-20 pr-8 pb-6 pl-8 sm:pl-48">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {form.firstname} {form.lastname}
                  </h1>
                  <p className="mt-1 flex items-center text-sm text-gray-600 sm:text-base">
                    <Mail className="mr-2 h-4 w-4" />
                    {form.email}
                  </p>
                </div>
                {activeTab === "profile" && (
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "outline" : "default"}
                    className="transition-all duration-300"
                    size="sm">
                    {editMode ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex w-full items-center rounded-lg px-4 py-3 text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-[#28AA5A] text-white shadow-md"
                            : "text-gray-700 hover:bg-[#28AA5A]"
                        }`}>
                        <Icon className="mr-3 h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    {/* Name Row */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="group">
                        <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                          <User className="mr-2 h-4 w-4" />
                          First Name
                        </label>
                        <Input
                          disabled={!editMode}
                          value={form.firstname}
                          onChange={(e) => {
                            setForm({ ...form, firstname: e.target.value });
                            setErrors({ ...errors, firstname: "" });
                          }}
                          className={`transition-all duration-300 ${
                            editMode
                              ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              : "bg-gray-50"
                          } ${errors.firstname ? "border-red-500" : ""}`}
                          placeholder="Enter first name"
                        />
                        {errors.firstname && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>
                        )}
                      </div>

                      <div className="group">
                        <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                          <User className="mr-2 h-4 w-4" />
                          Last Name
                        </label>
                        <Input
                          disabled={!editMode}
                          value={form.lastname}
                          onChange={(e) => {
                            setForm({ ...form, lastname: e.target.value });
                            setErrors({ ...errors, lastname: "" });
                          }}
                          className={`transition-all duration-300 ${
                            editMode
                              ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              : "bg-gray-50"
                          } ${errors.lastname ? "border-red-500" : ""}`}
                          placeholder="Enter last name"
                        />
                        {errors.lastname && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Address
                      </label>
                      <Input
                        disabled={!editMode}
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                        className={`transition-all duration-300 ${
                          editMode
                            ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            : "bg-gray-50"
                        } ${errors.email ? "border-red-500" : ""}`}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Phone Row */}
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="group">
                        <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                          <MapPin className="mr-2 h-4 w-4" />
                          Country Code
                        </label>
                        <Input
                          disabled={!editMode}
                          value={form.country_code}
                          onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                          className={`transition-all duration-300 ${
                            editMode
                              ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              : "bg-gray-50"
                          }`}
                          placeholder="+880"
                        />
                      </div>

                      <div className="group sm:col-span-2">
                        <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                          <Phone className="mr-2 h-4 w-4" />
                          Phone Number
                        </label>
                        <Input
                          disabled={!editMode}
                          value={form.telephone}
                          onChange={(e) => {
                            setForm({ ...form, telephone: e.target.value });
                            setErrors({ ...errors, telephone: "" });
                          }}
                          className={`transition-all duration-300 ${
                            editMode
                              ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              : "bg-gray-50"
                          } ${errors.telephone ? "border-red-500" : ""}`}
                          placeholder="Enter phone number"
                        />
                        {errors.telephone && (
                          <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="group">
                      <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        Date of Birth
                      </label>
                      <Input
                        disabled={!editMode}
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        className={`transition-all duration-300 ${
                          editMode
                            ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            : "bg-gray-50"
                        }`}
                      />
                    </div>

                    {/* Action Buttons */}
                    {editMode && (
                      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">
                        <Button
                          onClick={handleUpdate}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:shadow-lg">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 transition-all duration-300 hover:bg-gray-100">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-6">
                      <h3 className="mb-2 font-semibold text-gray-900">Change Password</h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Update your password to keep your account secure
                      </p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Change Password
                      </Button>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-6">
                      <h3 className="mb-2 font-semibold text-gray-900">
                        Two-Factor Authentication
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <input type="checkbox" className="h-5 w-5 rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                      <input type="checkbox" className="h-5 w-5 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "activity" && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm text-gray-600">No recent activity to display</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              Success!
            </DialogTitle>
            <DialogDescription className="pt-2">
              Your profile has been updated successfully.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <X className="h-5 w-5" />
              </div>
              Error
            </DialogTitle>
            <DialogDescription className="pt-2">
              {error || "Failed to update profile. Please try again."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
