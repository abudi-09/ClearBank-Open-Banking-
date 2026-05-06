import { faker } from "@faker-js/faker";
import { delay, HttpResponse, http } from "msw";

faker.seed(42);

function encodeJwt(payload: Record<string, string | number>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const docTypes = ["PASSPORT", "DRIVING_LICENSE", "UTILITY_BILL"] as const;

export type KYCCase = {
  id: string;
  userName: string;
  userEmail: string;
  docType: (typeof docTypes)[number];
  submittedAt: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
};

export type AMLAlert = {
  id: string;
  transactionId: string;
  account: string;
  amount: number;
  currency: string;
  reason: string;
  riskScore: number;
  reviewed: boolean;
  createdAt: string;
};

export type MockTransaction = {
  id: string;
  iban?: string | null;
  reference: string;
  amount: number;
  currency: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  ledgerTrail: string;
};

export type AuditEntry = {
  id: string;
  action: string;
  userEmail: string;
  ipAddress: string;
  timestamp: string;
};

export const db = {
  kycQueue: [] as KYCCase[],
  amlAlerts: [] as AMLAlert[],
  transactions: [] as MockTransaction[],
  auditLogs: [] as AuditEntry[],
};

function seedDb() {
  if (db.kycQueue.length) return;
  for (let i = 0; i < 18; i += 1) {
    db.kycQueue.push({
      id: `kyc_${faker.string.alphanumeric({ length: 8 })}`,
      userName: faker.person.fullName(),
      userEmail: faker.internet.email(),
      docType: faker.helpers.arrayElement([...docTypes]),
      submittedAt: faker.date.recent({ days: 45 }).toISOString(),
      status: faker.helpers.arrayElement(["PENDING", "VERIFIED", "REJECTED"] as const),
    });
  }

  const ibans = Array.from({ length: 24 }, () => faker.finance.iban());
  for (let i = 0; i < 36; i += 1) {
    db.amlAlerts.push({
      id: `aml_${faker.string.alphanumeric(8)}`,
      transactionId: `tx_${faker.string.alphanumeric(10)}`,
      account: faker.helpers.arrayElement(ibans),
      amount: faker.number.float({ min: 100, max: 500000, fractionDigits: 2 }),
      currency: faker.helpers.arrayElement(["USD", "EUR", "GBP", "NGN", "AED"]),
      reason: faker.helpers.arrayElement([
        "Velocity spike",
        "Structuring suspected",
        "High-risk corridor",
        "Sanctions name match",
      ]),
      riskScore: faker.number.int({ min: 5, max: 98 }),
      reviewed: faker.datatype.boolean({ probability: 0.45 }),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    });
  }

  for (let i = 0; i < 52; i += 1) {
    const from = faker.helpers.arrayElement(ibans);
    db.transactions.push({
      id: `tx_${faker.string.alphanumeric(10)}`,
      iban: from,
      reference: `REF-${faker.string.alphanumeric(12).toUpperCase()}`,
      amount: faker.number.float({ min: 10, max: 200000, fractionDigits: 2 }),
      currency: faker.helpers.arrayElement(["USD", "EUR", "GBP", "INR"]),
      type: faker.helpers.arrayElement(["CREDIT", "DEBIT", "TRANSFER", "FX"]),
      description: faker.commerce.productDescription().slice(0, 120),
      status: faker.helpers.arrayElement(["PENDING", "COMPLETED", "FAILED"]),
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      ledgerTrail: [
        `[${faker.date.recent({ days: 1 }).toISOString()}] DEBIT ${faker.number.float({
          fractionDigits: 2,
          min: 1,
          max: 99,
        })} account=${faker.string.alphanumeric(6)}`,
        `[${faker.date.recent({ days: 1 }).toISOString()}] CREDIT same match description`,
      ].join("\n"),
    });
  }

  const actions = [
    "POST /auth/login",
    "PATCH /compliance/kyc/:id",
    "GET /compliance/queue",
    "GET /transactions",
    "POST /reports/sar",
  ];
  for (let i = 0; i < 65; i += 1) {
    db.auditLogs.push({
      id: `aud_${faker.string.alphanumeric(8)}`,
      action: faker.helpers.arrayElement(actions),
      userEmail: faker.internet.email(),
      ipAddress: faker.internet.ipv4(),
      timestamp: faker.date.recent({ days: 14 }).toISOString(),
    });
  }
}

seedDb();

function csv(headers: string[], rows: Record<string, string | number>[]) {
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => String(r[h] ?? "")).join(",")).join("\n");
  return `${head}\n${body}`;
}

