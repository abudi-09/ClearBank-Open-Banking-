"use client";

import { Button, Card, Input } from "@clearbank/ui";
import { KYCBanner } from "../../components/KYCBanner";
import { useAuthStore } from "../../../src/store/auth";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.currentUser);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <KYCBanner status={user?.kycStatus ?? "PENDING"} />
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Personal Info</h2>
        <p className="text-sm">Name: {user?.fullName ?? "Personal User"}</p>
        <p className="text-sm">Email: {user?.email ?? "user@clearbank.dev"}</p>
      </Card>
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Change Password</h2>
        <form className="space-y-2">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Button type="submit">Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
