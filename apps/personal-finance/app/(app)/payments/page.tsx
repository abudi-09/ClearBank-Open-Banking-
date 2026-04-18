import { PaymentForm } from "../../components/PaymentForm";

export default function PaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Send Money</h1>
      <PaymentForm
        accounts={[
          { id: "a1", label: "Checking ••••3344" },
          { id: "a2", label: "Savings ••••7788" },
        ]}
      />
    </div>
  );
}
