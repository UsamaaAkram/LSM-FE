import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUser } from "./authSlice";
import type { RootState } from "./store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = API_URL + "/api/instructor";

export interface InstructorProfile {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  isVerified?: boolean;
  isDisable?: boolean;
  education?: Array<{
    degree: string;
    university: string;
    fromDate: string | null;
    toDate: string | null;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    fromDate: string | null;
    toDate: string | null;
  }>;
  createdAt?: string;
  // Add more fields as needed
}

interface InstructorState {
  profile: InstructorProfile | null;
  instructors: InstructorProfile[];
  quizResults: any[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const getAllInstructors = createAsyncThunk(
  "instructor/getAllInstructors",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${Base_URL}`);
      return response.data.instructors;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch failed"
      );
    }
  }
);

const updateInstructorProfile = createAsyncThunk(
  "instructor/updateProfile",
  async (
    {
      id,
      data,
      isAdminUpdate,
    }: { id: string; data: any; isAdminUpdate?: boolean },
    thunkAPI
  ) => {
    try {
      let toSend: FormData | any = data;
      let config = {};
      // If a file is present, send using FormData
      if (data?.photo instanceof File) {
        const formData = new FormData();
        // Append all other fields
        Object.keys(data).forEach((key) => {
          if (key === "photo" && data[key]) {
            formData.append("photo", data[key]); // file from input
          } else if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] != null) {
            formData.append(key, data[key]);
          }
        });
        toSend = formData;
        config = { headers: { "Content-Type": "multipart/form-data" } };
      }
      // PATCH request
      const response = await axios.patch(`${Base_URL}/${id}`, toSend, config);
      const updatedProfile = response.data.instructor;
      // Update auth slice user as well
      if (!isAdminUpdate) {
        const token = (thunkAPI.getState() as RootState).auth.token;
        thunkAPI.dispatch(setUser({ user: updatedProfile, token }));
      }
      return updatedProfile;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Update failed"
      );
    }
  }
);

// Update: This thunk now updates the instructor 'profile' on fulfilled.
const getInstructorById = createAsyncThunk(
  "instructor/getInstructorById",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.get(`${Base_URL}/${id}`);
      return response.data.instructor || response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch failed"
      );
    }
  }
);

// Fetch student quiz results (with optional filtering)
const fetchStudentQuizResults = createAsyncThunk(
  "instructor/fetchStudentQuizResults",
  async (filters: { studentId?: string; courseId?: string }, thunkAPI) => {
    let query = [];
    if (filters.studentId) query.push(`studentId=${filters.studentId}`);
    if (filters.courseId) query.push(`courseId=${filters.courseId}`);
    const finalUrl = `${Base_URL}/student-quiz-results${
      query.length ? "?" + query.join("&") : ""
    }`;
    try {
      const res = await axios.get(finalUrl);
      return res.data.results || [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch results failed"
      );
    }
  }
);

const initialState: InstructorState = {
  profile: null,
  instructors: [],
  quizResults: [],
  loading: false,
  error: null,
  success: false,
};

const instructorSlice = createSlice({
  name: "instructor",
  initialState,
  reducers: {
    clearInstructorState(state) {
      state.success = false;
      state.error = null;
    },
    setInstructor(state, action) {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateInstructorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInstructorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateInstructorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(getAllInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = action.payload;
        state.error = null;
      })
      .addCase(getAllInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // NEW: Update store with instructor profile on getInstructorById
      .addCase(getInstructorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInstructorById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getInstructorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchStudentQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.quizResults = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

  },
});

export const { clearInstructorState, setInstructor } = instructorSlice.actions;
export default instructorSlice.reducer;
export {
  updateInstructorProfile,
  getAllInstructors,
  getInstructorById,
  fetchStudentQuizResults,
};
