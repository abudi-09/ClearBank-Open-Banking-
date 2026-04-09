import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";

export type UserRole = "PERSONAL" | "BUSINESS" | "COMPLIANCE";
type TokenType = "access" | "refresh";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: TokenType;
}

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userRole: UserRole;
    jwtPayload: AuthTokenPayload;
  }
}

function unauthorized(c: Context, message = "Unauthorized") {
  return c.json({ error: message }, 401);
}

function verifyToken(token: string, secret: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, secret) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export const authMiddleware: MiddlewareHandler = createMiddleware(async (c, next) => {
  const authorization = c.req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized(c, "Missing bearer token");
  }

  const payload = verifyToken(authorization.slice("Bearer ".length), accessTokenSecret);
  if (!payload || payload.type !== "access") {
    return unauthorized(c, "Invalid access token");
  }

  c.set("userId", payload.sub);
  c.set("userRole", payload.role);
  c.set("jwtPayload", payload);
  await next();
});

export function signAccessToken(input: Omit<AuthTokenPayload, "type">): string {
  return jwt.sign({ ...input, type: "access" }, accessTokenSecret, { expiresIn: "15m" });
}

export function signRefreshToken(input: Omit<AuthTokenPayload, "type">): string {
  return jwt.sign({ ...input, type: "refresh" }, refreshTokenSecret, { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  const payload = verifyToken(token, refreshTokenSecret);
  return payload?.type === "refresh" ? payload : null;
}
