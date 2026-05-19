import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/students`;

export const fetchLessonWatched = createAsyncThunk(
  "lessonWatched/fetch",
  async ({
    studentId,
    courseId,
    lessonId,
    videoId,
  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
    videoId: string;
  }) => {
    const res = await axios.get(
      `${Base_URL}/${studentId}/course/${courseId}/lesson-watched/${lessonId}/${videoId}`
    );
    return res.data;
  }
);

// POST: create new lesson-watched record
export const createLessonWatched = createAsyncThunk(
  "lessonWatched/create",
  async ({
    studentId,
    courseId,
    lessonWatched,
  }: {
    studentId: string;
    courseId: string;
    lessonWatched: {
      lessonID: string;
      videoID: string;
      completed: boolean;
      videoTime: number;
      presentWatch: number;
    };
  }) => {
    const res = await axios.post(
      `${Base_URL}/${studentId}/course/${courseId}/lesson-watched`,
      lessonWatched
    );
    return res.data;
  }
);

// PUT: update existing lesson-watched record
export const updateLessonWatched = createAsyncThunk(
  "lessonWatched/update",
  async ({
    studentId,
    courseId,
    lessonId,
    videoId,
    lessonWatched,

  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
    videoId: string;
    lessonWatched: {
      lessonID: string;
      videoID: string;
      completed: boolean;
      videoTime: number;
      presentWatch: number;
    };
  }) => {
    const res = await axios.put(
      `${Base_URL}/${studentId}/course/${courseId}/lesson-watched/${lessonId}/${videoId}`,
      lessonWatched
    );
    return res.data;
  }
);

const studentLessonWatchedSlice = createSlice({
  name: "lessonWatched",
  initialState: {
    loading: false,
    error: null as null | string,
    status: null as null | any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonWatched.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonWatched.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.lessonWatched;
      })
      .addCase(fetchLessonWatched.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error loading lesson watched";
      })
      .addCase(createLessonWatched.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLessonWatched.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(createLessonWatched.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error creating lesson watched";
      })
      .addCase(updateLessonWatched.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLessonWatched.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(updateLessonWatched.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error updating lesson watched";
      });
  },
});

export default studentLessonWatchedSlice.reducer;
