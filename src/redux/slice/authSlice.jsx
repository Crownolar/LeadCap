import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

const clearSessionStorage = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
};

const readSavedUser = () => {
  const savedUser = sessionStorage.getItem("user");
  if (!savedUser || savedUser === "undefined" || savedUser === "null") return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    clearSessionStorage();
    return null;
  }
};

// --- LOGIN ---
export const handleLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data?.success && res.data?.data) {
        const { user, tokens } = res.data.data;

        if (!tokens?.accessToken || !tokens?.refreshToken || !user) {
          return rejectWithValue("Login response is incomplete. Please try again.");
        }

        clearSessionStorage();
        sessionStorage.setItem("accessToken", tokens.accessToken);
        sessionStorage.setItem("refreshToken", tokens.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(user));

        return { user };
      }

      return rejectWithValue(
        res.data?.message || "Login failed. Please try again.",
      );
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Network error. Please check your connection.");
      }

      const backendMessage =
        err.response?.data?.message || err.response?.data?.error || null;

      if (backendMessage) return rejectWithValue(backendMessage);

      switch (err.response.status) {
        case 400:
          return rejectWithValue("Invalid request.");
        case 401:
          return rejectWithValue("Authentication failed.");
        case 403:
          return rejectWithValue("You are not authorized.");
        case 404:
          return rejectWithValue("User not found.");
        default:
          return rejectWithValue("Something went wrong. Please try again.");
      }
    }
  },
);

// --- SIGNUP ---
export const handleSignup = createAsyncThunk(
  "auth/signup",
  async (authForm, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", {
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
      if (!err.response) {
        return rejectWithValue("Network error. Please check your connection.");
      }

      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Signup failed. Please try again.",
      );
    }
  },
);

// Explicit local logout. The API interceptor uses this reducer when a refresh
// token can no longer establish a valid session, avoiding a logout -> 401 loop.
export const clearAuth = createAsyncThunk("auth/clearAuth", async () => {
  clearSessionStorage();
});

// --- LOGOUT ---
export const handleLogout = createAsyncThunk("auth/logout", async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");
  const token = sessionStorage.getItem("accessToken");

  try {
    if (refreshToken && token) {
      await api.post(
        "/auth/logout",
        { refreshToken },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    }
  } catch (err) {
    // Logout is best-effort. The local session must still be destroyed.
    console.warn("Logout request failed; clearing local session.", err.response?.status);
  } finally {
    clearSessionStorage();
  }
});

const savedUser = readSavedUser();
const hasSession = Boolean(
  savedUser &&
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("refreshToken"),
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: hasSession,
    currentUser: hasSession ? savedUser : null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthState: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
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
        state.error = null;
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })
      .addCase(handleSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleSignup.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(handleSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed.";
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(clearAuth.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
