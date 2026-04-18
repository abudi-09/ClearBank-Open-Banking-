import { Badge, Card } from "@clearbank/ui";

function maskIban(iban: string) {
  if (iban.length <= 8) return iban;
  return `${iban.slice(0, 4)}****${iban.slice(-4)}`;
}

export function AccountCard(props: { type: string; balance: number; currency: string; iban: string }) {
  const { type, balance, currency, iban } = props;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{type}</p>
          <p className="mt-1 text-2xl font-semibold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(balance)}
          </p>
          <p className="mt-2 text-xs text-slate-400">IBAN: {maskIban(iban)}</p>
        </div>
        <Badge>{currency}</Badge>
      </div>
    </Card>
  );
}