export const handlers = [
  http.post("/auth/login", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email ?? "";
    const pwd = body.password ?? "";

    if (!email || !pwd) {
      return HttpResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    if (pwd === "compliance-demo") {
      return HttpResponse.json({
        accessToken: encodeJwt({
          role: "COMPLIANCE",
          sub: "comp-001",
          email,
        }),
      });
    }

    return HttpResponse.json({
      accessToken: encodeJwt({
        role: "PERSONAL",
        sub: "u-xyz",
        email,
      }),
    });
  }),

  http.get("/compliance/queue", async () => {
    await delay(100);
    return HttpResponse.json([...db.kycQueue].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
  }),

  http.patch("/compliance/kyc/:id", async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    const body = (await request.json()) as { status?: string; notes?: string };
    const idx = db.kycQueue.findIndex((k) => k.id === id);
    if (idx === -1) return HttpResponse.json({ error: "Not found" }, { status: 404 });

    db.kycQueue[idx] = {
      ...db.kycQueue[idx],
      status:
        body.status === "VERIFIED" || body.status === "REJECTED" ? body.status : db.kycQueue[idx].status,
    };

    db.auditLogs.unshift({
      id: `aud_${faker.string.nanoid()}`,
      action: `PATCH /compliance/kyc/${id}`,
      userEmail: "compliance@clearbank.dev",
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString(),
    });

    return HttpResponse.json(db.kycQueue[idx]);
  }),

  http.get("/compliance/aml-alerts", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const minRisk = Number.parseInt(url.searchParams.get("minRisk") ?? "0", 10);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    let reviewedOnly = url.searchParams.get("reviewed") ?? "all";

    let list = db.amlAlerts.filter((a) => a.riskScore >= minRisk);
    if (from) list = list.filter((a) => a.createdAt >= from);
    if (to) list = list.filter((a) => a.createdAt <= `${to}T23:59:59.999Z`);
    if (reviewedOnly === "reviewed") list = list.filter((a) => a.reviewed);
    if (reviewedOnly === "unreviewed") list = list.filter((a) => !a.reviewed);

    return HttpResponse.json(list);
  }),

  http.patch("/compliance/aml-alerts/:id/reviewed", async ({ params }) => {
    await delay(120);
    const id = params.id as string;
    const row = db.amlAlerts.find((a) => a.id === id);
    if (!row) return HttpResponse.json({ error: "Not found" }, { status: 404 });
    row.reviewed = true;
    return HttpResponse.json(row);
  }),

  http.get("/transactions", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const iban = url.searchParams.get("iban")?.toLowerCase().trim();
    const reference = url.searchParams.get("reference")?.toLowerCase().trim();
    const minAmt = Number.parseFloat(url.searchParams.get("minAmount") ?? "");
    const maxAmt = Number.parseFloat(url.searchParams.get("maxAmount") ?? "");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    let list = [...db.transactions];
    if (iban)
      list = list.filter((t) =>
        `${t.id} ${t.iban ?? ""} ${t.reference}`.toLowerCase().includes(iban),
      );
    if (reference) list = list.filter((t) => t.reference.toLowerCase().includes(reference));
    if (Number.isFinite(minAmt)) list = list.filter((t) => t.amount >= minAmt);
    if (Number.isFinite(maxAmt)) list = list.filter((t) => t.amount <= maxAmt);
    if (from) list = list.filter((t) => t.createdAt >= from);
    if (to) list = list.filter((t) => t.createdAt <= `${to}T23:59:59.999Z`);

    return HttpResponse.json(list.slice(0, 100));
  }),

  http.get("/audit-log", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10));
    const actionFilter = url.searchParams.get("action") ?? "";

    let list = [...db.auditLogs];
    if (actionFilter) list = list.filter((a) => a.action.includes(actionFilter));
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const slice = list.slice(start, start + pageSize);

    return HttpResponse.json({
      items: slice,
      page,
      pageCount: Math.ceil(list.length / pageSize),
      total: list.length,
      uniqueActions: Array.from(new Set(db.auditLogs.map((l) => l.action))),
    });
  }),

  http.post("/reports/sar", async ({ request }) => {
    await delay(200);
    const body = (await request.json().catch(() => ({}))) as { start?: string; end?: string };
    const start = body.start ?? "unknown";
    const end = body.end ?? "unknown";
    const sarRows = faker.helpers.uniqueArray(() => faker.string.nanoid(), 40).map((id) => ({
      report_id: id,
      suspicion_type: faker.helpers.arrayElement(["Structuring", "Terrorism Financing", "Fraud"]),
      amount: faker.number.float({ min: 500, max: 500000, fractionDigits: 2 }),
      period_start: start,
      period_end: end,
    }));
    const text = csv(["report_id", "suspicion_type", "amount", "period_start", "period_end"], sarRows);
    return new HttpResponse(text, {
      headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": `attachment; filename="sar-report.csv"` },
    });
  }),

  http.post("/reports/aml-summary", async ({ request }) => {
    await delay(220);
    const body = (await request.json().catch(() => ({}))) as { start?: string; end?: string };
    const start = body.start ?? "";
    const end = body.end ?? "";
    const rows = Array.from({ length: 15 }, () => ({
      metric: faker.helpers.arrayElement(["Alerts opened", "True positives", "SAR filings", "PEP hits"]),
      value: faker.number.int({ max: 200 }),
      period_start: start,
      period_end: end,
    }));
    const text = csv(["metric", "value", "period_start", "period_end"], rows);
    return new HttpResponse(text, {
      headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": `attachment; filename="aml-summary.csv"` },
    });
  }),
];
