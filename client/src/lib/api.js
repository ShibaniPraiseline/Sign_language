import axios from "axios";

// Base URL of your backend. Locally this falls back to localhost:4000.
// Once deployed, set VITE_API_URL in Vercel to your Railway backend URL,
// e.g. https://isl-app-server.up.railway.app/api
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL: API_BASE });

// Automatically attach the JWT token (if we have one) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("isl_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
