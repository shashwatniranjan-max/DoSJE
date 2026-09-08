import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../middleware/auth.js";

const authRouter = Router();

function isRole(value: unknown): value is Role {
  return value === Role.ADMIN || value === Role.INSPECTOR || value === Role.NGO_HEAD;
}

function readString(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

authRouter.post("/register", async (req: Request, res: Response) => {
  const name = readString(req.body, "name");
  const email = readString(req.body, "email");
  const password = readString(req.body, "password");
  const roleRaw = readString(req.body, "role");

  if (!name || !email || !password || !isRole(roleRaw)) {
    res.status(400).json({ error: "name, email, password, and a valid role are required" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: passwordHash, role: roleRaw },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signAuthToken({ userId: user.id, role: user.role });
  res.status(201).json({ user, token });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const email = readString(req.body, "email");
  const password = readString(req.body, "password");

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signAuthToken({ userId: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

export { authRouter };
