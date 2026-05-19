import { io } from "socket.io-client";
export const chatSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000"); // Change to your backend address/port