import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/students`;

export interface Certificate {
  id: number | string;
  courseID: string;
  certificateName: string;
  marks: number;
  outOf: number;
  grade: string;
}

interface CertificatesState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

const initialState: CertificatesState = {
  certificates: [],
  loading: false,
  error: null,
};

export const downloadCertificate = createAsyncThunk<
  { filename: string; data: string },
  { studentId: string; courseId: string }
>(
  "certificates/downloadCertificate",
  async ({ studentId, courseId }, thunkAPI) => {
    try {
      const res = await axios.post(`${Base_URL}/certificate`, { studentId, courseId });
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Download failed"
      );
    }
  }
);

export const fetchStudentCertificates = createAsyncThunk<Certificate[], string>(
  "certificates/fetchStudentCertificates",
  async (studentId, thunkAPI) => {
    try {
      const res = await axios.get(`${Base_URL}/${studentId}/certificates`);
      // API expected to directly respond with an array or {certificates: [...]}
      return Array.isArray(res.data) ? res.data : (res.data.certificates || []);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Failed to fetch certificates"
      );
    }
  }
);

const studentCertificatesSlice = createSlice({
  name: "studentCertificates",
  initialState,
  reducers: {
    clearCertificates(state) {
      state.certificates = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCertificates } = studentCertificatesSlice.actions;
export default studentCertificatesSlice.reducer;