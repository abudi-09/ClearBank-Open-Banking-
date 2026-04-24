import { AuditLogTable } from "@/components/AuditLogTable";

export default function AuditLogPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">Immutable record of privileged actions.</p>
      </div>
      <AuditLogTable />
    </div>
  );
}
