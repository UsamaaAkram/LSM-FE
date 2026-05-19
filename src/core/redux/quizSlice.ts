import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Interfaces
export interface Quiz {
  _id?: string;
  courseID: string;
  title: string;
  totalMarks: number;
  passMark: number;
  duration: string;
  questions: any[];
  // Add other fields as needed!
}

interface QuizState {
  quizzes: Quiz[];
  quiz: Quiz | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = API_URL + "/api/quizzes";

// Get all quizzes
const fetchQuizzes = createAsyncThunk("quiz/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.error || "Fetch failed."
    );
  }
});

// Search by title
const searchQuizzes = createAsyncThunk(
  "quiz/search",
  async (params: { search?: string }, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_BASE}?${query}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Search failed."
      );
    }
  }
);

// Get by ID
const fetchQuizById = createAsyncThunk(
  "quiz/getById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Get By ID failed."
      );
    }
  }
);

// Add new quiz
const createQuiz = createAsyncThunk(
  "quiz/create",
  async (data: Quiz, thunkAPI) => {
    try {
      const res = await axios.post(API_BASE, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create failed."
      );
    }
  }
);

// Edit quiz
const updateQuiz = createAsyncThunk(
  "quiz/update",
  async ({ id, data }: { id: string; data: Quiz }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update failed."
      );
    }
  }
);

// Delete quiz
const deleteQuiz = createAsyncThunk(
  "quiz/delete",
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

// GET all quizzes for a student's enrolled courses
const fetchStudentQuizzes = createAsyncThunk(
  "quiz/fetchStudentQuizzes",
  async (studentId: string, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/students/${studentId}/quizzes`
      );
      // Your API returns { quizzes }
      return Array.isArray(res.data) ? res.data : res.data.quizzes || [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch student quizzes failed"
      );
    }
  }
);

// Get by ID (for student quiz attempt)
const fetchQuizForStudent = createAsyncThunk(
  "quiz/getByIdForStudent",
  async (id: string, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}/for-student`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Get By ID failed."
      );
    }
  }
);

const initialState: QuizState = {
  quizzes: [],
  quiz: null,
  loading: false,
  error: null,
  success: false,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    clearQuizState(state) {
      state.success = false;
      state.error = null;
      state.quiz = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = Array.isArray(payload) ? payload : payload.quizzes;
        state.error = null;
      })
      .addCase(fetchQuizzes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(searchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchQuizzes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = Array.isArray(payload) ? payload : payload.quizzes;
        state.error = null;
      })
      .addCase(searchQuizzes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quiz = payload;
        state.error = null;
      })
      .addCase(fetchQuizById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(fetchQuizForStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizForStudent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quiz = payload;
        state.error = null;
      })
      .addCase(fetchQuizForStudent.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createQuiz.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes.push(payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createQuiz.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })

      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateQuiz.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = state.quizzes.map((q) =>
          q._id === payload._id ? payload : q
        );
        state.success = true;
        state.error = null;
      })
      .addCase(updateQuiz.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })

      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteQuiz.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter((q) => q._id !== payload);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteQuiz.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
        state.success = false;
      })
      .addCase(fetchStudentQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentQuizzes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.quizzes = payload;
        state.error = null;
      })
      .addCase(fetchStudentQuizzes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { clearQuizState } = quizSlice.actions;
export default quizSlice.reducer;
export {
  fetchQuizzes,
  searchQuizzes,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchStudentQuizzes,
  fetchQuizForStudent,
};
