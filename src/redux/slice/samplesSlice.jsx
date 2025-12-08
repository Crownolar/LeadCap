import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_BASE_URL = "/api";
const API_BASE_URL = "https://194-146-38-237.cloud-xip.com/api/";

export const api = axios.create({ baseURL: API_BASE_URL });
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
        marketName: formData.marketName,
        vendorType: formData.vendorType,
        productType: formData.productType,
        productName: formData.productName,
        price: parseFloat(formData.price),
        batchNumber: formData.batchNumber || "",
        brandName: formData.brandName || "",
        gpsLatitude: formData.gpsLatitude
          ? parseFloat(formData.gpsLatitude)
          : null,
        gpsLongitude: formData.gpsLongitude
          ? parseFloat(formData.gpsLongitude)
          : null,
        isRegistered: formData.isRegistered,
        leadLevelPpm: formData.leadLevelPpm || 0,
        // productPhotoUrl: formData.productPhoto || "",
        // vendorPhotoUrl: formData.vendorPhoto || "",
      };

      // if (formData.productPhoto)
      //   payload.productPhotoUrl = formData.productPhoto;
      // if (formData.vendorPhoto) payload.vendorPhotoUrl = formData.vendorPhoto;
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
