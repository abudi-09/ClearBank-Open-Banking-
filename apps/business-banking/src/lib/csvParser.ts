const supportedCurrencies = new Set(["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"]);
const ibanRegex = /^[A-Z]{2}[0-9A-Z]{13,32}$/;

export type BulkPaymentRow = {
  recipient_iban: string;
  amount: number;
  currency: string;
  description: string;
};

export type InvalidRow = {
  row: Record<string, string>;
  reason: string;
};

export function parsePaymentCSV(raw: string): { valid: BulkPaymentRow[]; invalid: InvalidRow[] } {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return { valid: [], invalid: [] };

  const [header, ...rows] = lines;
  const headers = header.split(",").map((h) => h.trim());
  const required = ["recipient_iban", "amount", "currency", "description"];
  if (!required.every((item) => headers.includes(item))) {
    return { valid: [], invalid: rows.map((r) => ({ row: { raw: r }, reason: "Missing required CSV headers." })) };
  }

  const valid: BulkPaymentRow[] = [];
  const invalid: InvalidRow[] = [];

  for (const line of rows) {
    const cells = line.split(",").map((v) => v.trim());
    const mapped = Object.fromEntries(headers.map((h, idx) => [h, cells[idx] ?? ""]));
    const iban = (mapped.recipient_iban ?? "").toUpperCase();
    const amount = Number.parseFloat(mapped.amount ?? "");
    const currency = (mapped.currency ?? "").toUpperCase();
    const description = mapped.description ?? "";

    if (!ibanRegex.test(iban)) {
      invalid.push({ row: mapped, reason: "Invalid IBAN format." });
      continue;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      invalid.push({ row: mapped, reason: "Amount must be positive." });
      continue;
    }
    if (!supportedCurrencies.has(currency)) {
      invalid.push({ row: mapped, reason: "Unsupported currency." });
      continue;
    }

    valid.push({ recipient_iban: iban, amount, currency, description });
  }

  return { valid, invalid };
}
