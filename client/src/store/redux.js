import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./app/appSlice";
import productSlice from "./products/productSlice";
import userSlice from "./users/userSlice";
import orderSlice from "./orders/orderSlice";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const commonConfig = {
  storage,
};

const userConfig = {
  ...commonConfig,
  whitelist: ["isLoggedIn", "token", "current", "currentCart"],
  key: "shop/user",
};

const productConfig = {
  ...commonConfig,
  whitelist: ["dealDaily"],
  key: "shop/deal",
};

const orderConfig = {
  ...commonConfig,
  key: "shop/order", // Define a key for order persistence
};

export const store = configureStore({
  reducer: {
    app: appSlice,
    products: persistReducer(productConfig, productSlice),
    user: persistReducer(userConfig, userSlice),
    orders: persistReducer(orderConfig, orderSlice), // Integrate orderSlice with persistence
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
