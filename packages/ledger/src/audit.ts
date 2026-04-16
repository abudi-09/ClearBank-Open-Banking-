import type { LedgerEntry } from "./types.js";

export function buildLedgerTrail(entries: LedgerEntry[]): string {
  return entries
    .map((entry) => {
      const isoTimestamp = entry.timestamp.toISOString();
      const amount = entry.amount.toFixed(2);
      return `[${isoTimestamp}] ${entry.type} ${amount} account=${entry.accountId} desc="${entry.description}" id=${entry.id}`;
    })
    .join("\n");
}
