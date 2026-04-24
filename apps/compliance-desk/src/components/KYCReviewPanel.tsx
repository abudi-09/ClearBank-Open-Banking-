import { Loader2, X } from "lucide-react";
import type { KYCCase } from "@/mocks/handlers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  caseItem: KYCCase | null;
  notes: string;
  onNotesChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  submitting: boolean;
};

export function KYCReviewPanel({ open, onClose, caseItem, notes, onNotesChange, onApprove, onReject, submitting }: Props) {
  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        aria-hidden={!open}
        onClick={() => onClose()}
      />
      <div
        role="dialog"
        aria-modal={open}
        aria-label="KYC review"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-card shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Review KYC</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {caseItem ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-medium">{caseItem.userName}</p>
              <p className="text-xs text-muted-foreground">{caseItem.userEmail}</p>
            </div>

            <div
              className="flex h-52 items-center justify-center rounded-md border-2 border-dashed bg-muted text-muted-foreground"
              aria-label="Document preview placeholder"
            >
              <span className="text-sm font-semibold uppercase">{caseItem.docType.replaceAll("_", " ")}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kyc-notes">Reviewer notes</Label>
              <textarea
                id="kyc-notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add internal notes…"
                rows={5}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="mt-auto flex gap-2 pt-2">
              <Button type="button" variant="secondary" className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={onApprove} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Approve
              </Button>
              <Button type="button" variant="destructive" className="flex-1" onClick={onReject} disabled={submitting}>
                Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">Select a row to review.</div>
        )}
      </div>
    </>
  );
}
