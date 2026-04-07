import express from "express";
import { LedgerEngine } from "@clearbank/ledger";
import { Decimal } from "decimal.js";
import type {
  AmlAlert,
  Budget,
  BulkPaymentInstruction,
  Currency,
  FxQuoteRequest,
  FxQuoteResponse,
  KycDocumentReview,
  LedgerAccount,
  LedgerEntry,
  SavingsGoal,
} from "@clearbank/types";
import { FilePersistenceAdapter } from "./persistence.js";
import { buildDemoState } from "./seed.js";

type ApiError = Error & { statusCode?: number };

function badRequest(message: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = 400;
  return error;
}

function isCurrency(value: unknown): value is Currency {
  return value === "GBP" || value === "USD" || value === "EUR";
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`${field} must be a non-empty string.`);
  }
}

function assertLedgerAccount(account: unknown): asserts account is LedgerAccount {
  if (typeof account !== "object" || account === null) {
    throw badRequest("Ledger account payload must be an object.");
  }
  const typed = account as Partial<LedgerAccount>;
  assertNonEmptyString(typed.id, "id");
  assertNonEmptyString(typed.name, "name");
  if (!typed.type || !["asset", "liability", "equity", "income", "expense"].includes(typed.type)) {
    throw badRequest("type must be one of asset, liability, equity, income, expense.");
  }
}

function assertLedgerEntry(entry: unknown): asserts entry is LedgerEntry {
  if (typeof entry !== "object" || entry === null) {
    throw badRequest("Ledger entry payload must be an object.");
  }
  const typed = entry as Partial<LedgerEntry>;
  assertNonEmptyString(typed.id, "id");
  assertNonEmptyString(typed.reference, "reference");
  assertNonEmptyString(typed.description, "description");
  assertNonEmptyString(typed.createdAt, "createdAt");
  if (!Array.isArray(typed.lines) || typed.lines.length !== 2) {
    throw badRequest("lines must contain exactly two entries.");
  }
  for (const line of typed.lines) {
    if (!line || typeof line !== "object") {
      throw badRequest("each line must be an object.");
    }
    assertNonEmptyString(line.accountId, "line.accountId");
    assertNonEmptyString(line.amount, "line.amount");
    if (line.side !== "debit" && line.side !== "credit") {
      throw badRequest("line.side must be debit or credit.");
    }
    if (!isCurrency(line.currency)) {
      throw badRequest("line.currency must be GBP, USD, or EUR.");
    }
  }
}

function assertFxQuoteRequest(input: unknown): asserts input is FxQuoteRequest {
  if (typeof input !== "object" || input === null) {
    throw badRequest("FX quote payload must be an object.");
  }
  const typed = input as Partial<FxQuoteRequest>;
  if (!isCurrency(typed.base)) {
    throw badRequest("base must be GBP, USD, or EUR.");
  }
  if (!isCurrency(typed.quote)) {
    throw badRequest("quote must be GBP, USD, or EUR.");
  }
  assertNonEmptyString(typed.amount, "amount");
  let amount: Decimal;
  try {
    amount = new Decimal(typed.amount);
  } catch {
    throw badRequest("amount must be a valid decimal string.");
  }
  if (amount.lessThanOrEqualTo(0)) {
    throw badRequest("amount must be greater than zero.");
  }
}

interface AppOptions {
  persistence?: {
    load: () => {
      budgets: Budget[];
      goals: SavingsGoal[];
      bulkPayments: BulkPaymentInstruction[];
      kycReviews: KycDocumentReview[];
      amlAlerts: AmlAlert[];
    };
    save: (state: {
      budgets: Budget[];
      goals: SavingsGoal[];
      bulkPayments: BulkPaymentInstruction[];
      kycReviews: KycDocumentReview[];
      amlAlerts: AmlAlert[];
    }) => void;
  };
}

