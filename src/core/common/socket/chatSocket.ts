import { io, Socket } from "socket.io-client";
// import type { AppDispatch } from "../redux/store";
// import { receiveMessage, setTyping } from "../redux/chatSlice";
import type { AppDispatch } from "../../redux/store";
import { receiveMessage, setTyping } from "../../redux/chatSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// The server authenticates the handshake, so the socket must carry the JWT.
//
// Held in a module variable and pushed in from App.tsx rather than read from
// the store here: chatSlice already imports this module, so importing the
// store would close an import cycle.
let authToken: string | null = null;

/** Keeps the socket's credentials in step with the session. */
export const setSocketAuthToken = (token: string | null) => {
  authToken = token;
};

const chatSocket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  // A callback, not a fixed object, so every connect AND every automatic
  // reconnect sends the token as it stands at that moment. A value captured
  // once would keep presenting a token the user has since replaced.
  auth: (cb) => cb({ token: authToken || "" }),
});

export const setupChatSocket = (dispatch: AppDispatch) => {
  chatSocket.on('newMessage', (msg) => {
    dispatch(receiveMessage(msg));
  });
  chatSocket.on('typing', ({ chatId, userId }) => {
    dispatch(setTyping({ chatId, userId }));
  });
  // Add more events (messageSeen, reactMessage, etc) if needed
};

export default chatSocket;