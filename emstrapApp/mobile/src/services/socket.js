import { io } from "socket.io-client";
import { API_URL } from "./api";

const socket = io(API_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("✅ Connected", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected", reason);
});

socket.on("connect_error", (err) => {
    console.log("❌ Full Error", err);
});

export default socket;