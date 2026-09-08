import { Router } from "express";
import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { emitInspectionFailed } from "../lib/socket.js";

const inspectionsRouter = Router();

function readString(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function readInt(body: unknown, key: string): number | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

inspectionsRouter.post(
  "/fail",
  authenticate,
  requireRole(Role.ADMIN, Role.INSPECTOR),
  async (req: Request, res: Response) => {
    const instituteId = readString(req.body, "instituteId");
    const recordedHeadcount = readInt(req.body, "recorded_headcount") ?? 0;
    const photoUrl = readString(req.body, "photo_url") ?? "";
    const message = readString(req.body, "message") ?? "Inspection failed";

    if (!instituteId || !req.auth) {
      res.status(400).json({ error: "instituteId is required" });
      return;
    }

    const institute = await prisma.institute.findUnique({ where: { id: instituteId } });
    if (!institute) {
      res.status(404).json({ error: "Institute not found" });
      return;
    }

    const log = await prisma.inspectionLog.create({
      data: {
        instituteId,
        inspectorId: req.auth.userId,
        status: "FAILED",
        recorded_headcount: recordedHeadcount,
        ai_flagged_proxy: true,
        photo_url: photoUrl,
      },
    });

    const alert = {
      instituteId,
      inspectorId: req.auth.userId,
      status: "FAILED" as const,
      message,
      timestamp: log.timestamp.toISOString(),
    };

    emitInspectionFailed(alert);
    res.status(201).json({ log, alert });
  },
);

export { inspectionsRouter };
