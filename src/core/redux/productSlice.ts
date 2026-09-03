import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Product {
  _id?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
  deliveryNote?: string;
  status?: "draft" | "published";
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/products";

export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (params: any = {}, thunkAPI) => {
    try {
      const res = await axios.get(API_BASE, { params });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Fetch failed.");
    }
  }
);

export const createProduct = createAsyncThunk(
  "product/create",
  async (data: FormData, thunkAPI) => {
    try {
      const res = await axios.post(API_BASE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Create failed.");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, data }: { id: string; data: FormData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Update failed.");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Delete failed.");
    }
  }
);

const initialState: ProductState = { products: [], loading: false, error: null };

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.products = [payload, ...state.products];
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.products = state.products.map((p) => (p._id === payload._id ? payload : p));
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.products = state.products.filter((p) => p._id !== payload);
      });
  },
});

export default productSlice.reducer;
