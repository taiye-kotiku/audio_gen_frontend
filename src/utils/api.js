import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://audio-gen-backend-o6nr.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE_URL}`,
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const currentUser = JSON.parse(localStorage.getItem("current_user")); // ✅ match store.js
  const token = currentUser?.token; // ✅ we only use `.token`
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
