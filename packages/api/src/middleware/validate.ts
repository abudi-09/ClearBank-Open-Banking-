import { z, ZodError, type ZodTypeAny } from "zod";
import { createMiddleware } from "hono/factory";

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return createMiddleware(async (c, next) => {
    try {
      const payload = await c.req.json();
      const validated = schema.parse(payload);
      c.set("validatedBody", validated);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({ error: "Validation failed", details: z.treeifyError(error) }, 400);
      }
      return c.json({ error: "Invalid JSON body" }, 400);
    }
  });
}

declare module "hono" {
  interface ContextVariableMap {
    validatedBody: unknown;
  }
}
