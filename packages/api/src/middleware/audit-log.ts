import { createMiddleware } from "hono/factory";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const stateChangingMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export const auditLogMiddleware = createMiddleware(async (c, next) => {
  if (!stateChangingMethods.has(c.req.method)) {
    await next();
    return;
  }

  const path = c.req.path;
  const query = c.req.query();
  const ipAddress = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
  const userId = c.get("userId");

  let body: unknown = {};
  try {
    body = await c.req.raw.clone().json();
  } catch {
    body = {};
  }

  await next();

  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action: `${c.req.method} ${path}`,
        ipAddress,
        metadata: {
          query,
          body,
          status: c.res.status,
        } as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Avoid breaking request flow if audit writes fail.
  }
});
