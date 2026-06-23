import axios from "axios";

// Export the base URL that our Login page needs
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export the error handler utility that our Login page imports
export const getApiErrorMessage = (error, defaultMessage) => {
  if (!error.response) {
    return "Backend server is offline. Please make sure your FastAPI server is running.";
  }
  return error.response?.data?.detail || error.message || defaultMessage;
};

export default api;
