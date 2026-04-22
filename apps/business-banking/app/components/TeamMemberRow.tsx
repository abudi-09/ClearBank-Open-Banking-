"use client";

import { Button } from "@clearbank/ui";

export function TeamMemberRow(props: {
  email: string;
  role: "VIEWER" | "APPROVER" | "ADMIN";
  onRoleChange: (role: "VIEWER" | "APPROVER" | "ADMIN") => void;
  onRemove: () => void;
}) {
  const { email, role, onRoleChange, onRemove } = props;
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {email[0]?.toUpperCase()}
        </div>
        <span className="text-sm">{email}</span>
      </div>
      <div className="flex items-center gap-2">
        <select value={role} onChange={(e) => onRoleChange(e.target.value as "VIEWER" | "APPROVER" | "ADMIN")} className="rounded border p-2 text-sm">
          <option>VIEWER</option>
          <option>APPROVER</option>
          <option>ADMIN</option>
        </select>
        <Button className="bg-rose-600 hover:bg-rose-700" onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
}
