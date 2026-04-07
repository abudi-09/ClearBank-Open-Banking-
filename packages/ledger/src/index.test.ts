import assert from "node:assert/strict";
import test from "node:test";
import type { LedgerEntry } from "@clearbank/types";
import { LedgerEngine } from "./index.js";

function setupLedger(): LedgerEngine {
  const ledger = new LedgerEngine();
  ledger.addAccount({ id: "cash", name: "Cash", type: "asset" });
  ledger.addAccount({ id: "revenue", name: "Revenue", type: "income" });
  ledger.addAccount({ id: "equity", name: "Equity", type: "equity" });
  return ledger;
}

function balancedEntry(overrides?: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: overrides?.id ?? "entry-1",
    reference: overrides?.reference ?? "ref-1",
    description: overrides?.description ?? "Cash sale",
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    lines:
      overrides?.lines ??
      [
        { accountId: "cash", amount: "125.55", side: "debit", currency: "GBP" },
        { accountId: "revenue", amount: "125.55", side: "credit", currency: "GBP" },
      ],
  };
}

test("posts balanced entries and reconciles", () => {
  const ledger = setupLedger();
  ledger.postEntry(balancedEntry());

  assert.equal(ledger.getBalance("cash", "GBP"), "125.55");
  assert.equal(ledger.getBalance("revenue", "GBP"), "-125.55");

  const reconciliation = ledger.reconcile("GBP");
  assert.equal(reconciliation.balanced, true);
  assert.equal(reconciliation.debitTotal, "125.55");
  assert.equal(reconciliation.creditTotal, "125.55");
});

test("rejects entry when debit and credit amounts differ", () => {
  const ledger = setupLedger();

  assert.throws(
    () =>
      ledger.postEntry(
        balancedEntry({
          lines: [
            { accountId: "cash", amount: "100.00", side: "debit", currency: "GBP" },
            { accountId: "revenue", amount: "99.99", side: "credit", currency: "GBP" },
          ],
        }),
      ),
    /Debit and credit amounts must match/,
  );
});

test("rejects entry with mismatched currencies", () => {
  const ledger = setupLedger();

  assert.throws(
    () =>
      ledger.postEntry(
        balancedEntry({
          lines: [
            { accountId: "cash", amount: "10.00", side: "debit", currency: "GBP" },
            { accountId: "revenue", amount: "10.00", side: "credit", currency: "USD" },
          ],
        }),
      ),
    /Entry lines must use the same currency/,
  );
});
