import { io, Socket } from "socket.io-client";
// import type { AppDispatch } from "../redux/store";
// import { receiveMessage, setTyping } from "../redux/chatSlice";
import type { AppDispatch } from "../../redux/store";
import { receiveMessage, setTyping } from "../../redux/chatSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const chatSocket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket']
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