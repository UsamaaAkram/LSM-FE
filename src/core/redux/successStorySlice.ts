import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface SuccessStory {
  _id?: string;
  studentName: string;
  title: string;
  story: string;
  videoUrl?: string;
  platform?: string;
  thumbnailUrl?: string;
  featured?: boolean;
  status?: "draft" | "published";
  createdAt?: string;
}

interface SuccessStoryState {
  stories: SuccessStory[];
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/success-stories";

export const fetchSuccessStories = createAsyncThunk(
  "successStory/fetchAll",
  async (params: any = {}, thunkAPI) => {
    try {
      const res = await axios.get(API_BASE, { params });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch failed."
      );
    }
  }
);

export const createSuccessStory = createAsyncThunk(
  "successStory/create",
  async (data: FormData, thunkAPI) => {
    try {
      const res = await axios.post(API_BASE, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create failed."
      );
    }
  }
);

export const updateSuccessStory = createAsyncThunk(
  "successStory/update",
  async ({ id, data }: { id: string; data: FormData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update failed."
      );
    }
  }
);

export const deleteSuccessStory = createAsyncThunk(
  "successStory/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Delete failed."
      );
    }
  }
);

const initialState: SuccessStoryState = {
  stories: [],
  loading: false,
  error: null,
};

const successStorySlice = createSlice({
  name: "successStory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuccessStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuccessStories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stories = payload;
      })
      .addCase(fetchSuccessStories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(createSuccessStory.fulfilled, (state, { payload }) => {
        state.stories = [payload, ...state.stories];
      })
      .addCase(updateSuccessStory.fulfilled, (state, { payload }) => {
        state.stories = state.stories.map((s) =>
          s._id === payload._id ? payload : s
        );
      })
      .addCase(deleteSuccessStory.fulfilled, (state, { payload }) => {
        state.stories = state.stories.filter((s) => s._id !== payload);
      });
  },
});

export default successStorySlice.reducer;
