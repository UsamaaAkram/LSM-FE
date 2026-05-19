import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/students`;

export interface CourseProgress {
  courseID: string;
  courseTitle: string;
  progress: any; // match whatever is in your backend 'progress' field
}

interface DashboardState {
  coursesProgress: CourseProgress[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  coursesProgress: [],
  loading: false,
  error: null,
};

// Thunk to GET all courses progress for a student
export const fetchStudentCoursesProgress = createAsyncThunk<CourseProgress[], string>(
  "dashboard/fetchStudentCoursesProgress",
  async (studentId, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${studentId}/all-courses-progress`);
      // API directly responds with the array you want!
      return res.data || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Failed to fetch dashboard info"
      );
    }
  }
);

const studentDashboardSlice = createSlice({
  name: "studentDashboard",
  initialState,
  reducers: {
    clearCoursesProgress(state) {
      state.coursesProgress = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCoursesProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentCoursesProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.coursesProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentCoursesProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCoursesProgress } = studentDashboardSlice.actions;
export default studentDashboardSlice.reducer;