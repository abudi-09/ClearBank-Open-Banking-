import { describe, expect, it } from "vitest";
import { Decimal } from "decimal.js";
import { calculateBalance, recordTransfer, validateTransfer } from "../engine.js";
import { reconcileAccount } from "../reconcile.js";
import type { LedgerEntry } from "../types.js";

describe("ledger engine", () => {
  it("Transfer reduces sender balance and increases receiver balance correctly", () => {
    const amount = new Decimal("25.50");
    const [debit, credit] = recordTransfer("alice", "bob", amount, "P2P transfer");
    const entries: LedgerEntry[] = [debit, credit];

    const aliceBalance = calculateBalance(entries, "alice");
    const bobBalance = calculateBalance(entries, "bob");

    expect(aliceBalance.equals(new Decimal("-25.50"))).toBe(true);
    expect(bobBalance.equals(new Decimal("25.50"))).toBe(true);
  });

  it("validateTransfer rejects insufficient funds", () => {
    const result = validateTransfer(new Decimal("10"), new Decimal("50"));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Insufficient funds");
  });

  it("reconcileAccount returns balanced: true for matched pairs", () => {
    const [debit, credit] = recordTransfer("payer", "payee", new Decimal("100.00"), "Invoice settlement");
    const result = reconcileAccount([debit, credit]);
    expect(result.balanced).toBe(true);
    expect(result.discrepancy.equals(new Decimal(0))).toBe(true);
  });

  it("Decimal precision: 0.1 + 0.2 === 0.3 exactly", () => {
    const sum = new Decimal("0.1").plus(new Decimal("0.2"));
    expect(sum.equals(new Decimal("0.3"))).toBe(true);
  });
});
