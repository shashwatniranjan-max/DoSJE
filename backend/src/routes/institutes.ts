import { Router } from "express";
import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const institutesRouter = Router();

institutesRouter.get(
  "/",
  authenticate,
  requireRole(Role.ADMIN, Role.INSPECTOR, Role.NGO_HEAD),
  async (_req: Request, res: Response) => {
    const institutes = await prisma.institute.findMany({
      include: {
        incharge: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    res.json({ institutes });
  },
);

export { institutesRouter };
