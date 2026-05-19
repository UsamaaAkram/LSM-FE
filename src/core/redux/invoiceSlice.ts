import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/invoices`;

// ─── Types ───
export interface InvoiceItem {
  itemId: string;
  qty: number;
}

export interface CatalogItem {
  _id: string;
  itemId: string;
  name: string;
  price: number;
  description?: string;
}

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  items: InvoiceItem[];
  paymentMethod: string;
  paymentStatus: string;
  dueDate: string;
  notes?: string;
  discount?: string;
  createdBy: string;
  totalAmount?: number;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  discountAmount?: number;
  invoiceId?: number;
}

interface InvoiceState {
  invoices: Invoice[];
  invoice: Invoice | null;
  catalog: CatalogItem[];
  loading: boolean;
  catalogLoading: boolean;
  error: string | null;
  success: boolean;
}

// ─── Thunks ───

// GET catalog items
export const fetchCatalog = createAsyncThunk(
  "invoice/fetchCatalog",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/catalog`);
      return Array.isArray(res.data) ? res.data : res.data.catalog || res.data.items || [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to fetch catalog"
      );
    }
  }
);

// GET all invoices
export const fetchInvoices = createAsyncThunk(
  "invoice/fetchAll",
  async (params: Record<string, string> = {}, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${Base_URL}${query ? `?${query}` : ""}`);
      return Array.isArray(res.data) ? res.data : res.data.invoices || [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch invoices failed"
      );
    }
  }
);

// GET single invoice
export const fetchInvoiceById = createAsyncThunk(
  "invoice/fetchById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${id}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch invoice failed"
      );
    }
  }
);

// POST create invoice
export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (data: Omit<Invoice, "_id">, thunkAPI) => {
    try {
      const res = await axios.post(Base_URL, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create invoice failed"
      );
    }
  }
);

// PUT update invoice
export const updateInvoice = createAsyncThunk(
  "invoice/update",
  async ({ id, data }: { id: string; data: Partial<Invoice> }, thunkAPI) => {
    try {
      const res = await axios.put(`${Base_URL}/${id}`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update invoice failed"
      );
    }
  }
);

// DELETE invoice
export const deleteInvoice = createAsyncThunk(
  "invoice/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${Base_URL}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Delete invoice failed"
      );
    }
  }
);

// ─── Slice ───
const initialState: InvoiceState = {
  invoices: [],
  invoice: null,
  catalog: [],
  loading: false,
  catalogLoading: false,
  error: null,
  success: false,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearInvoiceState(state) {
      state.success = false;
      state.error = null;
      state.invoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Catalog
      .addCase(fetchCatalog.pending, (state) => {
        state.catalogLoading = true;
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, { payload }) => {
        state.catalogLoading = false;
        state.catalog = payload;
      })
      .addCase(fetchCatalog.rejected, (state, { payload }) => {
        state.catalogLoading = false;
        state.error = payload as string;
      })
      // Fetch all
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoices = payload;
      })
      .addCase(fetchInvoices.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // Fetch by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoice = payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      // Create
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoices.unshift(payload);
        state.success = true;
      })
      .addCase(createInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      // Update
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoices = state.invoices.map((inv) =>
          inv._id === payload._id ? payload : inv
        );
        state.invoice = payload;
        state.success = true;
      })
      .addCase(updateInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      // Delete
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.invoices = state.invoices.filter((inv) => inv._id !== payload);
        state.success = true;
      })
      .addCase(deleteInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      });
  },
});

export const { clearInvoiceState } = invoiceSlice.actions;
export default invoiceSlice.reducer;