import { UserRole } from "@clearbank/types";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_TOKEN_KEY, getRoleFromToken } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { accessToken?: string; error?: string };
      if (!res.ok || !json.accessToken) {
        setError(json.error ?? "Login failed.");
        setBusy(false);
        return;
      }

      const role = getRoleFromToken(json.accessToken);
      const parsed = UserRole.safeParse(role);
      if (!parsed.success || parsed.data !== "COMPLIANCE") {
        setError("Access denied — COMPLIANCE role required.");
        setBusy(false);
        return;
      }

      localStorage.setItem(AUTH_TOKEN_KEY, json.accessToken);
      navigate("/kyc");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <CardTitle>Compliance Desk</CardTitle>
          <p className="text-xs text-muted-foreground">
            Demo password for COMPLIANCE:{" "}
            <span className="rounded bg-muted px-1 font-mono font-semibold text-foreground">compliance-demo</span>
            {" · "}
            Any other password yields a non-compliance token (access denied).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
