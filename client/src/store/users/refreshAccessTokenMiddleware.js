import axios from "axios";
import { refreshToken } from "./path/to/your/refreshTokenAction";
import { logout } from "./users/userSlice";
import jwt from "jsonwebtoken";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URI,
  withCredentials: true,
});

const refreshAccessTokenMiddleware = (store) => (next) => async (action) => {
  const state = store.getState();
  const token = state.user.token;

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Kiểm tra token hết hạn
    const isTokenExpired = () => {
      try {
        const tokenData = jwt.decode(token);
        return tokenData.exp < Date.now() / 1000;
      } catch (e) {
        return false;
      }
    };

    if (isTokenExpired()) {
      try {
        const response = await store.dispatch(refreshToken());
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.payload.newAccessToken}`;
      } catch (error) {
        store.dispatch(logout());
        return;
      }
    }
  }

  next(action);
};

export default refreshAccessTokenMiddleware;
