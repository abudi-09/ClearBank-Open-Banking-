import { Hono } from "hono";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate.js";

const paymentSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  scheduledAt: z.string().datetime().optional(),
  reference: z.string().min(3),
});
const bulkPaymentSchema = z.object({
  payments: z.array(paymentSchema).min(1).max(100),
});

const transferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(3),
  reference: z.string().min(3),
});

export const paymentsRouter = new Hono();
export const transfersRouter = new Hono();

paymentsRouter.post("/", validateBody(paymentSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof paymentSchema>;
  const payment = await prisma.payment.create({
    data: {
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: new Prisma.Decimal(body.amount.toFixed(2)),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      reference: body.reference,
      status: "PENDING",
    },
  });

  return c.json(
    {
      ...payment,
      amount: payment.amount.toString(),
    },
    201,
  );
});

paymentsRouter.get("/:id", async (c) => {
  const payment = await prisma.payment.findUnique({ where: { id: c.req.param("id") } });
  if (!payment) {
    return c.json({ error: "Payment not found" }, 404);
  }
  return c.json({ ...payment, amount: payment.amount.toString() });
});

paymentsRouter.post("/bulk", validateBody(bulkPaymentSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof bulkPaymentSchema>;
  const created = await prisma.$transaction(
    body.payments.map((item) =>
      prisma.payment.create({
        data: {
          fromAccountId: item.fromAccountId,
          toAccountId: item.toAccountId,
          amount: new Prisma.Decimal(item.amount.toFixed(2)),
          scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null,
          reference: item.reference,
          status: "PENDING",
        },
      }),
    ),
  );
  return c.json(
    created.map((payment) => ({
      ...payment,
      amount: payment.amount.toString(),
    })),
    201,
  );
});

transfersRouter.post("/", validateBody(transferSchema), async (c) => {
  try {
    const body = c.get("validatedBody") as z.infer<typeof transferSchema>;
    const amount = new Prisma.Decimal(body.amount.toFixed(2));

    const result = await prisma.$transaction(async (tx) => {
      const [fromAccount, toAccount] = await Promise.all([
        tx.account.findUnique({ where: { id: body.fromAccountId } }),
        tx.account.findUnique({ where: { id: body.toAccountId } }),
      ]);

      if (!fromAccount || !toAccount) {
        throw new Error("Account not found");
      }

      if (fromAccount.balance.lt(amount)) {
        throw new Error("Insufficient funds");
      }

      await tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: fromAccount.balance.minus(amount) },
      });

      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: toAccount.balance.plus(amount) },
      });

      return tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount,
          currency: body.currency.toUpperCase(),
          type: "TRANSFER",
          description: body.description,
          status: "COMPLETED",
          reference: body.reference,
        },
      });
    });

    return c.json({ ...result, amount: result.amount.toString() }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Transfer failed" }, 400);
  }
});
