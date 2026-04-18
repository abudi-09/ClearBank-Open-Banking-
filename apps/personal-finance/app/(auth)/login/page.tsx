"use client";

import { Button, Input, Card } from "@clearbank/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../src/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuth({
      accessToken: "demo-token",
      currentUser: { id: "u_1", email, fullName: "Personal User", kycStatus: "PENDING" },
    });
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto mt-20 max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Continue</Button>
        </form>
      </Card>
    </main>
  );
}
