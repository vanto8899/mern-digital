import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from "../../apis";

export const getnewProducts = createAsyncThunk(
  "app/newProducts",
  async (data, { rejectWithValue }) => {
    const response = await apis.apiGetProducts({ sort: "-createdAt" });
    //console.log(response);
    if (!response.success) return rejectWithValue(response);
    return response.products;
  }
);
