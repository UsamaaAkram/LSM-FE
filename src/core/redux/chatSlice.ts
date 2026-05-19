import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import chatApi from "../common/api/chatApi";
import chatSocket from "../common/socket/chatSocket";

export interface ChatParticipant {
  _id: string;
  name: string;
  photo?: string;
  role?: string;
  userName?: string;
}

export interface ChatMessage {
  _id: string;
  chat: string;
  sender: string;
  type: string;
  content: string;
  attachment: string;
  createdAt: string;
  senderModel?: string;
  reactions?: {
    user: string;
    reactionsUserModel: string;
    emoji: string;
  }[];
  // More: seenBy, reactions, etc.
}

type Participant = {
  _id: string;
  name?: string;
  userName?: string;
  photo?: string;
  role?: string;
};

interface ChatBlockEntry {
  blocker: string; // userId
  blocked: string; // userId
  at: string; // ISO date string
}

export interface Chat {
  _id: string;
  participants: Participant[];
  blocked?: ChatBlockEntry[]; // <-- ADD THIS LINE!
  isGroup?: boolean;
  groupName?: string;
  photo?: string;
  admin?: Participant[];
  isAnnouncement?: boolean;
  unread?: number;
  lastMessage?: {
    _id: string;
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}

export interface ChatState {
  chats: Chat[];
  messages: ChatMessage[];
  activeChat: Chat | null;
  user: { id: string; name: string; role: string; photo?: string }; // Populate from auth/user slice as needed
  typing: { [chatId: string]: string };
  unread: { [chatId: string]: number };
  loading: boolean;
  page: number; // For pagination of messages
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  activeChat: null,
  user: { id: "", name: "", role: "" }, // Populate from auth
  typing: {},
  unread: {},
  loading: false,
  page: 1, // For pagination of messages
};

// Get all chats for user
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (userId: string) => {
    // Returns array of Chat
    return await chatApi.fetchUserChats(userId);
  }
);

// Get all messages for a chat
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId, page, limit }: { chatId: string, page: number, limit?: number }) => {
    return await chatApi.fetchChatMessages(chatId, page, limit || 100);
  }
);

// Send a message to a chat
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({
    chatId,
    message,
  }: {
    chatId: string;
    message: Partial<ChatMessage>;
  }) => {
    const msg = await chatApi.sendMessage(chatId, message);
    chatSocket.emit("sendMessage", { chatId, ...msg });
    return msg;
  }
);

// Create a new chat
export const createChat = createAsyncThunk(
  "chat/createChat",
  async ({
    participants,
    groupName,
  }: {
    participants: string[];
    groupName?: string;
  }) => {
    return await chatApi.createChat(participants, groupName);
  }
);

// Delete a chat
export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async ({
    chatId,
    userId,
    role,
  }: {
    chatId: string;
    userId: string;
    role: string;
  }) => {
    await chatApi.deleteChat(chatId, userId, role);
    return chatId;
  }
);

export const unblockChat = createAsyncThunk(
  "chat/unblockChat",
  async ({ chatId, blocker, blocked }: any) => {
    // Your chatApi will send a request to remove a block
    const res = await chatApi.unblockChat(chatId, blocker, blocked);
    // Return what you need for the reducer (preferably, the updated chat)
    return { chatId, blocker, blocked, chat: res.chat };
  }
);

export const blockChat = createAsyncThunk(
  "chat/blockChat",
  async ({ chatId, blocker, blocked }: any) => {
    const chat = await chatApi.blockChat(chatId, blocker, blocked);
    return { chatId, blocker, blocked, at: chat.at, chat };
  }
);

export const uploadAttachment = createAsyncThunk(
  "chat/uploadAttachment",
  async ({
    chatId,
    file,
    senderId,
    senderModel,
    content,
  }: {
    chatId: string;
    file: File;
    senderId: string;
    senderModel: string;
    content?: string;
  }) => {
    const res = await chatApi.uploadAttachment(
      chatId,
      file,
      senderId,
      senderModel,
      content || ""
    );
    return res.attachment;
  }
);

