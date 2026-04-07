import { Decimal } from "decimal.js";
import type {
  AccountType,
  Currency,
  EntryLine,
  LedgerAccount,
  LedgerEntry,
} from "@clearbank/types";

export interface TrialBalanceRow {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  currency: Currency;
  debit: string;
  credit: string;
  net: string;
}

export interface BalanceSheet {
  assets: string;
  liabilities: string;
  equity: string;
  isBalanced: boolean;
}

type AccountState = {
  account: LedgerAccount;
  balances: Map<Currency, Decimal>;
};

export class LedgerEngine {
  private readonly accounts = new Map<string, AccountState>();
  private readonly entries: LedgerEntry[] = [];

  addAccount(account: LedgerAccount): void {
    if (this.accounts.has(account.id)) {
      throw new Error(`Account already exists: ${account.id}`);
    }
    this.accounts.set(account.id, { account, balances: new Map() });
  }

  postEntry(entry: LedgerEntry): void {
    if (entry.lines.length !== 2) {
      throw new Error("Double-entry requires exactly two lines.");
    }

    const [left, right] = entry.lines;
    this.assertLinePair(left, right);
    this.applyLine(left);
    this.applyLine(right);
    this.entries.push(entry);
  }

  getEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  getBalance(accountId: string, currency: Currency): string {
    const state = this.accounts.get(accountId);
    if (!state) {
      throw new Error(`Unknown account: ${accountId}`);
    }
    return (state.balances.get(currency) ?? new Decimal(0)).toFixed(2);
  }

  getTrialBalance(currency: Currency): TrialBalanceRow[] {
    return [...this.accounts.values()].map(({ account, balances }) => {
      const net = balances.get(currency) ?? new Decimal(0);
      const debit = net.greaterThanOrEqualTo(0) ? net : new Decimal(0);
      const credit = net.lessThan(0) ? net.abs() : new Decimal(0);
      return {
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        currency,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        net: net.toFixed(2),
      };
    });
  }

  getBalanceSheet(currency: Currency): BalanceSheet {
    let assets = new Decimal(0);
    let liabilities = new Decimal(0);
    let equity = new Decimal(0);

    for (const { account, balances } of this.accounts.values()) {
      const net = balances.get(currency) ?? new Decimal(0);
      switch (account.type) {
        case "asset":
          assets = assets.add(net);
          break;
        case "liability":
          liabilities = liabilities.add(net.abs());
          break;
        case "equity":
          equity = equity.add(net.abs());
          break;
        default:
          break;
      }
    }

    return {
      assets: assets.toFixed(2),
      liabilities: liabilities.toFixed(2),
      equity: equity.toFixed(2),
      isBalanced: assets.equals(liabilities.add(equity)),
    };
  }

  reconcile(currency: Currency): { debitTotal: string; creditTotal: string; balanced: boolean } {
    const rows = this.getTrialBalance(currency);
    const debitTotal = rows.reduce((acc, row) => acc.add(row.debit), new Decimal(0));
    const creditTotal = rows.reduce((acc, row) => acc.add(row.credit), new Decimal(0));

    return {
      debitTotal: debitTotal.toFixed(2),
      creditTotal: creditTotal.toFixed(2),
      balanced: debitTotal.equals(creditTotal),
    };
  }

  private assertLinePair(left: EntryLine, right: EntryLine): void {
    if (left.side === right.side) {
      throw new Error("Entry must contain one debit and one credit line.");
    }
    if (left.currency !== right.currency) {
      throw new Error("Entry lines must use the same currency.");
    }
    const leftAmount = new Decimal(left.amount);
    const rightAmount = new Decimal(right.amount);
    if (!leftAmount.equals(rightAmount)) {
      throw new Error("Debit and credit amounts must match.");
    }
    this.assertAccountExists(left.accountId);
    this.assertAccountExists(right.accountId);
  }

  private assertAccountExists(accountId: string): void {
    if (!this.accounts.has(accountId)) {
      throw new Error(`Unknown account: ${accountId}`);
    }
  }

  private applyLine(line: EntryLine): void {
    const state = this.accounts.get(line.accountId);
    if (!state) {
      throw new Error(`Unknown account: ${line.accountId}`);
    }
    const amount = new Decimal(line.amount);
    const sign = line.side === "debit" ? new Decimal(1) : new Decimal(-1);
    const current = state.balances.get(line.currency) ?? new Decimal(0);
    state.balances.set(line.currency, current.add(amount.mul(sign)));
  }
}
