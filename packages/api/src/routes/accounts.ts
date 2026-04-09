import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

export const accountsRouter = new Hono();

accountsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { id: "asc" },
  });

  return c.json(
    accounts.map((account) => ({
      ...account,
      balance: account.balance.toString(),
    })),
  );
});

accountsRouter.get("/:id/transactions", async (c) => {
  const userId = c.get("userId");
  const accountId = c.req.param("id");
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    return c.json({ error: "Account not found" }, 404);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(
    transactions.map((tx) => ({
      ...tx,
      amount: tx.amount.toString(),
    })),
  );
});
