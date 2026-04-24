import type { ReactNode } from "react";
import type { MockTransaction } from "@/mocks/handlers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TriggerProps = {
  tx: MockTransaction;
  trigger: ReactNode;
};

type ControlledProps = {
  tx: MockTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionDetailModal(props: TriggerProps | ControlledProps) {
  if ("trigger" in props) {
    const { tx, trigger } = props;
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction #{tx.id}</DialogTitle>
          </DialogHeader>
          <TransactionBody tx={tx} />
        </DialogContent>
      </Dialog>
    );
  }

  const { tx, open, onOpenChange } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction #{tx?.id ?? ""}</DialogTitle>
        </DialogHeader>
        {tx ? <TransactionBody tx={tx} /> : <p className="text-sm text-muted-foreground">No transaction.</p>}
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function TransactionBody({ tx }: { tx: MockTransaction }) {
  return (
    <>
      <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(tx, null, 2)}</pre>
      <div className="space-y-2 pt-2">
        <p className="text-sm font-semibold">Ledger trail</p>
        <pre className="whitespace-pre-wrap rounded-md border bg-background p-3 text-xs">{tx.ledgerTrail}</pre>
      </div>
    </>
  );
}
