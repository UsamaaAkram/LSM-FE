import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import { setUser } from "./authSlice";

// ---------- Types (matches new Node.js schema) ----------
export interface Guardian {
  isGuardian?: boolean;
  name?: string;
  relation?: string;
  phone?: string;
  occupation?: string;
  address?: string;
}
export interface Education {
  degree: string;
  institution?: string;
  university?: string;
  fromDate?: string | null;
  toDate?: string | null;
}
export interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  fileUrl?: string;
  courseID?: string;
}
export interface LessonWatched {
  lessonID: string;
  totalTimeWatched?: number;
  completed?: boolean;
  videoTime?: number;
  presentWatch?: number;
}
export interface AssignmentStatus {
  isSubmitted?: boolean;
  assignmentsID: string;
  assignmentDate?: string | null;
  submissionDate?: string | null;
  marksObtained?: number | null;
}
export interface QuizGrade {
  marks?: number;
  totalMarks?: number;
  totalAttempts?: number;
  quizID: string;
  lastAttemptDate?: string;
  completed?: boolean;
}
export interface Progress {
  courseID: string;
  watchedLectures?: number;
  totalLectures?: number;
  assignments?: AssignmentStatus[];
  lessonWatched?: LessonWatched[];
  quizzes?: QuizGrade[];
  grade?: any; // Mixed
  grandTotal?: number;
  percent?: number;
}
export interface StudentInfo {
  firstName: string;
  lastName: string;
  userName?: string;
  password?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  cnic?: string;
  dob?: string;
  age?: number | null;
  bio?: string;
  photo?: string;
  isDisable?: boolean;
  current_logged_in_locations?: string[];
  isDeactivated?: boolean;
}
export interface Administrative {
  batch?: string;
  enrolledBy?: string;
  enrolledBranch?: string;
  enrollmentDate?: string;
  studentType?: string;
  shift?: string;
}

export interface StudentProfile {
  _id?: string;
  student: StudentInfo;
  administrative?: Administrative;
  role: string;
  guardian?: Guardian;
  education?: Education[];
  enrolledCourses?: string[];
  progress?: Progress[];
  certificates?: Certificate[];
  wishlist?: string[];
  messages?: string[];
  tickets?: string[]; // Optionally as ObjectId string array
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupRequest {
  userName: string;
  email: string;
  password: string;
  role: string;
}

// Optionally define your response structure
export interface SignupResponse {
  success: boolean;
  message?: string;
  student?: any; // update to your API spec
}

// ---------- API base ----------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Base_URL = `${API_URL}/api/students`;

// ---------- Async Thunks ----------
const getAllStudents = createAsyncThunk<StudentProfile[], void>(
  "student/getAllStudents",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(Base_URL);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch failed"
      );
    }
  }
);

const getStudentById = createAsyncThunk<StudentProfile, string>(
  "student/getStudentById",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.get(`${Base_URL}/${id}`);
      return response.data || response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch failed"
      );
    }
  }
);

const signupStudent = createAsyncThunk<SignupResponse, SignupRequest>(
  "student/signupStudent",
  async (data, thunkAPI) => {
    try {
      const response = await axios.post(`${Base_URL}/signup`, data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Signup failed"
      );
    }
  }
);

// ADD TO WISHLIST
const addToWishlist = createAsyncThunk<
  string[], // returns new wishlist (array of course IDs)
  { studentId: string; courseId: string }
>("student/addToWishlist", async ({ studentId, courseId }, thunkAPI) => {
  try {
    const res = await axios.post(`${Base_URL}/wishlist/add`, {
      studentId,
      courseId,
    });
    const token = (thunkAPI.getState() as RootState).auth.token;
    const user = (thunkAPI.getState() as RootState).auth.user;
    thunkAPI.dispatch(
      setUser({ user: { ...user, wishlist: res.data.wishlist || [] }, token })
    );
    return res.data.wishlist || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.error || "Add to wishlist failed"
    );
  }
});

// REMOVE FROM WISHLIST
const removeFromWishlist = createAsyncThunk<
  string[],
  { studentId: string; courseId: string }
>("student/removeFromWishlist", async ({ studentId, courseId }, thunkAPI) => {
  try {
    const res = await axios.post(`${Base_URL}/wishlist/remove`, {
      studentId,
      courseId,
    });
    const token = (thunkAPI.getState() as RootState).auth.token;
    const user = (thunkAPI.getState() as RootState).auth.user;
    thunkAPI.dispatch(
      setUser({ user: { ...user, wishlist: res.data.wishlist || [] }, token })
    );
    return res.data.wishlist || [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.error || "Remove from wishlist failed"
    );
  }
});

