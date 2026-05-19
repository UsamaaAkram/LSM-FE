import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// The Assignment type based on your Node.js model
export interface Assignment {
  _id: string;
  courseID: string;
  title: string;
  description: string;
  instructions: string;
  lastDate: string; // ISO String
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: Assignment[];
  assignment: Assignment | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = API_URL + "/api/assignments";

const fetchAssignments = createAsyncThunk(
  "assignment/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(Base_URL);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch failed."
      );
    }
  }
);

const searchAssignments = createAsyncThunk(
  "assignment/search",
  async (params: { search?: string; status?: string }, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${Base_URL}?${query}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Search failed."
      );
    }
  }
);

const fetchAssignmentById = createAsyncThunk(
  "assignment/getById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${id}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Get By ID failed."
      );
    }
  }
);

const createAssignment = createAsyncThunk(
  "assignment/create",
  async (data: Partial<Assignment>, thunkAPI) => {
    try {
      const res = await axios.post(Base_URL, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create failed."
      );
    }
  }
);

const updateAssignment = createAsyncThunk(
  "assignment/update",
  async ({ id, data }: { id: string; data: Partial<Assignment> }, thunkAPI) => {
    try {
      const res = await axios.put(`${Base_URL}/${id}`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update failed."
      );
    }
  }
);

const deleteAssignment = createAsyncThunk(
  "assignment/delete",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${Base_URL}/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Delete failed."
      );
    }
  }
);

const initialState: AssignmentState = {
  assignments: [],
  assignment: null,
  loading: false,
  error: null,
  success: false,
};

const assignmentSlice = createSlice({
  name: "assignment",
  initialState,
  reducers: {
    clearAssignmentState(state) {
      state.success = false;
      state.error = null;
      state.assignment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignments = Array.isArray(payload) ? payload : payload.assignments;
        state.error = null;
      })
      .addCase(fetchAssignments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(searchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAssignments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignments = Array.isArray(payload) ? payload : payload.assignments;
        state.error = null;
      })
      .addCase(searchAssignments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignment = payload;
        state.error = null;
      })
      .addCase(fetchAssignmentById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAssignment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignments.push(payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createAssignment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })

      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAssignment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignments = state.assignments.map((a) =>
          a._id === payload._id ? payload : a
        );
        state.success = true;
        state.error = null;
      })
      .addCase(updateAssignment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })

      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAssignment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.assignments = state.assignments.filter((a) => a._id !== payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteAssignment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      });
  },
});

export const { clearAssignmentState } = assignmentSlice.actions;
export default assignmentSlice.reducer;
export {
  fetchAssignments,
  searchAssignments,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};