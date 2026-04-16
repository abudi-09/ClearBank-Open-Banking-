import { Decimal } from "decimal.js";

export type EntryType = "DEBIT" | "CREDIT";

export interface LedgerEntry {
  id: string;
  accountId: string;
  amount: Decimal;
  type: EntryType;
  description: string;
  timestamp: Date;
}

export interface LedgerBook {
  entries: LedgerEntry[];
}

export interface BalanceSheet {
  accountId: string;
  debits: Decimal;
  credits: Decimal;
  balance: Decimal;
}
