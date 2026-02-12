// src/api/axiosConfig.js
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:3000/kajamart/api",
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("kajamart_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
