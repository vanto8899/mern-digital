import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from "../../apis";

export const getAllOrders = createAsyncThunk(
  "order/allOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apis.apiGetAllOrdersNoLimit();
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response.orders;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Define getOrderById async action
export const getOrderById = createAsyncThunk(
  "order/orderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apis.apiGetOrderById(orderId);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response.order;
    } catch (error) {
      console.error(`Error fetching order with ID ${orderId}:`, error);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);
