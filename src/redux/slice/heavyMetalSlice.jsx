import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token from sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("hMetalToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- TOKEN HELPER ---- //
const getAuthToken = (getState) => {
  const tokenFromRedux = getState()?.auth?.token;
  const tokenFromSession = sessionStorage.getItem("hMetalToken");

  console.log(
    "HeavyMetal Slice -> Token from sessionStorage:",
    tokenFromSession
  );

  return tokenFromRedux || tokenFromSession || null;
};

// ---- Add or Update Reading ---- //
export const addOrUpdateHeavyMetal = createAsyncThunk(
  "heavyMetal/addOrUpdate",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState);
      if (!token) throw new Error("Access token required");

      const response = await axios.post("/api/heavy-metals", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to save heavy metal reading"
      );
    }
  }
);

// ---- Fetch readings for one sample ---- //
export const getSampleReadings = createAsyncThunk(
  "heavyMetal/getSampleReadings",
  async (sampleId, { getState, rejectWithValue }) => {
    try {
      const token = getAuthToken(getState);
      if (!token) throw new Error("Access token required");

      const response = await axios.get(`/api/heavy-metals/sample/${sampleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch readings"
      );
    }
  }
);

// ---- SLICE ---- //
const heavyMetalSlice = createSlice({
  name: "heavyMetal",
  initialState: {
    readings: [],
    loading: false,
    error: null,
    successMessage: null,
  },

  reducers: {
    clearHeavyMetalState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Add/Update
      .addCase(addOrUpdateHeavyMetal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addOrUpdateHeavyMetal.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Reading saved!";
        const newReading = action.payload.data;

        const index = state.readings.findIndex(
          (r) =>
            r.sampleId === newReading.sampleId &&
            r.heavyMetal === newReading.heavyMetal
        );

        if (index !== -1) {
          state.readings[index] = newReading;
        } else {
          state.readings.push(newReading);
        }
      })
      .addCase(addOrUpdateHeavyMetal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save reading";
      })

      // Fetch readings
      .addCase(getSampleReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSampleReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.readings = action.payload.data || [];
      })
      .addCase(getSampleReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch readings";
      });
  },
});

export const { clearHeavyMetalState } = heavyMetalSlice.actions;
export default heavyMetalSlice.reducer;
