import { createSlice } from "@reduxjs/toolkit";
import * as actions from "./asyncActions";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false,
    current: null,
    token: null,
    isLoading: false,
    message: "",
    currentCart: [],
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
    },
    logout: (state, action) => {
      state.isLoggedIn = false;
      state.current = null;
      state.isLoading = false;
      state.token = null;
      state.message = "";
    },
    clearMessage: (state) => {
      state.message = "";
    },
    updateCart: (state, action) => {
      const { pid, color, quantity } = action.payload;
      const updatingCart = JSON.parse(JSON.stringify(state.currentCart));
      //console.log(updatingCart);
      const updatedCart = updatingCart.map((el) => {
        if (el.color === color && el.product?._id === pid) {
          return { ...el, quantity };
        } else return el;
      });
      state.currentCart = updatedCart; // Corrected the variable name here
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actions.getCurrent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(actions.getCurrent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
        state.isLoggedIn = true;
        state.currentCart = action.payload.cart;
      })
      .addCase(actions.getCurrent.rejected, (state, action) => {
        state.isLoading = false;
        state.current = null;
        state.isLoggedIn = false;
        state.token = null;
        state.message = "Login session is expired!";
      });
  },
});

export const { login, logout, clearMessage, updateCart } = userSlice.actions;
export default userSlice.reducer;
