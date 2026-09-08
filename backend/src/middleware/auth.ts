import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export type AuthTokenPayload = {
  userId: string;
  role: Role;
};

function isRole(value: unknown): value is Role {
  return value === Role.ADMIN || value === Role.INSPECTOR || value === Role.NGO_HEAD;
}

export function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.userId === "string" && isRole(record.role);
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== "string" || secret.length === 0) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "12h" });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const decoded: unknown = jwt.verify(token, getJwtSecret());
    if (!isAuthTokenPayload(decoded)) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }
    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      res.status(403).json({ error: "Forbidden for this role" });
      return;
    }

    next();
  };
}
