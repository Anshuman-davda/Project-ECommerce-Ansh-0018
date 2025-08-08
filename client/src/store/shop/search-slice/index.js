import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isLoading: false,
  searchResults: [],
  error: null,
};

export const getSearchResults = createAsyncThunk(
  "/order/getSearchResults",
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shop/search/${keyword}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload;
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;
