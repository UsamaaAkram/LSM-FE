import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// #2.1 / #2.4 / #2.7 — announcements management.
//
// Backed by the existing announcement channel (a chat flagged as announcements,
// which only staff may post into), NOT a second announcements store. Anything
// published here shows up in the Announcement group in Messages as well.

export interface Announcement {
  _id: string;
  content: string;
  attachment?: string;
  isPinned?: boolean;
  pinnedAt?: string | null;
  editedAt?: string | null;
  createdAt?: string;
  sender?: {
    _id?: string;
    name?: string;
    userName?: string;
    photo?: string;
    role?: string;
  } | string;
}

interface AnnouncementState {
  items: Announcement[];
  /** null when no announcement group exists yet — an empty state, not an error. */
  chatId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/messages";

const fail = (t: any, err: any, msg: string) =>
  t.rejectWithValue(err.response?.data?.error || msg);

export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetch",
  async (_: void, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/announcements`);
      return res.data; // { chatId, announcements }
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load announcements.");
    }
  }
);

export const publishAnnouncement = createAsyncThunk(
  "announcements/create",
  async (
    payload: {
      sender: string;
      senderModel: string;
      role: string;
      content: string;
      attachment?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/announcements`, payload);
      return res.data as Announcement;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not publish the announcement.");
    }
  }
);

export const editAnnouncement = createAsyncThunk(
  "announcements/edit",
  async (
    { id, content, userId, role }:
      { id: string; content: string; userId: string; role: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/message/${id}`, {
        content, userId, role,
      });
      return res.data as Announcement;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not update the announcement.");
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/delete",
  async (
    { id, userId, userModel }:
      { id: string; userId: string; userModel: string },
    thunkAPI
  ) => {
    try {
      // Sent in the body to match the existing delete-message endpoint.
      await axios.delete(`${API_BASE}/message/${id}`, {
        data: { userId, userModel },
      });
      return id;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not delete the announcement.");
    }
  }
);

export const pinAnnouncement = createAsyncThunk(
  "announcements/pin",
  async (
    { id, pinned, role }: { id: string; pinned: boolean; role: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/message/${id}/pin`, {
        pinned, role,
      });
      return res.data as Announcement;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not update the pin.");
    }
  }
);

const initialState: AnnouncementState = {
  items: [],
  chatId: null,
  loading: false,
  saving: false,
  error: null,
};

/** Pinned first, then newest — matches the server's ordering. */
const reorder = (items: Announcement[]) =>
  [...items].sort((a, b) => {
    if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isPinned && b.isPinned) {
      return (
        new Date(b.pinnedAt ?? 0).getTime() - new Date(a.pinnedAt ?? 0).getTime()
      );
    }
    return (
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  });

const slice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    clearAnnouncementError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAnnouncements.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
      .addCase(fetchAnnouncements.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.chatId = payload.chatId ?? null;
        state.items = payload.announcements ?? [];
      })
      .addCase(fetchAnnouncements.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(publishAnnouncement.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(publishAnnouncement.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.items = reorder([payload, ...state.items]);
      })
      .addCase(publishAnnouncement.rejected, (state, { payload }) => {
        state.saving = false;
        state.error = payload as string;
      })

      .addCase(editAnnouncement.fulfilled, (state, { payload }) => {
        // The edit endpoint returns the raw message, so the populated sender
        // from the original fetch is preserved rather than being overwritten
        // with a bare id (which would blank the author's name in the list).
        const i = state.items.findIndex((x) => x._id === payload._id);
        if (i >= 0) {
          state.items[i] = {
            ...state.items[i],
            content: payload.content,
            editedAt: payload.editedAt,
          };
        }
      })
      .addCase(deleteAnnouncement.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((x) => x._id !== payload);
      })
      .addCase(pinAnnouncement.fulfilled, (state, { payload }) => {
        const i = state.items.findIndex((x) => x._id === payload._id);
        if (i >= 0) {
          state.items[i] = {
            ...state.items[i],
            isPinned: payload.isPinned,
            pinnedAt: payload.pinnedAt,
          };
        }
        state.items = reorder(state.items);
      })

      .addCase(editAnnouncement.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(deleteAnnouncement.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(pinAnnouncement.rejected, (state, { payload }) => {
        state.error = payload as string;
      });
  },
});

export const { clearAnnouncementError } = slice.actions;
export default slice.reducer;
