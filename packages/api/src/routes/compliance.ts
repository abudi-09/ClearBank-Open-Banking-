import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate.js";

const kycUploadSchema = z.object({
  docType: z.enum(["PASSPORT", "DRIVING_LICENSE", "UTILITY_BILL"]),
  fileUrl: z.string().url(),
});

const kycReviewSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
});

export const kycRouter = new Hono();
export const complianceRouter = new Hono();

kycRouter.post("/upload", validateBody(kycUploadSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.get("validatedBody") as z.infer<typeof kycUploadSchema>;

  const document = await prisma.kYCDocument.create({
    data: {
      userId,
      docType: body.docType,
      fileUrl: body.fileUrl,
      status: "PENDING",
    },
  });

  return c.json(document, 201);
});

complianceRouter.get("/queue", async (c) => {
  const queue = await prisma.kYCDocument.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  return c.json(queue);
});

complianceRouter.patch("/kyc/:id", validateBody(kycReviewSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof kycReviewSchema>;
  const complianceOfficerId = c.get("userId");

  const updated = await prisma.kYCDocument.update({
    where: { id: c.req.param("id") },
    data: {
      status: body.status,
      reviewedBy: complianceOfficerId,
    },
  });

  await prisma.user.update({
    where: { id: updated.userId },
    data: {
      kycStatus: body.status,
    },
  });

  return c.json(updated);
});

complianceRouter.get("/aml-alerts", async (c) => {
  const failedTransfers = await prisma.transaction.findMany({
    where: {
      OR: [
        { status: "FAILED" },
        { amount: { gte: 10_000 } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return c.json(
    failedTransfers.map((item) => ({
      ...item,
      amount: item.amount.toString(),
    })),
  );
});

complianceRouter.get("/reports", async (c) => {
  const [pendingKyc, rejectedKyc, failedTransactions, highValueTransactions] = await Promise.all([
    prisma.kYCDocument.count({ where: { status: "PENDING" } }),
    prisma.kYCDocument.count({ where: { status: "REJECTED" } }),
    prisma.transaction.count({ where: { status: "FAILED" } }),
    prisma.transaction.count({
      where: {
        amount: {
          gte: 10_000,
        },
      },
    }),
  ]);

  return c.json({
    generatedAt: new Date().toISOString(),
    kyc: {
      pending: pendingKyc,
      rejected: rejectedKyc,
    },
    transactions: {
      failed: failedTransactions,
      highValue: highValueTransactions,
    },
  });
});
