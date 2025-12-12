import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ---- Add or Update Reading ---- //
export const addOrUpdateHeavyMetal = createAsyncThunk(
  "heavyMetal/addOrUpdate",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/heavy-metals", payload);
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
  async (sampleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/heavy-metals/sample/${sampleId}`);
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
