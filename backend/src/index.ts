import "dotenv/config";
import { createServer } from "node:http";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { initSocket } from "./lib/socket.js";
import { authRouter } from "./routes/auth.js";
import { institutesRouter } from "./routes/institutes.js";
import { auditRouter } from "./routes/audit.js";
import { inspectionsRouter } from "./routes/inspections.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/institutes", institutesRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api", auditRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "connected" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(503).json({ ok: false, database: "disconnected", message });
  }
});

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`DoSJE backend listening on port ${port}`);
});
