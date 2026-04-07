import { randomUUID } from "node:crypto";
import type {
  AmlAlert,
  Budget,
  BulkPaymentInstruction,
  KycDocumentReview,
  SavingsGoal,
} from "@clearbank/types";
import type { DomainState } from "./persistence.js";

export function buildDemoState(): DomainState {
  const now = new Date().toISOString();

  const budgets: Budget[] = [
    {
      id: randomUUID(),
      userId: "user-alice",
      category: "Groceries",
      monthlyLimit: { amount: "550.00", currency: "GBP" },
    },
    {
      id: randomUUID(),
      userId: "user-alice",
      category: "Transport",
      monthlyLimit: { amount: "180.00", currency: "GBP" },
    },
  ];

  const goals: SavingsGoal[] = [
    {
      id: randomUUID(),
      userId: "user-alice",
      name: "Emergency Fund",
      targetAmount: { amount: "10000.00", currency: "GBP" },
      currentAmount: { amount: "4250.00", currency: "GBP" },
    },
  ];

  const bulkPayments: BulkPaymentInstruction[] = [
    {
      id: randomUUID(),
      debtorAccountId: "biz-main-gbp",
      creditorAccountId: "supplier-001",
      amount: { amount: "12450.75", currency: "GBP" },
      reference: "MAY-SUPPLIER-BATCH",
    },
  ];

  const kycReviews: KycDocumentReview[] = [
    {
      id: randomUUID(),
      customerId: "cust-102",
      documentType: "passport",
      status: "pending",
    },
    {
      id: randomUUID(),
      customerId: "cust-103",
      documentType: "proof_of_address",
      status: "approved",
      reviewedBy: "agent-kyc-1",
    },
  ];

  const amlAlerts: AmlAlert[] = [
    {
      id: randomUUID(),
      accountId: "biz-main-gbp",
      reason: "Rapid transfer velocity increase",
      severity: "high",
      createdAt: now,
    },
    {
      id: randomUUID(),
      accountId: "cust-wallet-88",
      reason: "Sanctions name similarity > threshold",
      severity: "critical",
      createdAt: now,
    },
  ];

  return { budgets, goals, bulkPayments, kycReviews, amlAlerts };
}