const getStudentSummary = createAsyncThunk<
  StudentProfile[],
  Record<string, string>
>(
  "student/getStudentSummary",
  async (filters: Record<string, string>, thunkAPI) => {
    try {
      // Build query string from filters
      const query = Object.keys(filters)
        .filter((key) => filters[key]) // skip empty values
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`
        )
        .join("&");
      const url = query
        ? `${Base_URL}/summary?${query}`
        : `${Base_URL}/summary`;
      const response = await axios.get(url);
      return response.data.students || response.data; // adapt this based on your API
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Fetch summary failed"
      );
    }
  }
);

const createStudentProfile = createAsyncThunk<StudentProfile, any>(
  "student/createProfile",
  async (data, thunkAPI) => {
    try {
      let toSend: any = data;
      let config = {};
      if (data?.student?.photo instanceof File) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (typeof data[key] === "object" && data[key] !== null) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] != null) {
            formData.append(key, data[key]);
          }
        });
        toSend = formData;
        config = { headers: { "Content-Type": "multipart/form-data" } };
      }
      const response = await axios.post(Base_URL, toSend, config);
      return response.data.student || response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Create failed"
      );
    }
  }
);

const updateStudentProfile = createAsyncThunk<
  StudentProfile,
  { id: string; data: any; isAdminUpdate?: boolean }
>("student/updateProfile", async ({ id, data, isAdminUpdate }, thunkAPI) => {
  try {
    let toSend: any = data;
    let config = {};

    function appendFormData(formData: FormData, data: any, parentKey = "") {
      for (const key in data) {
        if (data[key] == null) continue;
        const fieldKey = parentKey ? `${parentKey}.${key}` : key;
        if (Array.isArray(data[key])) {
          // For your backend, arrays as JSON (unless the schema supports array fields directly)
          formData.append(fieldKey, JSON.stringify(data[key]));
        } else if (
          typeof data[key] === "object" &&
          !(data[key] instanceof File)
        ) {
          appendFormData(formData, data[key], fieldKey); // Recursively flatten
        } else if (data[key] instanceof File) {
          formData.append("photo", data[key]); // Flat 'photo' field
        } else {
          formData.append(fieldKey, data[key]);
        }
      }
    }

    if (data?.student?.photo instanceof File) {
      const formData = new FormData();
      appendFormData(formData, data);
      toSend = formData;
      config = { headers: { "Content-Type": "multipart/form-data" } };
    }

    const response = await axios.patch(`${Base_URL}/${id}`, toSend, config);
    const updatedProfile = response.data;
    if (!isAdminUpdate) {
      const token = (thunkAPI.getState() as RootState).auth.token;
      thunkAPI.dispatch(setUser({ user: updatedProfile, token }));
    }

    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.error || "Update failed"
    );
  }
});

// SUBMIT STUDENT QUIZ ATTEMPT
const submitStudentQuizAttempt = createAsyncThunk<
  any,
  {
    studentId: string;
    quizID: string;
    answers: { questionID: string; selectedAnswerID: string }[];
  }
>(
  "student/submitQuizAttempt",
  async ({ studentId, quizID, answers }, thunkAPI) => {
    try {
      const res = await axios.post(`${Base_URL}/${studentId}/submit-quiz`, {
        quizID,
        answers,
      });
      return res.data; // { message, result }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Quiz submission failed"
      );
    }
  }
);
const fetchQuizAttemptStatus = createAsyncThunk<
  any, // { quizID, marks, totalMarks, totalAttempts, lastAttemptDate, completed }
  { studentId: string; quizID: string }
>("student/fetchQuizAttemptStatus", async ({ studentId, quizID }, thunkAPI) => {
  try {
    const res = await axios.get(
      `${Base_URL}/${studentId}/quiz/${quizID}/result`
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.error || "Failed to fetch status"
    );
  }
});

const fetchStudentCourseDetail = createAsyncThunk(
  "student/fetchStudentCourseDetail",
  async (
    { studentId, courseId }: { studentId: string; courseId: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.get(
        `${Base_URL}/${studentId}/course/${courseId}`
      );
      return res.data; // Your course object as shown above
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Fetch student course detail failed"
      );
    }
  }
);

// SUBMIT STUDENT ASSIGNMENT
const submitStudentAssignment = createAsyncThunk<
  any,
  {
    studentId: string;
    courseId: string;
    assignmentId: string;
    submissionText?: string;
    // Add more fields as required, e.g. fileUrl, attachments, etc.
  }
>(
  "student/submitStudentAssignment",
  async ({ studentId, courseId, assignmentId, submissionText }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${Base_URL}/${studentId}/course/${courseId}/assignment/${assignmentId}/submit`,
        { assignment: submissionText }
      );
      return res.data; // Example: { message, assignmentStatus }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Assignment submission failed"
      );
    }
  }
);

