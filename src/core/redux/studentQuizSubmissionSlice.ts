import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { QuizAttempt } from "../common/QuizAttemptReview";

export interface StudentQuizSubmission {
  studentId: string;
  studentName: string;
  courseId: string;
  quizID: string;
  marks: number;
  totalMarks: number;
  percent: number;
  totalAttempts: number;
  lastAttemptDate: string;
  completed: boolean;
  /** #34 — per-attempt answer history, newest attempt first. */
  attempts?: QuizAttempt[];
}

interface QuizSubmissionState {
  submissions: StudentQuizSubmission[];
  loading: boolean;
  error: string | null;
  selectedSubmission: StudentQuizSubmission | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = API_URL + "/api/quizzes";

const fetchStudentQuizSubmissions = createAsyncThunk(
  "studentQuizSubmission/fetchAll",
  async (params: { studentId?: string; courseId?: string } = {}, thunkAPI) => {
    const q = [];
    if (params.studentId) q.push(`studentId=${params.studentId}`);
    if (params.courseId) q.push(`courseId=${params.courseId}`);
    const query = q.length ? "?" + q.join("&") : "";
    try {
      const res = await axios.get(`${Base_URL}/submitted-quizzes${query}`);
      return res.data.quizzes;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch failed"
      );
    }
  }
);

const initialState: QuizSubmissionState = {
  submissions: [],
  loading: false,
  error: null,
  selectedSubmission: null,
};

const studentQuizSubmissionSlice = createSlice({
  name: "studentQuizSubmission",
  initialState,
  reducers: {
    setSelectedQuizSubmission(state, action) {
      state.selectedSubmission = action.payload;
    },
    clearSelectedQuizSubmission(state) {
      state.selectedSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentQuizSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentQuizSubmissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.submissions = payload;
      })
      .addCase(fetchStudentQuizSubmissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      });
  },
});

export const { setSelectedQuizSubmission, clearSelectedQuizSubmission } =
  studentQuizSubmissionSlice.actions;
export { fetchStudentQuizSubmissions };
export default studentQuizSubmissionSlice.reducer;
