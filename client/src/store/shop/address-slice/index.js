import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isLoading: false,
  addressList: [],
  error: null, // to track error if needed
};

export const addNewAddress = createAsyncThunk(
  "addresses/addNewAddress",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/shop/address/add`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add address");
    }
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "addresses/fetchAllAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shop/address/get/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
    }
  }
);

export const editaAddress = createAsyncThunk(
  "addresses/editaAddress",
  async ({ userId, addressId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/shop/address/update/${userId}/${addressId}`,
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit address");
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "addresses/deleteAddress",
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/shop/address/delete/${userId}/${addressId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add New Address
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch All Addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.addressList = [];
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;
