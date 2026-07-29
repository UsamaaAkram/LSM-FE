import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const Base_URL = API_URL + '/api/auth';
const Base_URL = API_URL + "/api";

export interface IUser {
  _id: string;
  name: string;
  userName: string;
  email?: string;
  role: string;
  photo?: string;
}

interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunk for registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    {
      userName,
      email,
      password,
      role,
    }: { userName: string; email: string; password: string; role: string },
    thunkAPI
  ) => {
    try {
      // const response = await axios.post(`${Base_URL}/auth/register`, {
      const response = await axios.post(
        `${Base_URL}/${
          role === "student" ? "students/signup" : "instructor/signup"
        }`,
        {
          userName,
          email,
          password,
          role,
        }
      );
      return response.data; // Expect {user, token} or just user
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    {
      email,
      password,
      removeSessionId,
    }: { email: string; password: string; removeSessionId?: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(`${Base_URL}/auth/login`, {
        email,
        password,
        removeSessionId,
      });
      return response.data; // Expect {user, token}
    } catch (error: any) {
      // Return the full error payload so callers can detect needsVerification
      // / limitReached (2-device cap hit — payload includes `sessions`)
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

// Logout — clears the server-side session token, then local state
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI: any) => {
    try {
      const token = thunkAPI.getState()?.auth?.token;
      await axios.post(
        `${Base_URL}/auth/logout`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
    } catch {
      // Ignore network/server errors — we still clear the session locally.
    }
    return true;
  }
);

// Verify email with OTP
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${Base_URL}/students/verify-email`, {
        email,
        otp,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Verification failed"
      );
    }
  }
);

// Resend verification OTP
export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${Base_URL}/students/resend-verification`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Could not resend code"
      );
    }
  }
);

// Forgot password — request a reset code
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${Base_URL}/students/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Could not send reset code"
      );
    }
  }
);

// Reset password — verify code + set new password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      email,
      otp,
      newPassword,
    }: { email: string; otp: string; newPassword: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(
        `${Base_URL}/students/reset-password`,
        { email, otp, newPassword }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Could not reset password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          (action.payload as string) ||
          "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
