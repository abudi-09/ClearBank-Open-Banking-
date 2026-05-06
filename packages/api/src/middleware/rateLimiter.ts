import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { incrementCounter } from "../lib/redis.js";

function getRequestIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return c.req.header("x-real-ip") ?? "unknown";
}

type LimitOptions = {
  prefix: string;
  limit: number;
  windowMs: number;
  key: (c: Context) => string;
  methods?: string[];
  skip?: (c: Context) => boolean;
  onExceeded: (c: Context, retryAfterSeconds: number) => Promise<Response>;
};

function createRateLimiter(options: LimitOptions): MiddlewareHandler {
  const methods = options.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE"];
  return createMiddleware(async (c, next) => {
    if (!methods.includes(c.req.method)) {
      await next();
      return;
    }
    if (options.skip?.(c)) {
      await next();
      return;
    }

    const key = `${options.prefix}:${options.key(c)}`;
    const windowSeconds = Math.ceil(options.windowMs / 1000);
    const { count, ttlSeconds } = await incrementCounter(key, windowSeconds);
    if (count > options.limit) {
      return options.onExceeded(c, ttlSeconds);
    }

    await next();
  });
}

export const strictLimiter = createRateLimiter({
  prefix: "ratelimit:strict",
  limit: 5,
  windowMs: 15 * 60 * 1000,
  methods: ["POST"],
  key: (c) => getRequestIp(c),
  onExceeded: async (c) => {
    const ip = getRequestIp(c);
    try {
      await prisma.auditLog.create({
        data: {
          userId: c.get("userId") ?? null,
          action: "rate_limit_hit",
          ipAddress: ip,
          metadata: {
            route: c.req.path,
          } as Prisma.InputJsonValue,
        },
      });
    } catch {
      // Keep request flow resilient if audit logging fails.
    }
    return c.json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  },
});

export const standardLimiter = createRateLimiter({
  prefix: "ratelimit:standard",
  limit: 100,
  windowMs: 60 * 1000,
  key: (c) => c.get("userId") ?? getRequestIp(c),
  skip: (c) =>
    c.req.path === "/fx/rates" || c.req.path === "/payments/bulk" || c.req.path === "/compliance/reports",
  onExceeded: async (c) => c.json({ error: "Rate limit exceeded." }, 429),
});

export const heavyLimiter = createRateLimiter({
  prefix: "ratelimit:heavy",
  limit: 10,
  windowMs: 60 * 1000,
  key: (c) => c.get("userId") ?? getRequestIp(c),
  onExceeded: async (c, retryAfterSeconds) => {
    c.header("Retry-After", String(retryAfterSeconds));
    return c.json({ error: "Rate limit exceeded." }, 429);
  },
});
