import { io, type Socket } from "socket.io-client";

let socket: Socket | undefined;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
      autoConnect: true,
    });
  }
  return socket;
}