export const createGroup = createAsyncThunk(
  "chat/createGroup",
  async ({
    adminId,
    groupName,
    participantIds,
    isAnnouncement,
  }: {
    adminId: string;
    groupName: string;
    participantIds: string[];
    isAnnouncement: boolean;
  }) => {
    return await chatApi.createGroup(
      adminId,
      groupName,
      participantIds,
      isAnnouncement
    );
  }
);

export const addMemberToGroup = createAsyncThunk(
  "chat/addMemberToGroup",
  async ({
    chatId,
    userIdToAdd,
    requestorId,
  }: {
    chatId: string;
    userIdToAdd: string;
    requestorId: string;
  }) => {
    return await chatApi.addMemberToGroup(chatId, userIdToAdd, requestorId);
  }
);

export const removeMemberFromGroup = createAsyncThunk(
  "chat/removeMemberFromGroup",
  async ({
    chatId,
    userIdToRemove,
    requestorId,
  }: {
    chatId: string;
    userIdToRemove: string;
    requestorId: string;
  }) => {
    return await chatApi.removeMemberFromGroup(
      chatId,
      userIdToRemove,
      requestorId
    );
  }
);

// Fetch chats+unread
export const fetchChatsWithUnread = createAsyncThunk(
  "chat/fetchChatsWithUnread",
  async (userId: string) => {
    return await chatApi.fetchChatsWithUnread(userId);
  }
);

