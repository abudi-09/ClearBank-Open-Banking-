import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Prisma } from "@prisma/client";
import { authRouter } from "./routes/auth.js";
import { accountsRouter } from "./routes/accounts.js";
import { paymentsRouter, transfersRouter } from "./routes/payments.js";
import { fxRouter } from "./routes/fx.js";
import { complianceRouter, kycRouter } from "./routes/compliance.js";
import { notificationsRouter } from "./routes/notifications.js";
import { auditLogMiddleware } from "./middleware/audit-log.js";
import { authMiddleware } from "./middleware/auth.js";
import { guardRole } from "./middleware/guard-role.js";

const app = new Hono();
const port = Number(process.env.PORT ?? 4000);

app.use("*", auditLogMiddleware);

app.route("/auth", authRouter);
app.route("/fx", fxRouter);

app.use("/accounts", authMiddleware);
app.use("/accounts/*", authMiddleware);
app.use("/payments", authMiddleware);
app.use("/payments/*", authMiddleware);
app.use("/transfers", authMiddleware);
app.use("/transfers/*", authMiddleware);
app.use("/kyc", authMiddleware);
app.use("/kyc/*", authMiddleware);
app.use("/notifications", authMiddleware);
app.use("/notifications/*", authMiddleware);
app.use("/compliance/*", authMiddleware, guardRole("COMPLIANCE"));
app.use("/compliance", authMiddleware, guardRole("COMPLIANCE"));

app.route("/accounts", accountsRouter);
app.route("/payments", paymentsRouter);
app.route("/transfers", transfersRouter);
app.route("/kyc", kycRouter);
app.route("/compliance", complianceRouter);
app.route("/notifications", notificationsRouter);

app.get("/", (c) => c.json({ name: "clearbank-api", status: "ok" }));

app.onError((error, c) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return c.json({ error: "Database request failed", code: error.code }, 400);
  }
  if (error instanceof Error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json({ error: "Unknown server error" }, 500);
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log(`ClearBank API running on :${port}`);
  },
);
