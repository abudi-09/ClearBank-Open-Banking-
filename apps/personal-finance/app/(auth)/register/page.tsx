"use client";

import { Button, Card, Input } from "@clearbank/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../src/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuth({
      accessToken: "demo-token",
      currentUser: { id: "u_1", email, fullName, kycStatus: "PENDING" },
    });
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto mt-20 max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Register Personal Account</h1>
        <form className="space-y-3" onSubmit={submit}>
          <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Create Account</Button>
        </form>
      </Card>
    </main>
  );
}