export function createApp(options?: AppOptions) {
  const app = express();
  app.use(express.json());

  const ledger = new LedgerEngine();
  const persistence = options?.persistence ?? new FilePersistenceAdapter();
  const initial = persistence.load();
  const budgets = new Map<string, Budget>(initial.budgets.map((item) => [item.id, item]));
  const goals = new Map<string, SavingsGoal>(initial.goals.map((item) => [item.id, item]));
  const bulkPayments = new Map<string, BulkPaymentInstruction>(initial.bulkPayments.map((item) => [item.id, item]));
  const kycReviews = new Map<string, KycDocumentReview>(initial.kycReviews.map((item) => [item.id, item]));
  const amlAlerts = new Map<string, AmlAlert>(initial.amlAlerts.map((item) => [item.id, item]));

  const saveAll = () => {
    persistence.save({
      budgets: [...budgets.values()],
      goals: [...goals.values()],
      bulkPayments: [...bulkPayments.values()],
      kycReviews: [...kycReviews.values()],
      amlAlerts: [...amlAlerts.values()],
    });
  };

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "clearbank-api" });
  });

  app.post("/ledger/accounts", (req, res, next) => {
    try {
      assertLedgerAccount(req.body);
      ledger.addAccount(req.body);
      res.status(201).json(req.body);
    } catch (error) {
      next(error);
    }
  });

  app.post("/ledger/entries", (req, res, next) => {
    try {
      assertLedgerEntry(req.body);
      ledger.postEntry(req.body);
      res.status(201).json(req.body);
    } catch (error) {
      next(error);
    }
  });

  app.get("/ledger/reconcile/:currency", (req, res, next) => {
    try {
      const currency = req.params.currency;
      if (!isCurrency(currency)) {
        throw badRequest("currency must be GBP, USD, or EUR.");
      }
      res.json(ledger.reconcile(currency));
    } catch (error) {
      next(error);
    }
  });

  app.get("/personal/budgets", (_req, res) => {
    res.json([...budgets.values()]);
  });

  app.post("/personal/budgets", (req, res) => {
    const budget = req.body as Budget;
    budgets.set(budget.id, budget);
    saveAll();
    res.status(201).json(budget);
  });

  app.get("/personal/goals", (_req, res) => {
    res.json([...goals.values()]);
  });

  app.post("/personal/goals", (req, res) => {
    const goal = req.body as SavingsGoal;
    goals.set(goal.id, goal);
    saveAll();
    res.status(201).json(goal);
  });

  app.get("/business/payments", (_req, res) => {
    res.json([...bulkPayments.values()]);
  });

  app.post("/business/payments", (req, res) => {
    const instruction = req.body as BulkPaymentInstruction;
    bulkPayments.set(instruction.id, instruction);
    saveAll();
    res.status(201).json(instruction);
  });

  app.post("/business/fx/quote", (req, res, next) => {
    try {
      assertFxQuoteRequest(req.body);
      const syntheticRate = new Decimal(req.body.base === req.body.quote ? "1.0" : "1.21");
      const convertedAmount = new Decimal(req.body.amount).mul(syntheticRate).toFixed(2);
      const response: FxQuoteResponse = {
        rate: syntheticRate.toFixed(4),
        convertedAmount,
        expiresAt: new Date(Date.now() + 30_000).toISOString(),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.get("/compliance/kyc", (_req, res) => {
    res.json([...kycReviews.values()]);
  });

  app.post("/compliance/kyc", (req, res) => {
    const review = req.body as KycDocumentReview;
    kycReviews.set(review.id, review);
    saveAll();
    res.status(201).json(review);
  });

  app.get("/compliance/aml-alerts", (_req, res) => {
    res.json([...amlAlerts.values()]);
  });

  app.post("/compliance/aml-alerts", (req, res) => {
    const alert = req.body as AmlAlert;
    amlAlerts.set(alert.id, alert);
    saveAll();
    res.status(201).json(alert);
  });

  app.post("/demo/seed", (_req, res) => {
    const seeded = buildDemoState();
    budgets.clear();
    goals.clear();
    bulkPayments.clear();
    kycReviews.clear();
    amlAlerts.clear();
    seeded.budgets.forEach((item) => budgets.set(item.id, item));
    seeded.goals.forEach((item) => goals.set(item.id, item));
    seeded.bulkPayments.forEach((item) => bulkPayments.set(item.id, item));
    seeded.kycReviews.forEach((item) => kycReviews.set(item.id, item));
    seeded.amlAlerts.forEach((item) => amlAlerts.set(item.id, item));
    saveAll();
    res.json({ ok: true, message: "Demo data seeded." });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof Error) {
      const statusCode = (error as ApiError).statusCode ?? 400;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Unknown server error." });
  });

  return app;
}
