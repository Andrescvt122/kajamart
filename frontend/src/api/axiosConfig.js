// src/api/axiosConfig.js
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api",
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
