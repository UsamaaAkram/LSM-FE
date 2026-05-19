import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export type Reply = {
  userID: string;
  email: string;
  userName: string;
  message: string;
  date: string;
};

export type Ticket = {
  _id?: string;
  TicketID: string;
  Date: string;
  Subject: string;
  Priority: string;
  Category: string;
  Status: string;
  Description: string;
  // SERVER: single attachment object, CLIENT: File or custom {originalname, mimetype, ...} type
  Attachments?: any;
  Replies?: Reply[];
};

interface TicketState {
  tickets: Ticket[];
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/tickets";

// CREATE (single attachment only)
export const createTicket = createAsyncThunk(
  "ticket/create",
  async (data: any, thunkAPI) => {
    try {
      // Use multipart/form-data for file upload and serialize Replies for backend (JSON)
      const formData = new FormData();
      formData.append("Subject", data.Subject);
      formData.append("Category", data.Category);
      formData.append("Priority", data.Priority);
      formData.append("Description", data.Description);
      formData.append("Status", data.Status);
      formData.append("Date", data.Date);
      formData.append("createdBy", data.createdBy);
      // replies: must be stringified for backend
      if (data.Replies) {
        formData.append("Replies", JSON.stringify(data.Replies));
      }
      // Single attachment only per your backend
      if (data.Attachments && data.Attachments[0]) {
        formData.append("Attachments", data.Attachments[0]);
      }
      const res = await axios.post(API_BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create ticket failed."
      );
    }
  }
);

// GET ALL / Search
export const fetchTickets = createAsyncThunk(
  "ticket/fetchAll",
  async (params: any, thunkAPI) => {
    try {
      const res = await axios.get(API_BASE, { params });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch tickets failed."
      );
    }
  }
);

// GET ONE
export const fetchTicketById = createAsyncThunk(
  "ticket/getById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch ticket failed."
      );
    }
  }
);

// UPDATE (single attachment only)
export const updateTicket = createAsyncThunk(
  "ticket/update",
  async ({ id, data }: { id: string; data: any }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("Subject", data.Subject);
      formData.append("Category", data.Category);
      formData.append("Priority", data.Priority);
      formData.append("Description", data.Description);
      formData.append("Status", data.Status);
      formData.append("Date", data.Date);
      if (data.Replies) {
        formData.append("Replies", JSON.stringify(data.Replies));
      }
      // Only the first file (per the backend contract)
      if (data.Attachments) {
        formData.append("Attachments", data.Attachments);
      }
      const res = await axios.put(`${API_BASE}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update ticket failed."
      );
    }
  }
);

// DELETE
export const deleteTicket = createAsyncThunk(
  "ticket/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Delete ticket failed."
      );
    }
  }
);

// GET ALL BY USER + Search/Filter
export const fetchByUserTickets = createAsyncThunk(
  "ticket/fetchByUser",
  async ({ id, params }: { id: string; params?: any }, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/by-user/${id}`, { params });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch tickets failed."
      );
    }
  }
);

// ADD REPLY (client: push reply, server: replace entire Replies arr!)
export const addReply = createAsyncThunk(
  "ticket/addReply",
  async ({ ticketId, reply }: { ticketId: string; reply: Reply }, thunkAPI) => {
    try {
      // Fetch existing ticket first
      const resGet = await axios.get(`${API_BASE}/${ticketId}`);
      const currentTicket = resGet.data;
      // update: replies array pushed from client and saved as new array
      const updatedReplies = Array.isArray(currentTicket.Replies)
        ? [...currentTicket.Replies, reply]
        : [reply];
      const formData = new FormData();
      // Add all other required fields for update to comply with backend
      formData.append("Subject", currentTicket.Subject);
      formData.append("Category", currentTicket.Category);
      formData.append("Priority", currentTicket.Priority);
      formData.append("Description", currentTicket.Description);
      formData.append("Status", currentTicket.Status);
      formData.append("Date", currentTicket.Date);
      formData.append("Attachments", currentTicket.Attachments ?? '');
      formData.append("Replies", JSON.stringify(updatedReplies));

      const res = await axios.put(`${API_BASE}/${ticketId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Add reply failed."
      );
    }
  }
);

const initialState: TicketState = {
  tickets: [],
  ticket: null,
  loading: false,
  error: null,
  success: false,
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    clearTicketState(state) {
      state.success = false;
      state.error = null;
      state.ticket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tickets = Array.isArray(payload) ? payload : payload.tickets;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchByUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchByUserTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tickets = Array.isArray(payload) ? payload : payload.tickets;
        state.error = null;
      })
      .addCase(fetchByUserTickets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.ticket = payload;
        state.error = null;
      })
      .addCase(fetchTicketById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tickets = [...state.tickets, payload];
        state.success = true;
        state.error = null;
      })
      .addCase(createTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tickets = state.tickets.map((t) =>
          t._id === payload._id ? payload : t
        );
        state.ticket = payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tickets = state.tickets.filter((t) => t._id !== payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      .addCase(addReply.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addReply.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.ticket = payload;
        state.success = true;
        state.error = null;
        // Optionally also update state.tickets if desired
      })
      .addCase(addReply.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      });
  },
});

export const { clearTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
