import { Card, Badge } from "@clearbank/ui";

const accounts = [
  { id: "b1", name: "Operating", currency: "GBP", flag: "🇬🇧", balance: 120300 },
  { id: "b2", name: "Payroll", currency: "USD", flag: "🇺🇸", balance: 75320 },
];

export default function AccountsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Business Accounts</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-2xl font-bold">
                  {account.flag} {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(account.balance)}
                </p>
              </div>
              <Badge>{account.currency}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
