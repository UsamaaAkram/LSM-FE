import axios from "axios";
import type { Chat } from "../../redux/chatSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = API_URL + "/api";

const chatApi = {
  // List chats for user (replace with correct endpoint if needed)
  fetchUserChats: async (userId: string) => {
    const res = await axios.get(`${BASE_URL}/chat/${userId}/chats`);
    return res.data;
  },

  // Get all messages in specific chat (paginated if needed)
  fetchChatMessages: async (chatId: string, page: number, limit: number = 100) => {
    const res = await axios.get(`${BASE_URL}/messages/chat/${chatId}/messages`, {
      params: { page, limit }
    });
    return res.data;
  },

  // Send a new message to a chat
  sendMessage: async (chatId: string, message: any) => {
    const res = await axios.post(
      `${BASE_URL}/messages/chat/${chatId}/message`,
      message
    );
    return res.data;
  },

  createChat: async (participants: string[], groupName?: string) => {
    const res = await axios.post(`${BASE_URL}/chat`, {
      participants,
      groupName,
    });
    return res.data;
  },

  deleteChat: async (chatId: string, userId: string, role: string) => {
    return await axios.delete(`${BASE_URL}/chat/${chatId}`, {
      // data: { userId },
      data: { userId: userId, userModel: role },
    });
  },

  blockChat: async (chatId: string, userId: string, role: string) => {
    const res = await axios.post(`${BASE_URL}/chat/${chatId}/block`, {
      userId: userId,
      userModel: role,
    });
    return res.data;
  },
  unblockChat: async (chatId: string, blocker: string, blocked: string) => {
    const res = await axios.post(`${BASE_URL}/chat/${chatId}/unblock`, {
      blocker,
      blocked,
    });
    return res.data; // Should contain chat or success boolean
  },
  uploadAttachment: async (
    chatId: string,
    file: File,
    senderId: string,
    senderModel: string,
    content: string = ""
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", senderId);
    formData.append("senderModel", senderModel);
    formData.append("content", content); // optional caption

    const res = await axios.post(
      `${BASE_URL}/chat/${chatId}/attachment`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // { success, attachment, message }
  },

  createGroup: async (
    adminId: string,
    groupName: string,
    participantIds: string[],
    isAnnouncement: boolean
  ) => {
    const res = await axios.post(`${BASE_URL}/chat/group`, {
      adminId,
      groupName,
      participantIds,
      isAnnouncement,
    });
    return res.data;
  },
  addMemberToGroup: async (
    chatId: string,
    userIdToAdd: string,
    requestorId: string
  ) => {
    const res = await axios.post(`${BASE_URL}/chat/${chatId}/addMember`, {
      userIdToAdd,
      requestorId,
    });
    return res.data;
  },
  removeMemberFromGroup: async (
    chatId: string,
    userIdToRemove: string,
    requestorId: string
  ) => {
    const res = await axios.post(`${BASE_URL}/chat/${chatId}/removeMember`, {
      userIdToRemove,
      requestorId,
    });
    return res.data;
  },
  async fetchChatsWithUnread(userId: string): Promise<Chat[]> {
    const res = await axios.get(`${BASE_URL}/chat/listWithUnread/${userId}`);
    return res.data;
  },
  async markChatAsRead(chatId: string, userId: string, lastMsgId: string): Promise<void> {
    await axios.post(`${BASE_URL}/chat/${chatId}/read`,{ userId, lastReadMessageId: lastMsgId });
  },
};

export default chatApi;
