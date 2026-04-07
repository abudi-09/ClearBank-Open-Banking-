import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "./app.js";
import type { DomainState } from "./persistence.js";

function createTestApp() {
  let state: DomainState = {
    budgets: [],
    goals: [],
    bulkPayments: [],
    kycReviews: [],
    amlAlerts: [],
  };
  return createApp({
    persistence: {
      load: () => state,
      save: (next) => {
        state = next;
      },
    },
  });
}

test("returns health payload", async () => {
  const app = createTestApp();
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("creates account and posts balanced ledger entry", async () => {
  const app = createTestApp();

  await request(app).post("/ledger/accounts").send({ id: "cash", name: "Cash", type: "asset" }).expect(201);
  await request(app).post("/ledger/accounts").send({ id: "revenue", name: "Revenue", type: "income" }).expect(201);

  await request(app)
    .post("/ledger/entries")
    .send({
      id: "entry-1",
      reference: "INV-100",
      description: "Invoice settlement",
      createdAt: new Date().toISOString(),
      lines: [
        { accountId: "cash", amount: "100.00", side: "debit", currency: "GBP" },
        { accountId: "revenue", amount: "100.00", side: "credit", currency: "GBP" },
      ],
    })
    .expect(201);

  const reconciliation = await request(app).get("/ledger/reconcile/GBP").expect(200);
  assert.equal(reconciliation.body.balanced, true);
  assert.equal(reconciliation.body.debitTotal, "100.00");
  assert.equal(reconciliation.body.creditTotal, "100.00");
});

test("rejects invalid ledger entry payload", async () => {
  const app = createTestApp();
  const response = await request(app)
    .post("/ledger/entries")
    .send({
      id: "entry-2",
      reference: "BAD-100",
      description: "Invalid payload",
      createdAt: new Date().toISOString(),
      lines: [{ accountId: "cash", amount: "10.00", side: "debit", currency: "GBP" }],
    })
    .expect(400);

  assert.match(response.body.error, /exactly two entries/);
});

test("rejects posting to unknown accounts", async () => {
  const app = createTestApp();
  const response = await request(app)
    .post("/ledger/entries")
    .send({
      id: "entry-3",
      reference: "UNK-100",
      description: "Unknown accounts",
      createdAt: new Date().toISOString(),
      lines: [
        { accountId: "missing-a", amount: "10.00", side: "debit", currency: "GBP" },
        { accountId: "missing-b", amount: "10.00", side: "credit", currency: "GBP" },
      ],
    })
    .expect(400);

  assert.match(response.body.error, /Unknown account/);
});

test("quotes FX using decimal precision", async () => {
  const app = createTestApp();
  const response = await request(app)
    .post("/business/fx/quote")
    .send({ base: "GBP", quote: "USD", amount: "10.01" })
    .expect(200);

  assert.equal(response.body.rate, "1.2100");
  assert.equal(response.body.convertedAmount, "12.11");
});

test("rejects invalid FX amount", async () => {
  const app = createTestApp();
  const response = await request(app)
    .post("/business/fx/quote")
    .send({ base: "GBP", quote: "USD", amount: "-10" })
    .expect(400);

  assert.match(response.body.error, /greater than zero/);
});
