import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middleware/validate.js";

const markReadSchema = z.object({
  read: z.boolean().default(true),
});

export const notificationsRouter = new Hono();

notificationsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return c.json(notifications);
});

notificationsRouter.patch("/:id/read", validateBody(markReadSchema), async (c) => {
  const userId = c.get("userId");
  const { read } = c.get("validatedBody") as z.infer<typeof markReadSchema>;

  const notification = await prisma.notification.updateMany({
    where: { id: c.req.param("id"), userId },
    data: { read },
  });
  if (notification.count === 0) {
    return c.json({ error: "Notification not found" }, 404);
  }
  return c.json({ success: true, read });
});
