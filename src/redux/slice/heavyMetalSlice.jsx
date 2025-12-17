import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ---- Batch Create XRF Readings ---- //
export const batchAddXRFReadings = createAsyncThunk(
  "heavyMetal/batchAddXRF",
  async ({ sampleId, readings }, { rejectWithValue }) => {
    if (!Array.isArray(readings) || readings.length === 0) {
      return rejectWithValue("No readings provided");
    }

    try {
      const response = await api.post("/heavy-metals/batch/xrf", {
        sampleId,
        readings
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to save heavy metal readings"
      );
    }
  }
);

// ---- Add or Update Single Reading (legacy) ---- //
export const addOrUpdateHeavyMetal = createAsyncThunk(
  "heavyMetal/addOrUpdate",
  async (payloads, { rejectWithValue }) => {
    if (!Array.isArray(payloads) || payloads.length === 0) {
      return rejectWithValue("No payloads provided");
    }

    try {
      const results = [];

      for (const payload of payloads) {
        const response = await api.post("/heavy-metals", payload);
        results.push(response.data);
      }
      console.log(results);
      return results;
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
      // Batch Add XRF
      .addCase(batchAddXRFReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchAddXRFReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || "Readings saved!";
        // Add all returned readings
        if (action.payload.data && Array.isArray(action.payload.data)) {
          action.payload.data.forEach(reading => {
            const index = state.readings.findIndex(
              (r) =>
                r.sampleId === reading.sampleId &&
                r.heavyMetal === reading.heavyMetal
            );
            if (index !== -1) {
              state.readings[index] = reading;
            } else {
              state.readings.push(reading);
            }
          });
        }
      })
      .addCase(batchAddXRFReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save readings";
      })

      // Add/Update (legacy)
      .addCase(addOrUpdateHeavyMetal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addOrUpdateHeavyMetal.fulfilled, (state, action) => {
        state.loading = false;
        // array of responses
        state.successMessage = action.payload[0].message || "Reading saved!";
        action.payload.map((payload) => {
          const index = state.readings.findIndex(
            (r) =>
              r.sampleId === payload.data.sampleId &&
              r.heavyMetal === payload.data.heavyMetal
          );

          if (index !== -1) {
            state.readings[index] = payload.data;
          } else {
            state.readings.push(payload.data);
          }
        });
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
