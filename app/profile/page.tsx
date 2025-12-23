import ProfileClient from "@/components/ProfileClient";
import React, { Suspense } from "react";

export default function ProfilePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfileClient />
      </Suspense>
    </div>
  );
}
