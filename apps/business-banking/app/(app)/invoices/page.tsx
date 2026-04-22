import { InvoiceBuilder } from "../../components/InvoiceBuilder";

export default function InvoicesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <InvoiceBuilder />
    </div>
  );
}
