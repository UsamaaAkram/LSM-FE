import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Course } from "./courses";

// API Base
// ---------- API base ----------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api`;


interface StudentCoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export const fetchStudentEnrolledCourses = createAsyncThunk<Course[], string>(
  "studentCourses/fetchStudentEnrolledCourses",
  async (studentId, thunkAPI) => {
    try {
      const res = await axios.get(
        `${Base_URL}/courses/${studentId}/enrolled-courses`
      );
      // API returns { enrolledCourses: Course[] }
      return res.data.enrolledCourses || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch enrolled courses failed"
      );
    }
  }
);

const initialState: StudentCoursesState = {
  courses: [],
  loading: false,
  error: null,
};

const studentCoursesSlice = createSlice({
  name: "studentCourses",
  initialState,
  reducers: {
    clearStudentCourses(state) {
      state.courses = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStudentCourses } = studentCoursesSlice.actions;
export default studentCoursesSlice.reducer;
