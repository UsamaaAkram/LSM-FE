import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Shop orders (#43, expanded per the client's order-management brief).
//
// The seven stages, in flow order. Rejected is deliberately not in here: it is
// terminal, not a step every order passes through, so drawing it as the last
// node of the timeline would be wrong.
export const STATUS_FLOW = [
  "Pending Payment",
  "Pending Verification",
  "Payment Verified",
  "Processing",
  "Product Delivered",
  "Completed",
] as const;

export const ALL_STATUSES = [...STATUS_FLOW, "Rejected"] as const;
export type OrderStatus = (typeof ALL_STATUSES)[number];

/**
 * Pre-expansion status names. Rows that haven't been backfilled still arrive
 * with these, so everything that reads a status maps it through here first —
 * otherwise a legacy order falls out of every filter and renders unstyled.
 */
const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  "Under Review": "Pending Verification",
  Approved: "Payment Verified",
};
export const normaliseStatus = (s?: string): OrderStatus =>
  (LEGACY_STATUS_MAP[s || ""] || s || "Pending Payment") as OrderStatus;

/**
 * Per-status colour. The client's brief calls out that two review states were
 * rendered in the same colour and could not be told apart, so every stage here
 * gets a distinct one and they progress warm -> cool -> green as the order
 * advances. Bootstrap's own palette, so it stays consistent with the dashboard.
 */
export const STATUS_STYLE: Record<OrderStatus, { badge: string; dot: string; label: string }> = {
  "Pending Payment": {
    badge: "bg-secondary-transparent text-secondary",
    dot: "#6c757d",
    label: "Pending Payment",
  },
  "Pending Verification": {
    badge: "bg-warning-transparent text-warning",
    dot: "#ffc107",
    label: "Pending Verification",
  },
  "Payment Verified": {
    badge: "bg-info-transparent text-info",
    dot: "#0dcaf0",
    label: "Payment Verified",
  },
  Processing: {
    badge: "bg-primary-transparent text-primary",
    dot: "#0d6efd",
    label: "Processing",
  },
  "Product Delivered": {
    badge: "bg-success-transparent text-success",
    dot: "#198754",
    label: "Product Delivered",
  },
  Completed: {
    badge: "bg-dark-transparent text-dark",
    dot: "#212529",
    label: "Completed",
  },
  Rejected: {
    badge: "bg-danger-transparent text-danger",
    dot: "#dc3545",
    label: "Rejected",
  },
};

export const DELIVERY_TYPES = [
  "Download Link",
  "Google Drive Link",
  "Google Docs Link",
  "Course Access",
  "External URL",
  "License Key",
  "Activation Code",
  "Login Credentials",
  "Text Instructions",
  "Other",
] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];

/** Types whose value is a URL, so the student page can render it as a link. */
export const LINK_DELIVERY_TYPES: string[] = [
  "Download Link",
  "Google Drive Link",
  "Google Docs Link",
  "External URL",
];

export interface OrderDelivery {
  type?: DeliveryType;
  value?: string;
  username?: string;
  password?: string;
  instructions?: string;
  deliveredAt?: string | null;
  deliveredByName?: string;
}

export interface StatusEvent {
  status?: string;
  at?: string;
  byName?: string;
  byRole?: string;
  note?: string;
}

export interface Order {
  _id?: string;
  /** Readable reference, ORD-YYYY-NNNNNN. */
  orderId?: string;
  product: string;
  productTitle: string;
  productImageUrl?: string;
  /**
   * Price as it stood when the order was placed (#43). Optional because orders
   * created before this was captured won't have it — the UI shows a dash rather
   * than inventing a figure.
   */
  pricePaid?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  paymentScreenshotUrl?: string;
  transactionId?: string;
  paymentMethod?: string;
  customerNote?: string;
  status: OrderStatus | string;
  statusHistory?: StatusEvent[];
  delivery?: OrderDelivery;
  /** Superseded by `delivery`; still populated on orders delivered earlier. */
  deliveredContent?: string;
  adminNote?: string;
  rejectionReason?: string;
  createdAt?: string;
}

interface OrderState {
  orders: Order[];
  /** Per-stage totals for the admin queue's filter chips. */
  counts: Record<string, number>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/orders";

const fail = (t: any, err: any, msg: string) =>
  t.rejectWithValue(err.response?.data?.error || msg);

export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async (
    params: { studentId?: string; status?: string; search?: string } = {},
    thunkAPI
  ) => {
    try {
      const res = await axios.get(API_BASE, { params });
      // The endpoint used to return a bare array and now returns
      // { orders, counts }. Both shapes are accepted so a stale deployment of
      // either half doesn't blank the page.
      return Array.isArray(res.data)
        ? { orders: res.data, counts: {} }
        : { orders: res.data.orders || [], counts: res.data.counts || {} };
    } catch (err: any) {
      return fail(thunkAPI, err, "Fetch failed.");
    }
  }
);

/** The student's own orders — delivery details are sealed until delivered. */
export const fetchMyOrders = createAsyncThunk(
  "order/fetchMine",
  async (studentId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/my/${studentId}`);
      return res.data as Order[];
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not load your orders.");
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/create",
  async (data: FormData, thunkAPI) => {
    try {
      const res = await axios.post(API_BASE, data);
      return res.data as Order;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not submit your order.");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async (
    {
      id,
      status,
      deliveredContent,
      adminNote,
      rejectionReason,
      role,
      actorName,
    }: {
      id: string;
      status: string;
      deliveredContent?: string;
      adminNote?: string;
      rejectionReason?: string;
      role: string;
      actorName?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/${id}/status`, {
        status,
        deliveredContent,
        adminNote,
        rejectionReason,
        role,
        actorName,
      });
      return res.data as Order;
    } catch (err: any) {
      return fail(thunkAPI, err, "Update failed.");
    }
  }
);

/** Records the handover and (by default) moves the order to Product Delivered. */
export const deliverOrder = createAsyncThunk(
  "order/deliver",
  async (
    payload: {
      id: string;
      type: string;
      value?: string;
      username?: string;
      password?: string;
      instructions?: string;
      markDelivered?: boolean;
      role: string;
      actorName?: string;
    },
    thunkAPI
  ) => {
    try {
      const { id, ...body } = payload;
      const res = await axios.patch(`${API_BASE}/${id}/deliver`, body);
      return res.data as Order;
    } catch (err: any) {
      return fail(thunkAPI, err, "Could not save the delivery.");
    }
  }
);

const initialState: OrderState = {
  orders: [],
  counts: {},
  loading: false,
  saving: false,
  error: null,
};

/** Replaces one order in place, leaving the rest of the list untouched. */
const replace = (state: OrderState, payload: Order) => {
  state.orders = state.orders.map((o) => (o._id === payload._id ? payload : o));
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload.orders;
        state.counts = payload.counts;
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload;
      })
      .addCase(fetchMyOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(createOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.orders = [payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.saving = false;
        state.error = payload as string;
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.saving = false;
        replace(state, payload);
      })
      .addCase(updateOrderStatus.rejected, (state, { payload }) => {
        state.saving = false;
        state.error = payload as string;
      })

      .addCase(deliverOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deliverOrder.fulfilled, (state, { payload }) => {
        state.saving = false;
        replace(state, payload);
      })
      .addCase(deliverOrder.rejected, (state, { payload }) => {
        state.saving = false;
        state.error = payload as string;
      });
  },
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
