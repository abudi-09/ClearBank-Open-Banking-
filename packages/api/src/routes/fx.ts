import { Hono } from "hono";

const baseRates: Record<string, Record<string, number>> = {
  GBP: { USD: 1.24, EUR: 1.17, GBP: 1 },
  USD: { GBP: 0.81, EUR: 0.94, USD: 1 },
  EUR: { GBP: 0.86, USD: 1.07, EUR: 1 },
};

export const fxRouter = new Hono();

fxRouter.get("/rates", (c) => {
  const base = (c.req.query("base") ?? "GBP").toUpperCase();
  const rates = baseRates[base];
  if (!rates) {
    return c.json({ error: "Unsupported base currency" }, 400);
  }
  return c.json({ base, rates, timestamp: new Date().toISOString() });
});
