import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { buildSamplePayload } from "../../utils/formHelpers";

// Universal Error Extractor
const extractErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error || error?.response?.data?.message || fallback
  );
};

// ===== FETCH OPERATIONS =====

// Fetch States
export const fetchStates = createAsyncThunk(
  "samples/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/samples/states/all");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch states")
      );
    }
  }
);

// Fetch LGAs
export const fetchLGAs = createAsyncThunk(
  "samples/fetchLGAs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/samples/lgas/all");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Failed to fetch LGAs"));
    }
  }
);

// Fetch Markets
export const fetchMarkets = createAsyncThunk(
  "samples/fetchMarkets",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/samples/markets/all");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch markets")
      );
    }
  }
);

// Fetch Calibration Curves
export const fetchCalibrations = createAsyncThunk(
  "samples/fetchCalibrations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/calibrations");
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch calibration curves")
      );
    }
  }
);

// Fetch Samples with Filters
export const fetchSamples = createAsyncThunk(
  "samples/fetchSamples",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/samples", {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          stateId: filters.stateId || undefined,
          lgaId: filters.lgaId || undefined,
          sampleType: filters.sampleType || undefined,
          vendorType: filters.vendorType || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        },
      });

      return {
        items: response.data.data,
        pagination: response.data.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch samples")
      );
    }
  }
);

export const createSample = createAsyncThunk(
  "samples/createSample",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/samples", payload);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to create sample")
      );
    }
  }
);

// ===== SLICE =====

const initialState = {
  samples: [],
  pagination: null,
  states: [],
  lgas: [],
  markets: [],
  calibrations: [],
  loading: false,
  error: null,
  hasFetched: false,
};

const samplesSlice = createSlice({
  name: "samples",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH SAMPLES
      .addCase(fetchSamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        state.loading = false;
        state.samples = action.payload.items;
        state.pagination = action.payload.pagination;
        state.hasFetched = true;
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE SAMPLE
      .addCase(createSample.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSample.fulfilled, (state, action) => {
        state.loading = false;
        state.samples.unshift(action.payload);
      })
      .addCase(createSample.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH STATES
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH LGAs
      .addCase(fetchLGAs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLGAs.fulfilled, (state, action) => {
        state.loading = false;
        state.lgas = action.payload;
      })
      .addCase(fetchLGAs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH MARKETS
      .addCase(fetchMarkets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarkets.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = action.payload;
      })
      .addCase(fetchMarkets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH CALIBRATIONS
      .addCase(fetchCalibrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalibrations.fulfilled, (state, action) => {
        state.loading = false;
        state.calibrations = action.payload;
      })
      .addCase(fetchCalibrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // .addCase(handleLogout, () => initialState);
  },
});

export default samplesSlice.reducer;
