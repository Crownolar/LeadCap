import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchSamples = createAsyncThunk(
  "samples/fetchSamples",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/samples");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch samples"
      );
    }
  }
);

export const createSample = createAsyncThunk(
  "samples/createSample",
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        stateId: formData.stateId,
        lgaId: formData.lgaId,
        marketId: formData.marketId,
        vendorType: formData.vendorType,
        vendorTypeOther: formData.vendorTypeOther || null,
        productType: formData.productType,
        productName: formData.productName,
        price: parseFloat(formData.price),
        batchNumber: formData.batchNumber || null,
        brandName: formData.brandName || null,
        gpsLatitude: formData.gpsLatitude
          ? parseFloat(formData.gpsLatitude)
          : null,
        gpsLongitude: formData.gpsLongitude
          ? parseFloat(formData.gpsLongitude)
          : null,
        isRegistered: formData.isRegistered,
        productOrigin: formData.productOrigin || "LOCAL",
        navdacNumber: formData.navdacNumber || null,
        sonNumber: formData.sonNumber || null,
        productPhotoUrl: formData.productPhotoUrl || null,
      };

      console.log("Payload being sent:", payload);
      const response = await api.post("/samples", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create sample"
      );
    }
  }
);

const initialState = {
  samples: [],
  loading: false,
  error: null,
};

const samplesSlice = createSlice({
  name: "samples",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        state.loading = false;
        state.samples = action.payload;
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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
      });
  },
});

export default samplesSlice.reducer;
