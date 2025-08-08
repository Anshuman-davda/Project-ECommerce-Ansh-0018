import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Use environment variable for API base URL
const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isLoading: false,
  productList: [],
  error: null, // to store error messages if any
};

export const addNewProduct = createAsyncThunk(
  "adminProducts/addNewProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post(
        `${API_URL}/api/admin/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add product");
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "adminProducts/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(`${API_URL}/api/admin/products/get`);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const editProduct = createAsyncThunk(
  "adminProducts/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(
        `${API_URL}/api/admin/products/edit/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(`${API_URL}/api/admin/products/delete/${id}`);
      return result?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload;
      });

    // You can also handle the other thunks (add, edit, delete) if needed similarly
  },
});

export default AdminProductsSlice.reducer;
