import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// #47 — course enrollment requests and their payment verification.

export type EnrollmentStatus =
  | "Pending Verification"
  | "Under Review"
  | "Payment Verified"
  | "Approved"
  | "Payment Rejected"
  | "Cancelled"
  | "Expired";

export interface StatusHistoryEntry {
  from?: string;
  to: string;
  byName?: string;
  byEmail?: string;
  byRole?: string;
  reason?: string;
  at?: string;
}

export interface EnrollmentRequest {
  _id?: string;
  requestId: string;
  studentId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  whatsapp?: string;
  course: string;
  courseTitle?: string;
  planName?: string;
  planPrice?: string;
  planAccessDays?: number | null;
  invoiceNumber?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentScreenshot?: { url?: string; originalname?: string } | null;
  paymentNote?: string;
  isFreeEnrollment?: boolean;
  status: EnrollmentStatus;
  rejectionReason?: string;
  processedByName?: string;
  approvedAt?: string | null;
  accessStartAt?: string | null;
  accessExpiresAt?: string | null;
  statusHistory?: StatusHistoryEntry[];
  createdAt?: string;
}

interface EnrollmentState {
  requests: EnrollmentRequest[];
  current: EnrollmentRequest | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/enrollments";

const fail = (thunkAPI: any, err: any, fallback: string) =>
  thunkAPI.rejectWithValue(err.response?.data?.error || fallback);

/** Admin queue, with filters. */
export const fetchEnrollmentRequests = createAsyncThunk(
  "enrollment/fetchAll",
  async (params: any = {}, thunkAPI) => {
    try {
      const res = await axios.get(API_BASE, { params });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load enrollment requests.");
    }
  }
);

/** The signed-in student's own requests. */
export const fetchMyEnrollments = createAsyncThunk(
  "enrollment/fetchMine",
  async (studentId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/my/${studentId}`);
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load your enrollments.");
    }
  }
);

/** Status page lookup by the human-readable reference. */
export const fetchEnrollmentByRef = createAsyncThunk(
  "enrollment/fetchByRef",
  async (requestId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/ref/${requestId}`);
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Enrollment request not found.");
    }
  }
);

/**
 * Submit a request. Multipart because a paid enrollment carries the payment
 * screenshot; free-access courses send no payment fields at all.
 */
export const submitEnrollment = createAsyncThunk(
  "enrollment/submit",
  async (
    payload: Record<string, any> & { paymentScreenshot?: File | null },
    thunkAPI
  ) => {
    try {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        if (k === "paymentScreenshot") fd.append(k, v as File);
        else fd.append(k, String(v));
      });
      const res = await axios.post(API_BASE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not submit your enrollment request.");
    }
  }
);

export const approveEnrollment = createAsyncThunk(
  "enrollment/approve",
  async ({ id, actor }: { id: string; actor?: any }, thunkAPI) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/approve`, { actor });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not approve this request.");
    }
  }
);

export const rejectEnrollment = createAsyncThunk(
  "enrollment/reject",
  async (
    { id, reason, actor }: { id: string; reason: string; actor?: any },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_BASE}/${id}/reject`, { reason, actor });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not reject this request.");
    }
  }
);

export const setEnrollmentStatus = createAsyncThunk(
  "enrollment/setStatus",
  async (
    { id, status, actor }: { id: string; status: string; actor?: any },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/${id}/status`, { status, actor });
      return res.data;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not update the status.");
    }
  }
);

const initialState: EnrollmentState = {
  requests: [],
  current: null,
  loading: false,
  submitting: false,
  error: null,
};

// Approve/reject/setStatus all return the updated document, so they share one
// reducer that swaps it into the list in place.
const upsert = (state: EnrollmentState, doc: EnrollmentRequest) => {
  const i = state.requests.findIndex((r) => r._id === doc._id);
  if (i >= 0) state.requests[i] = doc;
  if (state.current?._id === doc._id) state.current = doc;
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    clearEnrollmentError: (state) => {
      state.error = null;
    },
    clearCurrentEnrollment: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollmentRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentRequests.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.requests = payload;
      })
      .addCase(fetchEnrollmentRequests.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.requests = payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchEnrollmentByRef.fulfilled, (state, { payload }) => {
        state.current = payload;
      })
      .addCase(fetchEnrollmentByRef.rejected, (state, { payload }) => {
        state.error = payload as string;
      })

      .addCase(submitEnrollment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitEnrollment.fulfilled, (state, { payload }) => {
        state.submitting = false;
        state.current = payload;
        state.requests.unshift(payload);
      })
      .addCase(submitEnrollment.rejected, (state, { payload }) => {
        state.submitting = false;
        state.error = payload as string;
      })

      .addCase(approveEnrollment.fulfilled, (state, { payload }) => {
        upsert(state, payload);
      })
      .addCase(rejectEnrollment.fulfilled, (state, { payload }) => {
        upsert(state, payload);
      })
      .addCase(setEnrollmentStatus.fulfilled, (state, { payload }) => {
        upsert(state, payload);
      })
      .addCase(approveEnrollment.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(rejectEnrollment.rejected, (state, { payload }) => {
        state.error = payload as string;
      })
      .addCase(setEnrollmentStatus.rejected, (state, { payload }) => {
        state.error = payload as string;
      });
  },
});

export const { clearEnrollmentError, clearCurrentEnrollment } =
  enrollmentSlice.actions;
export default enrollmentSlice.reducer;
