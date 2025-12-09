// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// const API_BASE_URL = "/api";

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const handleLogin = createAsyncThunk(
//   "auth/login",
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/auth/login`, {
//         email,
//         password,
//       });

//       if (res.data?.success && res.data?.data) {
//         const { user, tokens } = res.data.data;
//         localStorage.setItem("accessToken", tokens.accessToken);
//         localStorage.setItem("refreshToken", tokens.refreshToken);
//         localStorage.setItem("user", JSON.stringify(user));
//         return { user };
//       } else {
//         return rejectWithValue(res.data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Login failed. Try again."
//       );
//     }
//   }
// );

// export const handleSignup = createAsyncThunk(
//   "auth/signup",
//   async (authForm, { rejectWithValue }) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/auth/register`, {
//         email: authForm.email,
//         fullName: authForm.name,
//         password: authForm.password,
//         inviteCode: authForm.inviteCode,
//       });

//       if (res.data?.success) {
//         return { message: res.data.message || "Signup successful!" };
//       } else {
//         return rejectWithValue(res.data.message || "Signup failed");
//       }
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Signup failed. Try again."
//       );
//     }
//   }
// );

// export const handleLogout = createAsyncThunk("auth/logout", async () => {
//   try {
//     const refreshToken = localStorage.getItem("refreshToken");
//     const token = localStorage.getItem("accessToken");

//     if (refreshToken && token) {
//       await axios.post(
//         `${API_BASE_URL}/auth/logout`,
//         { refreshToken },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     }
//   } catch (err) {
//     console.error("Logout error:", err.response?.data || err.message);
//   } finally {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("user");
//   }
// });

// const savedUser = localStorage.getItem("user");

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     isAuthenticated: !!savedUser,
//     currentUser: savedUser ? JSON.parse(savedUser) : null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(handleLogin.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(handleLogin.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.currentUser = action.payload.user;
//       })
//       .addCase(handleLogin.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(handleSignup.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(handleSignup.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(handleSignup.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(handleLogout.fulfilled, (state) => {
//         state.isAuthenticated = false;
//         state.currentUser = null;
//       });
//   },
// });

// export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "/api";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token for all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
