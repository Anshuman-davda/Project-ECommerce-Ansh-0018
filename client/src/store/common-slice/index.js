import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isLoading: false,
  featureImageList: [],
  error: null, // To store error messages
};

export const getFeatureImages = createAsyncThunk(
  "common/getFeatureImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/common/feature/get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching images");
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "common/addFeatureImage",
  async (image, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/common/feature/add`, { image });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error adding image");
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state, action) => {
        state.isLoading = false;
        state.featureImageList = [];
        state.error = action.payload; // Save error message
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList.push(action.payload.data); // Assuming the API returns the newly added image
      })
      .addCase(addFeatureImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Save error message
      });
  },
});

export default commonSlice.reducer;
