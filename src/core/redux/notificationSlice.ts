import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// #2.16 — the notification centre. Replaces toast-only alerts, which vanished
// on refresh and only existed in the tab that triggered them.

export interface AppNotification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  actorName?: string;
  isRead: boolean;
  createdAt?: string;
}

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/notifications";

const fail = (t: any, err: any, msg: string) =>
  t.rejectWithValue(err.response?.data?.error || msg);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (userId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      return res.data; // { items, unreadCount }
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load notifications.");
    }
  }
);

/** Badge-only poll — cheap enough to run on an interval. */
export const fetchUnreadCount = createAsyncThunk(
  "notifications/count",
  async (userId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}/count`);
      return res.data.unreadCount as number;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load the unread count.");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/read",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.patch(`${API_BASE}/${id}/read`);
      return res.data as AppNotification;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not mark it read.");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/readAll",
  async (userId: string, thunkAPI) => {
    try {
      await axios.post(`${API_BASE}/${userId}/read-all`);
      return true;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not clear notifications.");
    }
  }
);

export const dismissNotification = createAsyncThunk(
  "notifications/dismiss",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      return id;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not dismiss it.");
    }
  }
);

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationState: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    /**
     * A notification pushed over the socket. Guarded against duplicates: the
     * same row can also arrive from the next poll or a panel open, and counting
     * it twice would leave the badge permanently wrong.
     */
    notificationReceived: (state, { payload }: { payload: AppNotification }) => {
      if (state.items.some((n) => n._id === payload._id)) return;
      state.items.unshift(payload);
      if (!payload.isRead) state.unreadCount += 1;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
    })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.items ?? [];
        state.unreadCount = payload.unreadCount ?? 0;
      })
      .addCase(fetchNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, { payload }) => {
        const i = state.items.findIndex((n) => n._id === payload._id);
        // Only decrement if it was actually unread, or double-clicking a row
        // would drive the badge negative.
        if (i >= 0 && !state.items[i].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        if (i >= 0) state.items[i] = payload;
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })

      .addCase(dismissNotification.fulfilled, (state, { payload }) => {
        const gone = state.items.find((n) => n._id === payload);
        if (gone && !gone.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n._id !== payload);
      });
  },
});

export const { clearNotificationState, notificationReceived } =
  notificationSlice.actions;
export default notificationSlice.reducer;
