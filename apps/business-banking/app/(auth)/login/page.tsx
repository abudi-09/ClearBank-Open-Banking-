"use client";

import { Button, Card, Input } from "@clearbank/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../src/store/auth";

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setAuth({
      accessToken: "biz-token",
      currentUser: { id: "biz-u1", email, companyName: "Acme Ltd", role: "ADMIN" },
    });
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto mt-20 max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Business Login</h1>
        <form className="space-y-3" onSubmit={submit}>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login</Button>
        </form>
      </Card>
    </main>
  );
}
