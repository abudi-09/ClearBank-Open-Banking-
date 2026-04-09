import { Hono } from "hono";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(["PERSONAL", "BUSINESS", "COMPLIANCE"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authRouter = new Hono();

authRouter.post("/register", validateBody(registerSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof registerSchema>;
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      fullName: body.fullName,
      role: body.role ?? "PERSONAL",
    },
  });

  const tokenBase = { sub: user.id, email: user.email, role: user.role };
  return c.json(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        kycStatus: user.kycStatus,
      },
      accessToken: signAccessToken(tokenBase),
      refreshToken: signRefreshToken(tokenBase),
    },
    201,
  );
});

authRouter.post("/login", validateBody(loginSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof loginSchema>;
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isPasswordValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const tokenBase = { sub: user.id, email: user.email, role: user.role };
  return c.json({
    accessToken: signAccessToken(tokenBase),
    refreshToken: signRefreshToken(tokenBase),
  });
});

authRouter.post("/refresh", validateBody(refreshSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof refreshSchema>;
  const payload = verifyRefreshToken(body.refreshToken);
  if (!payload) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const tokenBase = { sub: user.id, email: user.email, role: user.role };
  return c.json({
    accessToken: signAccessToken(tokenBase),
    refreshToken: signRefreshToken(tokenBase),
  });
});
