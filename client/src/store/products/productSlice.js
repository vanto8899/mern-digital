import { createSlice } from "@reduxjs/toolkit";
import { getnewProducts } from "../products/asyncActions";

export const productSlice = createSlice({
  name: "product",
  initialState: {
    newProducts: null,
    errorMessage: "",
    dealDaily: null,
  },
  reducers: {
    getDealDaily: (state, action) => {
      state.dealDaily = action.payload;
    },
  },
  // Code logic xử lý async action
  extraReducers: (builder) => {
    // Bắt đầu thực hiện action login (Promise pending)
    builder.addCase(getnewProducts.pending, (state) => {
      //   Bật trạng thái loading
      state.isLoading = true;
    });

    // Khi thực hiện action login thành công (Promise fulfilled)
    builder.addCase(getnewProducts.fulfilled, (state, action) => {
      // Tắt trạng thái loading, lưu thông tin user vào store
      // console.log(action);
      state.isLoading = false;
      state.newProducts = action.payload;
    });

    // Khi thực hiện action login thất bại (Promise rejected)
    builder.addCase(getnewProducts.rejected, (state, action) => {
      // Tắt trạng thái loading, lưu thông báo lỗi vào store
      state.isLoading = false;
      state.errorMessage = action.payload.message;
    });
  },
});
export const { getDealDaily } = productSlice.actions;
export default productSlice.reducer;
