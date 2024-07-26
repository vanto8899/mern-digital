import axios from "axios";
import refreshAccessToken from "utils/refreshToken";

// Tạo instance Axios
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URI,
  withCredentials: true,
});

// Thêm interceptor cho request
instance.interceptors.request.use(
  (config) => {
    const localStorageData = window.localStorage.getItem("persist:shop/user");
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      const accessToken = JSON.parse(parsedData?.token);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor cho response
instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const data = await refreshAccessToken();
        const newAccessToken = data.newAccessToken;

        // Cập nhật localStorage với access token mới
        const localStorageData =
          window.localStorage.getItem("persist:shop/user");
        if (localStorageData) {
          const parsedData = JSON.parse(localStorageData);
          parsedData.token = JSON.stringify(newAccessToken);
          window.localStorage.setItem(
            "persist:shop/user",
            JSON.stringify(parsedData)
          );
        }

        // Cập nhật header Authorization với token mới và retry request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
