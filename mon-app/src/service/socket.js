import { io } from "socket.io-client";

// URL du serveur Socket.io
const SOCKET_URL = "http://localhost:3001";

// Instance du client Socket.io
export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Utilisation de WebSocket uniquement
});

export default socket;