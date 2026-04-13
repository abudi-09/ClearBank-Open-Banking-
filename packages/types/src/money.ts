export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function parseAmount(str: string): number {
  const normalized = str.replace(/,/g, "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function convertFX(amount: number, rate: number): number {
  return amount * rate;
}