// Mark as read
export const markChatAsRead = createAsyncThunk(
  "chat/markChatAsRead",
  async ({
    chatId,
    userId,
    lastMsgId,
  }: {
    chatId: string;
    userId: string;
    lastMsgId: string;
  }) => {
    await chatApi.markChatAsRead(chatId, userId, lastMsgId);
    return { chatId };
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat(state, action: PayloadAction<Chat | null>) {
      state.activeChat = action.payload;
    },
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setTyping(
      state,
      action: PayloadAction<{ chatId: string; userId: string }>
    ) {
      state.typing[action.payload.chatId] = action.payload.userId;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
      const chatId = action.payload.chat;
      if (state.activeChat && state.activeChat._id === chatId) {
        const idx = state.chats.findIndex((c) => c._id === chatId);
        if (idx >= 0) state.chats[idx].unreadCount = 0;
      } else {
        const idx = state.chats.findIndex((c) => c._id === chatId);
        if (idx >= 0)
          state.chats[idx].unreadCount =
            (state.chats[idx].unreadCount || 0) + 1;
      }
    },
    addOrUpdateChat(state, action: PayloadAction<Chat>) {
      const newChat = action.payload;
      const idx = state.chats.findIndex((chat) => chat._id === newChat._id);
      if (idx >= 0) {
        state.chats[idx] = newChat;
      } else {
        state.chats.unshift(newChat);
      }
      // Deduplicate, keeping first found:
      state.chats = Array.from(
        new Map(state.chats.map((c) => [c._id, c])).values()
      );
    },
    clearMessages(state) {
      state.messages = [];
    },
    updateMessageReaction(
      state,
      action: PayloadAction<{
        messageId: string;
        userId: string;
        userModel: string;
        emoji: string;
        reactions?: any[];
      }>
    ) {
      const { messageId, userId, userModel, emoji, reactions } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (!msg) return;
      if (reactions) {
        msg.reactions = reactions;
        return;
      }
      if (!msg.reactions) msg.reactions = [];
      msg.reactions = msg.reactions.filter(
        (r) => !(r.user === userId && r.reactionsUserModel === userModel)
      );
      if (emoji) {
        msg.reactions.push({
          user: userId,
          reactionsUserModel: userModel,
          emoji,
        });
      }
    },
    removeChat(state, action) {
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
    },
    updateChatUnreadSidebar(
      state,
      action: PayloadAction<{
        chatId: string;
        unreadCount: number;
        lastMessage?: ChatMessage;
      }>
    ) {
      const { chatId, unreadCount, lastMessage } = action.payload;
      const idx = state.chats.findIndex((c) => c._id === chatId);
      if (idx >= 0) {
        state.chats[idx].unreadCount = unreadCount;
        if (lastMessage) state.chats[idx].lastMessage = lastMessage;
      }
    },
    addPage(state, action: PayloadAction<number>) {
      // increments current page, store for next fetch
      state.page = action.payload;
    },
    prependMessages(state, action: PayloadAction<ChatMessage[]>) {
      // Add messages at the start (older messages on top)
      state.messages = [...action.payload, ...state.messages];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<Chat[]>) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchMessages.fulfilled,
        (state, action: PayloadAction<ChatMessage[]>) => {
          state.loading = false;
          state.messages = action.payload;
        }
      )
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
      })
      .addCase(
        sendMessage.fulfilled,
        (state, action: PayloadAction<ChatMessage>) => {
          state.messages.push(action.payload);
        }
      )
      .addCase(createChat.fulfilled, (state, action: PayloadAction<Chat>) => {
        state.chats.unshift(action.payload);
        state.activeChat = action.payload;
        state.messages = [];
      })
      .addCase(deleteChat.fulfilled, (state, action: PayloadAction<string>) => {
        state.chats = state.chats.filter((chat) => chat._id !== action.payload);
        if (state.activeChat && state.activeChat._id === action.payload) {
          state.activeChat = null;
          state.messages = [];
        }
      })
      .addCase(blockChat.fulfilled, (state, action) => {
        const { chatId, blocker, blocked, at, chat } = action.payload;
        // Update in chats list
        const idx = state.chats.findIndex((c) => c._id === chatId);
        if (idx >= 0 && chat) {
          state.chats[idx] = chat; // Use fresh chat from server (includes updated .blocked)
        } else if (idx >= 0) {
          // fallback: mutate blocked as before
          if (!state.chats[idx].blocked) state.chats[idx].blocked = [];
          const already = state.chats[idx].blocked.some(
            (entry) => entry.blocker === blocker && entry.blocked === blocked
          );
          if (!already) state.chats[idx].blocked.push({ blocker, blocked, at });
        }
        // Update activeChat if open
        if (state.activeChat && state.activeChat._id === chatId && chat) {
          state.activeChat = chat;
        }
      })
      .addCase(unblockChat.fulfilled, (state, action) => {
        const { chatId, blocker, blocked, chat } = action.payload;
        const idx = state.chats.findIndex((c) => c._id === chatId);
        if (idx >= 0 && chat) {
          state.chats[idx] = chat; // Server-fresh chat
        }
        if (state.activeChat && state.activeChat._id === chatId && chat) {
          state.activeChat = chat;
        }
        // If no backend chat returned, fallback:
        else if (idx >= 0) {
          if (state.chats[idx].blocked) {
            state.chats[idx].blocked = state.chats[idx].blocked.filter(
              (entry) =>
                !(entry.blocker === blocker && entry.blocked === blocked)
            );
          }
          if (
            state.activeChat &&
            state.activeChat._id === chatId &&
            state.activeChat.blocked
          ) {
            state.activeChat.blocked = state.activeChat.blocked.filter(
              (entry) =>
                !(entry.blocker === blocker && entry.blocked === blocked)
            );
          }
        }
      })
      // When you successfully fetch chats+unread counts from backend
      .addCase(fetchChatsWithUnread.fulfilled, (state, action) => {
        state.chats = action.payload;
        // Each chat in .payload should have an 'unreadCount'!
      })

      // When a chat is marked as read (user views/opens),
      .addCase(markChatAsRead.fulfilled, (state, action) => {
        const { chatId } = action.payload;
        const idx = state.chats.findIndex((c) => c._id === chatId);
        if (idx >= 0) state.chats[idx].unreadCount = 0; // Reset badge to zero
      });
  },
});

export default chatSlice.reducer;
export const {
  setActiveChat,
  receiveMessage,
  setTyping,
  addMessage,
  clearMessages,
  updateMessageReaction,
  removeChat,
  addOrUpdateChat,
  updateChatUnreadSidebar,
  addPage,
  prependMessages,
} = chatSlice.actions;
