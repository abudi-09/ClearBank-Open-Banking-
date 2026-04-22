"use client";

import { Button, Card, Input } from "@clearbank/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../src/store/auth";

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAuth({
      accessToken: "biz-token",
      currentUser: { id: "biz-u1", email, companyName, role: "ADMIN" },
    });
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto mt-20 max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">Register Business Account</h1>
        <form className="space-y-3" onSubmit={submit}>
          <Input placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Create Business Account</Button>
        </form>
      </Card>
    </main>
  );
}
