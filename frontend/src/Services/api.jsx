import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const baseURL = rawBaseURL.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
});

// Auto attach token for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
