import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { AMLAlert } from "@/mocks/handlers";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { Badge } from "@/components/ui/badge";

type Props = {
  alert: AMLAlert;
  onMarkReviewed: (id: string) => void;
  busy?: boolean;
};

export function AMLAlertRow({ alert, onMarkReviewed, busy }: Props) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{alert.transactionId}</TableCell>
      <TableCell className="font-mono text-xs">{alert.account}</TableCell>
      <TableCell>
        {alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
        <span className="text-muted-foreground">{alert.currency}</span>
      </TableCell>
      <TableCell>{alert.reason}</TableCell>
      <TableCell>
        <RiskScoreBadge score={alert.riskScore} />
      </TableCell>
      <TableCell>
        {alert.reviewed ? <Badge variant="outline">Reviewed</Badge> : <Badge variant="warning">Pending</Badge>}
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline" disabled={alert.reviewed || busy} onClick={() => onMarkReviewed(alert.id)}>
          Mark reviewed
        </Button>
      </TableCell>
    </TableRow>
  );
}
