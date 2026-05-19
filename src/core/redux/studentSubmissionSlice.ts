import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface StudentSubmission {
  _id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  assignmentsID: string;
  assignmentDate: string;
  assignment: string;
  isSubmitted: boolean;
}

interface SubmissionState {
  submissions: StudentSubmission[];
  loading: boolean;
  error: string | null;
  selectedSubmission: StudentSubmission | null;
  markSubmittedLoading?: boolean;
  markSubmittedError?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = API_URL + "/api/assignments";
const Base_URL_STUDENT = `${API_URL}/api/students`;

const fetchStudentSubmissions = createAsyncThunk(
  "studentSubmission/fetchAll",
  async (params: { studentId?: string; courseId?: string } = {}, thunkAPI) => {
    const q = [];
    if (params.studentId) q.push(`studentId=${params.studentId}`);
    if (params.courseId) q.push(`courseId=${params.courseId}`);
    const query = q.length ? "?" + q.join("&") : "";
    try {
      const res = await axios.get(`${Base_URL}/submitted-assignments${query}`);
      //   return Array.isArray(res.data) ? res.data : res.data.submissions;
      return res.data.assignments;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch failed"
      );
    }
  }
);

const markSubmissionChecked = createAsyncThunk(
  "studentSubmission/markSubmissionChecked",
  async (
    {
      studentId,
      courseId,
      assignmentsID, // use assignmentsID from your data
    }: {
      studentId: string;
      courseId: string;
      assignmentsID: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(
        `${Base_URL_STUDENT}/${studentId}/course/${courseId}/assignment/${assignmentsID}/mark-submitted`
      );
      return { ...res.data.assignment, studentId, courseId, assignmentsID };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to mark as checked"
      );
    }
  }
);

const initialState: SubmissionState = {
  submissions: [],
  loading: false,
  error: null,
  selectedSubmission: null,
  markSubmittedLoading: false,
  markSubmittedError: null,
};

const studentSubmissionSlice = createSlice({
  name: "studentSubmission",
  initialState,
  reducers: {
    setSelectedSubmission(state, action) {
      state.selectedSubmission = action.payload;
    },
    clearSelectedSubmission(state) {
      state.selectedSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentSubmissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.submissions = payload;
      })
      .addCase(fetchStudentSubmissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(markSubmissionChecked.pending, (state) => {
        state.markSubmittedLoading = true;
        state.markSubmittedError = null;
      })
      .addCase(markSubmissionChecked.fulfilled, (state, { payload }) => {
        state.markSubmittedLoading = false;
        if (
          state.selectedSubmission &&
          state.selectedSubmission._id === payload._id
        ) {
          state.selectedSubmission = {
            ...state.selectedSubmission,
            ...payload,
            isSubmitted: true,
          };
        }
      })
      .addCase(markSubmissionChecked.rejected, (state, { payload }) => {
        state.markSubmittedLoading = false;
        state.markSubmittedError = payload as string;
      });
  },
});
export const { setSelectedSubmission, clearSelectedSubmission } =
  studentSubmissionSlice.actions;
export default studentSubmissionSlice.reducer;
export { fetchStudentSubmissions, markSubmissionChecked };
