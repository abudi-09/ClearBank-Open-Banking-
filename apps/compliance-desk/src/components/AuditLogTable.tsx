import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AuditPayload = {
  items: Array<{
    id: string;
    action: string;
    userEmail: string;
    ipAddress: string;
    timestamp: string;
  }>;
  page: number;
  pageCount: number;
  total: number;
  uniqueActions: string[];
};

export function AuditLogTable() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", page, action],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (action !== "all") params.set("action", action);
      const res = await fetch(`/audit-log?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load audit log");
      return (await res.json()) as AuditPayload;
    },
  });

  const actionOptions = useMemo(() => data?.uniqueActions ?? [], [data?.uniqueActions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by action</span>
        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionOptions.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User email</TableHead>
              <TableHead>IP address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.action}</TableCell>
                <TableCell>{row.userEmail}</TableCell>
                <TableCell className="font-mono text-xs">{row.ipAddress}</TableCell>
                <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.items.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No rows.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {data?.page ?? page} / {data?.pageCount ?? 1} · {data?.total ?? 0} total
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data ? page >= data.pageCount : true}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
