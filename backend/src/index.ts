import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.js";
import { institutesRouter } from "./routes/institutes.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/institutes", institutesRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "connected" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(503).json({ ok: false, database: "disconnected", message });
  }
});

app.listen(port, () => {
  console.log(`DoSJE backend listening on port ${port}`);
});
