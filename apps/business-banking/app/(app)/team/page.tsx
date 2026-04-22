"use client";

import { Button, Input } from "@clearbank/ui";
import { useState } from "react";
import { TeamMemberRow } from "../../components/TeamMemberRow";

type Member = { email: string; role: "VIEWER" | "APPROVER" | "ADMIN" };

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"VIEWER" | "APPROVER" | "ADMIN">("VIEWER");
  const [members, setMembers] = useState<Member[]>([
    { email: "owner@acme.dev", role: "ADMIN" },
    { email: "ops@acme.dev", role: "APPROVER" },
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Team</h1>
      <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <Input placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
        <select className="rounded border p-2" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "VIEWER" | "APPROVER" | "ADMIN")}>
          <option>VIEWER</option>
          <option>APPROVER</option>
          <option>ADMIN</option>
        </select>
        <Button onClick={() => inviteEmail && setMembers((m) => [...m, { email: inviteEmail, role: inviteRole }])}>Invite</Button>
      </div>
      <div className="space-y-2">
        {members.map((member, idx) => (
          <TeamMemberRow
            key={member.email}
            email={member.email}
            role={member.role}
            onRoleChange={(role) => setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, role } : m)))}
            onRemove={() => setMembers((prev) => prev.filter((_, i) => i !== idx))}
          />
        ))}
      </div>
    </div>
  );
}
