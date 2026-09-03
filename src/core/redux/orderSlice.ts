import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Order {
  _id?: string;
  product: string;
  productTitle: string;
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
  status: "Pending Payment" | "Under Review" | "Approved" | "Rejected" | "Completed";
  deliveredContent?: string;
  adminNote?: string;
  createdAt?: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/orders";

export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async (params: any = {}, thunkAPI) => {
    try {
      const res = await axios.get(API_BASE, { params });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Fetch failed.");
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/create",
  async (data: FormData, thunkAPI) => {
    try {
      const res = await axios.post(API_BASE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Order failed.");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async (
    { id, status, deliveredContent, adminNote }: {
      id: string;
      status: string;
      deliveredContent?: string;
      adminNote?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.patch(`${API_BASE}/${id}/status`, {
        status,
        deliveredContent,
        adminNote,
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Update failed.");
    }
  }
);

const initialState: OrderState = { orders: [], loading: false, error: null };

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload;
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.orders = [payload, ...state.orders];
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.orders = state.orders.map((o) => (o._id === payload._id ? payload : o));
      });
  },
});

export default orderSlice.reducer;
