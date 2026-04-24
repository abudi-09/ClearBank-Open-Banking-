import { NavLink, Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/kyc", label: "KYC" },
  { to: "/aml", label: "AML Alerts" },
  { to: "/transactions", label: "Transactions" },
  { to: "/audit-log", label: "Audit Log" },
  { to: "/reports", label: "Reports" },
];

export function ComplianceLayout(props: { companyName?: string }) {
  const company = props.companyName ?? "Compliance Ops";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 shrink-0 border-r bg-muted/40 px-4 py-6">
        <div className="flex items-center gap-2 px-2 font-semibold">
          <ShieldAlert className="h-5 w-5 text-primary" aria-hidden />
          <span className="truncate">{company}</span>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
