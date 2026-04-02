import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach session token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const initialState = {
  users: [],
  selectedUser: null,
  pagination: null,
  loading: false,
  error: null,
};

// --- GET ALL USERS ---
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (params, thunkAPI) => {
    try {
      const response = await api.get("/users", {
        params: {
          page: params?.page,
          limit: params?.limit,
          role: params?.role,
          active: params?.active,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Failed to fetch users",
      );
    }
  },
);

// --- CREATE USER ---
export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Failed to create user",
      );
    }
  },
);

// --- GET USER BY ID ---
export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (userId, thunkAPI) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Failed to fetch user",
      );
    }
  },
);

// --- UPDATE USER ---
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await api.patch(`/users/${id}`, updatedData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.error || "Failed to update user",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload && Array.isArray(action.payload.data)) {
          state.users = action.payload.data.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.isActive ? "active" : "inactive",
            joinedDate: new Date(user.createdAt).toLocaleDateString(),
          }));
        } else {
          state.users = [];
        }

        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;

        const u = action.payload;
        state.users.unshift({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          status: u.isActive ? "active" : "inactive",
          joinedDate: new Date(u.createdAt).toLocaleDateString(),
        });
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        const u = action.payload.data;

        state.selectedUser = {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          status: u.isActive ? "active" : "inactive",
          joinedDate: new Date(u.createdAt).toLocaleDateString(),
          updatedAt: new Date(u.updatedAt).toLocaleDateString(),
          counts: {
            samples: u._count?.samples || 0,
            comments: u._count?.comments || 0,
          },
        };
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const u = action.payload;

        // Update selected user
        if (state.selectedUser?.id === u.id) {
          state.selectedUser = {
            ...state.selectedUser,
            fullName: u.fullName,
            role: u.role,
            status: u.isActive ? "active" : "inactive",
            updatedAt: new Date(u.updatedAt).toLocaleDateString(),
          };
        }

        // Update list
        state.users = state.users.map((user) =>
          user.id === u.id
            ? {
                ...user,
                fullName: u.fullName,
                role: u.role,
                status: u.isActive ? "active" : "inactive",
              }
            : user,
        );
      });
  },
});

export default userSlice.reducer;
