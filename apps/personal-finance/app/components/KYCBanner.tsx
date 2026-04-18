import Link from "next/link";

export function KYCBanner({ status }: { status: "PENDING" | "VERIFIED" | "REJECTED" }) {
  if (status === "VERIFIED") return null;
  const text =
    status === "PENDING"
      ? "Your KYC review is pending. Complete missing documents to speed up verification."
      : "Your KYC was rejected. Please resubmit updated documents.";

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
      <p className="text-sm">{text}</p>
      <Link href="/profile" className="mt-2 inline-block text-sm font-semibold underline">
        Review KYC details
      </Link>
    </div>
  );
}
