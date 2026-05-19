import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Course } from "./courses";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/students`;


interface WishlistState {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export const fetchStudentWishlistCourses = createAsyncThunk<Course[], string>(
  "wishlist/fetchStudentWishlistCourses",
  async (studentId, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${studentId}/wishlist`);
      return res.data.wishlistCourses || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch wishlist failed"
      );
    }
  }
);

const initialState: WishlistState = {
  courses: [],
  loading: false,
  error: null,
};

const studentWishlistSlice = createSlice({
  name: "studentWishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.courses = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentWishlistCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentWishlistCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentWishlistCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = studentWishlistSlice.actions;
export default studentWishlistSlice.reducer;