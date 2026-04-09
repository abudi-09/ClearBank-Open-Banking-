import { createMiddleware } from "hono/factory";
import type { UserRole } from "./auth.js";

export function guardRole(expectedRole: UserRole) {
  return createMiddleware(async (c, next) => {
    if (c.get("userRole") !== expectedRole) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
}
