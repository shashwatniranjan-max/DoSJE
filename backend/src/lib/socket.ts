import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

export type InspectionFailedAlert = {
  instituteId: string;
  inspectorId: string;
  status: "FAILED";
  message: string;
  timestamp: string;
};

let io: Server | undefined;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitInspectionFailed(alert: InspectionFailedAlert): void {
  if (!io) {
    console.warn("Socket.io is not initialized; skipping inspection alert");
    return;
  }
  io.emit("inspection:failed", alert);
}
