import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({ baseURL: API_BASE_URL });

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ------------------------------
// 🔥 Universal Error Extractor
// ------------------------------
const extractErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error || error?.response?.data?.message || fallback
  );
};

// ------------------------------
// Fetch States
// ------------------------------
export const fetchStates = createAsyncThunk(
  "samples/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/states");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch states")
      );
    }
  }
);

// ------------------------------
// Fetch Markets
// ------------------------------
export const fetchMarkets = createAsyncThunk(
  "samples/fetchMarkets",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/markets");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        extractErrorMessage(err, "Failed to fetch markets")
      );
    }
  }
);

// ------------------------------
// Fetch Samples w/ Filters
// ------------------------------
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
          productType: filters.productType || undefined,
          vendorType: filters.vendorType || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        },
      });

      return {
        items: response.data.data.items || response.data.data,
        pagination: response.data.data.pagination || null,
      };
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        extractErrorMessage(error, "Failed to fetch samples")
      );
    }
  }
);

// ------------------------------
// Create Sample
// ------------------------------
export const createSample = createAsyncThunk(
  "samples/createSample",
  async (formData, { rejectWithValue }) => {
    try {
      const payload = formData.isRegistered
        ? {
            stateId: formData.stateId,
            lgaId: formData.lgaId,
            marketId: formData.marketId,
            vendorType: formData.vendorType,
            productName: formData.productName,
            productType: formData.productType,
            price: parseFloat(formData.price),
            brandName: formData.brandName,
            batchNumber: formData.batchNumber,
            isRegistered: true,
            sonNumber: formData.sonNumber,
          }
        : {
            stateId: formData.stateId,
            lgaId: formData.lgaId,
            marketId: formData.marketId,
            vendorType: formData.vendorType,
            productName: formData.productName,
            productType: formData.productType,
            price: parseFloat(formData.price),
            brandName: formData.brandName || "",
            batchNumber: formData.batchNumber || "",
            gpsLatitude: formData.gpsLatitude
              ? parseFloat(formData.gpsLatitude)
              : null,
            gpsLongitude: formData.gpsLongitude
              ? parseFloat(formData.gpsLongitude)
              : null,
            isRegistered: false,
            vendorTypeOther:
              formData.vendorType === "OTHER"
                ? formData.vendorTypeOther
                : undefined,
            productPhotoUrl: formData.productPhoto || "",
          };

      const response = await api.post("/samples", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Failed to create sample")
      );
    }
  }
);

// ------------------------------
// Slice
// ------------------------------
const initialState = {
  samples: [],
  pagination: null,
  states: [],
  markets: [],
  loading: false,
  error: null,
};

const samplesSlice = createSlice({
  name: "samples",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Samples
      .addCase(fetchSamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        state.loading = false;
        state.samples = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Sample
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

      // Fetch States
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

      // Fetch Markets
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
      });
  },
});

export default samplesSlice.reducer;
