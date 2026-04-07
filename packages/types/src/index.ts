export type Currency = "GBP" | "USD" | "EUR";

export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

export interface MoneyAmount {
  currency: Currency;
  amount: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  type: AccountType;
}

export interface EntryLine {
  accountId: string;
  amount: string;
  side: "debit" | "credit";
  currency: Currency;
}

export interface LedgerEntry {
  id: string;
  reference: string;
  description: string;
  createdAt: string;
  lines: [EntryLine, EntryLine];
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: MoneyAmount;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: MoneyAmount;
  currentAmount: MoneyAmount;
}

export interface BulkPaymentInstruction {
  id: string;
  debtorAccountId: string;
  creditorAccountId: string;
  amount: MoneyAmount;
  reference: string;
}

export interface FxQuoteRequest {
  base: Currency;
  quote: Currency;
  amount: string;
}

export interface FxQuoteResponse {
  rate: string;
  convertedAmount: string;
  expiresAt: string;
}

export type KycStatus = "pending" | "approved" | "rejected";

export interface KycDocumentReview {
  id: string;
  customerId: string;
  documentType: string;
  status: KycStatus;
  reviewedBy?: string;
}

export type AmlSeverity = "low" | "medium" | "high" | "critical";

export interface AmlAlert {
  id: string;
  accountId: string;
  reason: string;
  severity: AmlSeverity;
  createdAt: string;
}
