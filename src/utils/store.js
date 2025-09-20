import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://audio-gen-backend-o6nr.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE_URL}`,
});

api.interceptors.request.use((config) => {
  const currentUser = JSON.parse(localStorage.getItem("current_user")); // ✅ match key
  const token = currentUser?.token || currentUser?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
