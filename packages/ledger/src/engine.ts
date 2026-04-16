import { randomUUID } from "node:crypto";
import { Decimal } from "decimal.js";
import type { BalanceSheet, EntryType, LedgerEntry } from "./types.js";

export function createEntry(
  accountId: string,
  amount: Decimal,
  type: EntryType,
  description: string,
): LedgerEntry {
  return {
    id: randomUUID(),
    accountId,
    amount: new Decimal(amount),
    type,
    description,
    timestamp: new Date(),
  };
}

export function recordTransfer(
  fromAccountId: string,
  toAccountId: string,
  amount: Decimal,
  description: string,
): [LedgerEntry, LedgerEntry] {
  const transferAmount = new Decimal(amount);
  const debit = createEntry(fromAccountId, transferAmount, "DEBIT", description);
  const credit = createEntry(toAccountId, transferAmount, "CREDIT", description);
  return [debit, credit];
}

export function calculateBalance(entries: LedgerEntry[], accountId: string): Decimal {
  return entries
    .filter((entry) => entry.accountId === accountId)
    .reduce((acc, entry) => {
      if (entry.type === "DEBIT") {
        return acc.minus(entry.amount);
      }
      return acc.plus(entry.amount);
    }, new Decimal(0));
}

export function getBalanceSheet(entries: LedgerEntry[], accountId: string): BalanceSheet {
  const debits = entries
    .filter((entry) => entry.accountId === accountId && entry.type === "DEBIT")
    .reduce((acc, entry) => acc.plus(entry.amount), new Decimal(0));

  const credits = entries
    .filter((entry) => entry.accountId === accountId && entry.type === "CREDIT")
    .reduce((acc, entry) => acc.plus(entry.amount), new Decimal(0));

  return {
    accountId,
    debits,
    credits,
    balance: credits.minus(debits),
  };
}

export function validateTransfer(
  fromBalance: Decimal,
  amount: Decimal,
): { valid: boolean; reason?: string } {
  const transferAmount = new Decimal(amount);
  if (transferAmount.isZero()) {
    return { valid: false, reason: "Amount must be non-zero." };
  }
  if (transferAmount.isNegative()) {
    return { valid: false, reason: "Amount must be positive." };
  }
  if (new Decimal(fromBalance).lessThan(transferAmount)) {
    return { valid: false, reason: "Insufficient funds." };
  }
  return { valid: true };
}
