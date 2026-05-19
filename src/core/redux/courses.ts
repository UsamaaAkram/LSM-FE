import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API Base
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/courses`;
// TYPES
export interface Lesson {
  name: string;
  videoUrl: string;
  description: string;
  _id?: string;
}
export interface Topic {
  topic: string;
  lessons: Lesson[];
  _id?: string;
}
export interface Course {
  _id?: string;
  courseTitle: string;
  courseCategory: string;
  courseLevel: string | number;
  courseDescription: string;
  courseThumbnailUrl?: string; // For preview
  courseThumbnail?: File | null; // For upload
  courseVideoProvider: string | number;
  courseVideoUrl: string;
  curriculum: Topic[];
  notes: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  studentCount?: number;
  quizzesCount?: number;
  duration?: string;
  createdBy?: string;
}

// STATE
interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  currentCourse?: Course | null;

  courseAssignments?: any[];
  courseAssignmentsLoading?: boolean;
  courseAssignmentsError?: string | null;
}

// CREATE COURSE (POST /api/courses)
export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (courseData: Course, thunkAPI) => {
    try {
      let payload;
      let headers = { "Content-Type": "multipart/form-data" };
      // If thumbnail is present, upload as FormData
      if (courseData.courseThumbnail instanceof File) {
        payload = new FormData();
        for (const key in courseData) {
          if (key === "curriculum") {
            payload.append("curriculum", JSON.stringify(courseData.curriculum));
          } else if (key === "courseThumbnail") {
            if (courseData.courseThumbnail)
              payload.append("courseThumbnail", courseData.courseThumbnail);
          } else {
            payload.append(key, (courseData as any)[key]);
          }
        }
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        payload = courseData;
        headers = { "Content-Type": "application/json" };
      }
      const res = await axios.post(`${Base_URL}`, payload, {
        headers,
      });
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create course failed"
      );
    }
  }
);

// GET ALL COURSES (GET /api/courses)
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params: { status?: string; search?: string } = {}, thunkAPI) => {
    try {
      let query = "";
      if (params) {
        const qs = [];
        if (params.status) qs.push(`status=${params.status}`);
        if (params.search)
          qs.push(`search=${encodeURIComponent(params.search)}`);
        if (qs.length) query = "?" + qs.join("&");
      }
      const res = await axios.get(`${Base_URL}${query}`);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch courses failed"
      );
    }
  }
);

// GET COURSE BY ID (GET /api/courses/:id)
export const fetchCourseById = createAsyncThunk(
  "courses/fetchCourseById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${id}`);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch course failed"
      );
    }
  }
);

// UPDATE COURSE (PUT /api/courses/:id)
export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async ({ id, data }: { id: string; data: Partial<Course> }, thunkAPI) => {
    try {
      const res = await axios.put(`${Base_URL}/${id}`, data);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update course failed"
      );
    }
  }
);

// DELETE COURSE (DELETE /api/courses/:id)
export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.delete(`${Base_URL}/${id}`);
      return { id, ...res.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete course failed"
      );
    }
  }
);

export const fetchCourseAssignments = createAsyncThunk(
  "student/fetchCourseAssignments",
  async (courseId: string, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${courseId}/assignments`);
      // Expecting an array
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetching assignments failed"
      );
    }
  }
);

const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
  currentCourse: null,
  courseAssignments: [],
  courseAssignmentsLoading: false,
  courseAssignmentsError: null,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCurrentCourse(state, action) {
      state.currentCourse = action.payload;
    },
    clearCurrentCourse(state) {
      state.currentCourse = null;
    },
    clearCourseAssignments(state) {
      state.courseAssignments = [];
      state.courseAssignmentsLoading = false;
      state.courseAssignmentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.courses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // FETCH ALL
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // FETCH BY ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCourse = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.currentCourse = null;
        state.error = action.payload as string;
      })
      // UPDATE COURSE
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const idx = state.courses.findIndex(
          (x) => x._id === action.payload._id
        );
        if (idx >= 0) state.courses[idx] = action.payload;
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // DELETE COURSE
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.courses = state.courses.filter(
          (x) => x._id !== action.payload.id
        );
        if (state.currentCourse?._id === action.payload.id) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseAssignments.pending, (state) => {
        state.courseAssignmentsLoading = true;
        state.courseAssignmentsError = null;
      })
      .addCase(fetchCourseAssignments.fulfilled, (state, action) => {
        state.courseAssignmentsLoading = false;
        state.courseAssignments = action.payload;
      })
      .addCase(fetchCourseAssignments.rejected, (state, action) => {
        state.courseAssignmentsLoading = false;
        state.courseAssignmentsError = action.payload as string;
      });
  },
});

export const { setCurrentCourse, clearCurrentCourse, clearCourseAssignments } =
  coursesSlice.actions;
export default coursesSlice.reducer;
