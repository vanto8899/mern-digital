import { createSlice } from "@reduxjs/toolkit";
import * as actions from "./asyncActions"; // Ensure that getAllOrders async action is created and imported

export const orderSlice = createSlice({
  name: "order",
  initialState: {
    isLoading: false,
    orders: [],
    order: null,
    message: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.getAllOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(actions.getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(actions.getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.message = "Failed to fetch all orders!";
      })
      // Handle getOrderById
      .addCase(actions.getOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(actions.getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(actions.getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.message = `Failed to fetch order with ID ${action.meta.arg}!`;
      });
  },
});

export default orderSlice.reducer;
