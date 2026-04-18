"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../../src/store/auth";

const nav = [
  ["/dashboard", "Dashboard"],
  ["/accounts", "Accounts"],
  ["/payments", "Payments"],
  ["/payments/history", "Payments History"],
  ["/budget", "Budget"],
  ["/savings", "Savings"],
  ["/profile", "Profile"],
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">ClearBank</h2>
        <nav className="space-y-2">
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`block rounded px-3 py-2 text-sm ${pathname === href ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
