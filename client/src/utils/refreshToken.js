// refreshToken.js
import axios from "axios";

const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URI}/user/refreshtoken`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to refresh access token", error);
    throw error;
  }
};

export default refreshAccessToken;
