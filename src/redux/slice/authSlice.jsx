import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// --- LOGIN ---
export const handleLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/auth/login`, { email, password });

      if (res.data?.success && res.data?.data) {
        const { user, tokens } = res.data.data;

        sessionStorage.setItem("accessToken", tokens.accessToken);
        sessionStorage.setItem("refreshToken", tokens.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));

        return { user };
      }

      return rejectWithValue(res.data?.message || "Invalid credentials");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Try again."
      );
    }
  }
);

// --- SIGNUP ---
export const handleSignup = createAsyncThunk(
  "auth/signup",
  async (authForm, { rejectWithValue }) => {
    try {
      const res = await api.post(`/auth/register`, {
        email: authForm.email,
        fullName: authForm.name,
        password: authForm.password,
        inviteCode: authForm.inviteCode,
      });

      if (res.data?.success) {
        return { message: res.data.message || "Signup successful!" };
      }

      return rejectWithValue(res.data?.message || "Signup failed");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Signup failed. Try again."
      );
    }
  }
);

// --- LOGOUT ---
export const handleLogout = createAsyncThunk("auth/logout", async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken");
    const token = sessionStorage.getItem("accessToken");

    if (refreshToken && token) {
      await api.post(
        `/auth/logout`,
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch (err) {
    console.error("Logout error:", err.response?.data || err.message);
  } finally {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
  }
});

// Load user from sessionStorage
const savedUser = sessionStorage.getItem("user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: savedUser && savedUser !== "undefined" ? true : false,
    currentUser: savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(handleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload.user;
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleSignup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(handleSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.currentUser = null;
      });
  },
});

export default authSlice.reducer;
