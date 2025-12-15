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
  CreditCard,
  Wallet,
  Bell,
  Shield,
  Monitor,
  Globe,
  CheckCircle2,
  Edit2,
  Save,
  X
} from "lucide-react";

export default function AccountPage() {
  const { user, fetchAccountInfo, updateAccountInfo, isLoading } = useAuthStore();
  const [editMode, setEditMode] = useState(false);

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
        country_code: user.country_code || "",
        dob: user.dob || ""
      });
    }
  }, [user]);

  if (!user && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  const ReadOnly = !editMode;

  const Field = ({ label, icon: Icon, value, onChange, type = "text" }: any) => (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Icon className="h-4 w-4" /> {label}
      </label>
      <Input
        type={type}
        disabled={ReadOnly}
        value={value}
        onChange={onChange}
        className={ReadOnly ? "bg-slate-50" : ""}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* Header */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {user.firstname} {user.lastname}
              </h1>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> {user.status || "Active"}
              </p>
            </div>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "outline" : "default"}>
              {editMode ? <X className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  icon={User}
                  value={form.firstname}
                  onChange={(e: any) => setForm({ ...form, firstname: e.target.value })}
                />
                <Field
                  label="Last Name"
                  icon={User}
                  value={form.lastname}
                  onChange={(e: any) => setForm({ ...form, lastname: e.target.value })}
                />
              </div>
              <Field
                label="Date of Birth"
                type="date"
                icon={Calendar}
                value={form.dob}
                onChange={(e: any) => setForm({ ...form, dob: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Contact Details</h2>
              <Field
                label="Email"
                icon={Mail}
                value={form.email}
                onChange={(e: any) => setForm({ ...form, email: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Country Code"
                  icon={Globe}
                  value={form.country_code}
                  onChange={(e: any) => setForm({ ...form, country_code: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Phone Number"
                    icon={Phone}
                    value={form.telephone}
                    onChange={(e: any) => setForm({ ...form, telephone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="shadow-sm">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Account Details</h2>
              <p className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" /> Customer ID:{" "}
                <span className="font-medium">{user.customer_id}</span>
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4" /> Balance:{" "}
                <span className="font-medium">{user.balance}</span>
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4" /> Rewards:{" "}
                <span className="font-medium">{user.reward_total}</span>
              </p>
              <p className="text-sm">Account Created: {user.date_added}</p>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-sm">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
              <p className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4" /> Notifications:{" "}
                {user.notification_status ? "Enabled" : "Disabled"}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" /> Newsletter:{" "}
                {user.newsletter ? "Subscribed" : "Unsubscribed"}
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="shadow-sm md:col-span-2">
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold text-slate-800">Security & System Info</h2>
              <p className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" /> Status: {user.status}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4" /> Device: {user.device || "Unknown"}
              </p>
              <p className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" /> IP Address: {user.ip}
              </p>
            </CardContent>
          </Card>
        </div>

        {editMode && (
          <div className="flex justify-end gap-4">
            <Button
              onClick={async () => {
                await updateAccountInfo(form);
                setEditMode(false);
              }}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
