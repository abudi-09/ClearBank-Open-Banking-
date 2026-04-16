import { Decimal } from "decimal.js";
import type { LedgerEntry } from "./types.js";

export function reconcileAccount(entries: LedgerEntry[]): { balanced: boolean; discrepancy: Decimal } {
  const debitTotal = entries
    .filter((entry) => entry.type === "DEBIT")
    .reduce((acc, entry) => acc.plus(entry.amount), new Decimal(0));

  const creditTotal = entries
    .filter((entry) => entry.type === "CREDIT")
    .reduce((acc, entry) => acc.plus(entry.amount), new Decimal(0));

  const discrepancy = debitTotal.minus(creditTotal);
  return {
    balanced: discrepancy.isZero(),
    discrepancy,
  };
}

export function findUnmatchedEntries(entries: LedgerEntry[]): LedgerEntry[] {
  const tolerance = new Decimal(0);
  const unmatched: LedgerEntry[] = [];

  for (let i = 0; i < entries.length; i += 1) {
    const current = entries[i];
    const hasMatch = entries.some((candidate, idx) => {
      if (idx === i) {
        return false;
      }
      return (
        candidate.description === current.description
        && candidate.type !== current.type
        && candidate.amount.minus(current.amount).abs().equals(tolerance)
      );
    });

    if (!hasMatch) {
      unmatched.push(current);
    }
  }

  return unmatched;
}
