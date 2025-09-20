import axios from "axios";

// Adjust this depending on where your backend runs
// Example: "http://127.0.0.1:8000" for local dev
// Or use process.env.REACT_APP_API_BASE_URL in production
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://audio-gen-backend-o6nr.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const token = currentUser?.token || currentUser?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
