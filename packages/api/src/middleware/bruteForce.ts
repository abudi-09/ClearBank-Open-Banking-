import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { getCounter, incrementCounter, resetCounter } from "../lib/redis.js";

const MAX_FAILED_ATTEMPTS = 5;
const FAILED_LOGIN_WINDOW_SECONDS = 15 * 60;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function failedLoginKey(ip: string, email: string): string {
  return `failed_login:${ip}:${normalizeEmail(email)}`;
}

function requestIp(forwardedFor: string | undefined, realIp: string | undefined): string {
  if (forwardedFor && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return realIp ?? "unknown";
}

export async function trackFailedLogin(ip: string, email: string): Promise<void> {
  await incrementCounter(failedLoginKey(ip, email), FAILED_LOGIN_WINDOW_SECONDS);
}

export async function isLockedOut(ip: string, email: string): Promise<boolean> {
  const count = await getCounter(failedLoginKey(ip, email));
  return count >= MAX_FAILED_ATTEMPTS;
}

export async function resetFailedLogins(ip: string, email: string): Promise<void> {
  await resetCounter(failedLoginKey(ip, email));
}

export const bruteForceProtection: MiddlewareHandler = createMiddleware(async (c, next) => {
  if (c.req.method !== "POST") {
    await next();
    return;
  }

  let body: unknown;
  try {
    body = await c.req.raw.clone().json();
  } catch {
    await next();
    return;
  }

  if (typeof body !== "object" || body === null || !("email" in body)) {
    await next();
    return;
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    await next();
    return;
  }

  const ip = requestIp(c.req.header("x-forwarded-for"), c.req.header("x-real-ip"));
  if (await isLockedOut(ip, email)) {
    return c.json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  }

  await next();
});

export function getRequestIpFromHeaders(
  forwardedFor: string | undefined,
  realIp: string | undefined,
): string {
  return requestIp(forwardedFor, realIp);
}
