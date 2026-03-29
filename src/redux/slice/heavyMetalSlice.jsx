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
        readings,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to save heavy metal readings",
      );
    }
  },
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
          "Failed to save heavy metal reading",
      );
    }
  },
);

// ---- Fetch readings for one sample ---- //
export const getSampleReadings = createAsyncThunk(
  "heavyMetal/getSampleReadings",
  async (sampleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/heavy-metals/sample/${sampleId}`);
      return { sampleId, readings: response.data.data || [] };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch readings",
      );
    }
  },
);

// ---- Fetch readings for multiple samples ---- //
export const getMultipleSampleReadings = createAsyncThunk(
  "heavyMetal/getMultipleSampleReadings",
  async (sampleIds, { rejectWithValue }) => {
    try {
      const promises = sampleIds.map(async (sampleId) => {
        try {
          const response = await api.get(`/heavy-metals/sample/${sampleId}`);
          return { sampleId, readings: response.data.data || [] };
        } catch (error) {
          // Return empty readings if sample has no readings yet or it fails for any reason
          console.log("error for get multiple sample readings failure", error);
          return { sampleId, readings: [] };
        }
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch multiple sample readings",
      );
    }
  },
);

// ---- SLICE ---- //
const heavyMetalSlice = createSlice({
  name: "heavyMetal",
  initialState: {
    readings: [], // Array of individual readings
    readingsBySample: {}, // Object: { sampleId: [readings] }
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
        // Ensure readingsBySample is initialized
        if (!state.readingsBySample) {
          state.readingsBySample = {};
        }
        // Add all returned readings
        if (action.payload.data && Array.isArray(action.payload.data)) {
          // Update readings array
          action.payload.data.forEach((reading) => {
            const index = state.readings.findIndex(
              (r) =>
                r.sampleId === reading.sampleId &&
                r.heavyMetal === reading.heavyMetal,
            );
            if (index !== -1) {
              state.readings[index] = reading;
            } else {
              state.readings.push(reading);
            }
          });

          // Group readings by sample and update readingsBySample
          const readingsBySampleUpdate = {};
          action.payload.data.forEach((reading) => {
            if (!readingsBySampleUpdate[reading.sampleId]) {
              readingsBySampleUpdate[reading.sampleId] = [];
            }
            readingsBySampleUpdate[reading.sampleId].push(reading);
          });

          // Merge with existing readings for each sample
          Object.keys(readingsBySampleUpdate).forEach((sampleId) => {
            const existingReadings = state.readingsBySample[sampleId] || [];
            const newReadings = readingsBySampleUpdate[sampleId];

            // Combine and deduplicate readings by heavyMetal
            const combinedReadings = [...existingReadings];
            newReadings.forEach((newReading) => {
              const existingIndex = combinedReadings.findIndex(
                (r) => r.heavyMetal === newReading.heavyMetal,
              );
              if (existingIndex !== -1) {
                combinedReadings[existingIndex] = newReading;
              } else {
                combinedReadings.push(newReading);
              }
            });

            state.readingsBySample[sampleId] = combinedReadings;
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
              r.heavyMetal === payload.data.heavyMetal,
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

      // Fetch readings for single sample
      .addCase(getSampleReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSampleReadings.fulfilled, (state, action) => {
        state.loading = false;
        const { sampleId, readings } = action.payload;
        // Ensure readingsBySample is initialized
        if (!state.readingsBySample) {
          state.readingsBySample = {};
        }
        state.readingsBySample[sampleId] = readings;
        // Also add to readings array for backwards compatibility
        state.readings = readings;
      })
      .addCase(getSampleReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch readings";
      })

      // Fetch readings for multiple samples
      .addCase(getMultipleSampleReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMultipleSampleReadings.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure readingsBySample is initialized
        if (!state.readingsBySample) {
          state.readingsBySample = {};
        }
        // action.payload is array of { sampleId, readings }
        action.payload.forEach(({ sampleId, readings }) => {
          state.readingsBySample[sampleId] = readings;
        });
      })
      .addCase(getMultipleSampleReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch multiple readings";
      });
  },
});

export const { clearHeavyMetalState } = heavyMetalSlice.actions;
export default heavyMetalSlice.reducer;
