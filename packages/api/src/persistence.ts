import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type {
  AmlAlert,
  Budget,
  BulkPaymentInstruction,
  KycDocumentReview,
  SavingsGoal,
} from "@clearbank/types";

export interface DomainState {
  budgets: Budget[];
  goals: SavingsGoal[];
  bulkPayments: BulkPaymentInstruction[];
  kycReviews: KycDocumentReview[];
  amlAlerts: AmlAlert[];
}

const defaultState: DomainState = {
  budgets: [],
  goals: [],
  bulkPayments: [],
  kycReviews: [],
  amlAlerts: [],
};

export class FilePersistenceAdapter {
  private readonly path: string;

  constructor(path = resolve(process.cwd(), "packages/api/data/demo-state.json")) {
    this.path = path;
  }

  load(): DomainState {
    if (!existsSync(this.path)) {
      this.save(defaultState);
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(readFileSync(this.path, "utf-8")) as Partial<DomainState>;
    return {
      budgets: parsed.budgets ?? [],
      goals: parsed.goals ?? [],
      bulkPayments: parsed.bulkPayments ?? [],
      kycReviews: parsed.kycReviews ?? [],
      amlAlerts: parsed.amlAlerts ?? [],
    };
  }

  save(state: DomainState): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(state, null, 2), "utf-8");
  }
}
