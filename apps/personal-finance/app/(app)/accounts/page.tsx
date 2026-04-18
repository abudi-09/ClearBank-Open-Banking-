import { AccountCard } from "../../components/AccountCard";

const accounts = [
  { id: "a1", type: "CHECKING", balance: 5420.33, currency: "GBP", iban: "GB12CLRB11112222333344" },
  { id: "a2", type: "SAVINGS", balance: 15010.37, currency: "GBP", iban: "GB12CLRB55556666777788" },
];

export default function AccountsPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Accounts</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <AccountCard key={account.id} {...account} />
        ))}
      </div>
    </div>
  );
}
