import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from "../../apis";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apis.apiGetCurrent();
      if (!response.success) return rejectWithValue(response);
      //console.log(response); // Debugging purpose
      return response.res;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error);
    }
  }
);