const fetchPublishedAssignments = createAsyncThunk(
  "student/fetchPublishedAssignments",
  async (studentId: string, thunkAPI) => {
    try {
      const res = await axios.get(
        `${Base_URL}/${studentId}/published-assignments`
      );
      // Expects { assignments: [...] }
      return res.data.assignments || [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to fetch published assignments"
      );
    }
  }
);

// ---------- State ----------
interface StudentState {
  students: StudentProfile[];
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  quizAttemptStatus?: any; // Add this line
  currentCourse: any | null;
  courseLoading: boolean;
  courseError: string | null;
  submitAssignmentLoading?: boolean;
  submitAssignmentError?: string | null;
  submitAssignmentSuccess?: boolean;
  publishedAssignments?: any[];
  publishedAssignmentsLoading?: boolean;
  publishedAssignmentsError?: string | null;
}

const initialState: StudentState = {
  students: [],
  profile: null,
  loading: false,
  error: null,
  success: false,
  quizAttemptStatus: null, // Add this line
  currentCourse: null,
  courseLoading: false,
  courseError: null,
  submitAssignmentLoading: false,
  submitAssignmentError: null,
  submitAssignmentSuccess: false,
  publishedAssignments: [],
  publishedAssignmentsLoading: false,
  publishedAssignmentsError: null,
};

// ---------- Slice ----------
const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearStudentState(state) {
      state.success = false;
      state.error = null;
    },
    setStudentProfile(state, action: PayloadAction<StudentProfile | null>) {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearCurrentCourse(state) {
      state.currentCourse = null;
      state.courseLoading = false;
      state.courseError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL
      .addCase(getAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(getAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // GET ONE
      .addCase(getStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // CREATE
      .addCase(createStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(createStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // UPDATE
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // SUMMARY
      .addCase(getStudentSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
        state.error = null;
      })
      .addCase(getStudentSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SIGNUP
      .addCase(signupStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signupStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = !!action.payload.success;
        state.error = null;
      })
      .addCase(signupStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // ADD TO WISHLIST
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (state.profile) state.profile.wishlist = action.payload;
      })
      // REMOVE FROM WISHLIST
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        if (state.profile) state.profile.wishlist = action.payload;
      })
      .addCase(fetchQuizAttemptStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizAttemptStatus.fulfilled, (state, action) => {
        state.loading = false;
        // You may want to set an extra field like:
        state.quizAttemptStatus = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizAttemptStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentCourseDetail.pending, (state) => {
        state.courseLoading = true;
        state.courseError = null;
      })
      .addCase(fetchStudentCourseDetail.fulfilled, (state, action) => {
        state.courseLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchStudentCourseDetail.rejected, (state, action) => {
        state.courseLoading = false;
        state.courseError = action.payload as string;
        state.currentCourse = null;
      })
      .addCase(submitStudentAssignment.pending, (state) => {
        state.submitAssignmentLoading = true;
        state.submitAssignmentError = null;
        state.submitAssignmentSuccess = false;
      })
      .addCase(submitStudentAssignment.fulfilled, (state) => {
        state.submitAssignmentLoading = false;
        state.submitAssignmentSuccess = true;
      })
      .addCase(submitStudentAssignment.rejected, (state, action) => {
        state.submitAssignmentLoading = false;
        state.submitAssignmentError = action.payload as string;
      })
      .addCase(fetchPublishedAssignments.pending, (state) => {
        state.publishedAssignmentsLoading = true;
        state.publishedAssignmentsError = null;
      })
      .addCase(fetchPublishedAssignments.fulfilled, (state, action) => {
        state.publishedAssignmentsLoading = false;
        state.publishedAssignments = action.payload;
      })
      .addCase(fetchPublishedAssignments.rejected, (state, action) => {
        state.publishedAssignmentsLoading = false;
        state.publishedAssignmentsError = action.payload as string;
      });
  },
});

// ---------- Exports ----------
export const { clearStudentState, setStudentProfile, clearCurrentCourse } =
  studentSlice.actions;
export default studentSlice.reducer;
export {
  createStudentProfile,
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  getStudentSummary,
  signupStudent,
  addToWishlist,
  removeFromWishlist,
  submitStudentQuizAttempt,
  fetchQuizAttemptStatus,
  fetchStudentCourseDetail,
  submitStudentAssignment,
  fetchPublishedAssignments,
};
