import axios from "axios";

// Export the base URL that our Login page needs
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier can cold-start a sleeping backend in 30-50s. Without
  // a timeout, a failed/blocked request (e.g. CORS, DNS, dead URL) hangs
  // indefinitely and buttons look "stuck" with no feedback. 45s gives cold
  // starts room to finish while still eventually failing visibly.
  timeout: 45000,
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

// Surface *why* a call failed in the console so it's obvious whether it's a
// CORS block, wrong VITE_API_URL, a sleeping/dead backend, or a real 4xx/5xx
// from the API, instead of every failure looking identical from the UI.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        `[api] Request to ${error.config?.url} timed out after ${api.defaults.timeout}ms. ` +
          `The backend at ${API_BASE_URL} may be asleep (Render free tier) or unreachable.`
      );
    } else if (!error.response) {
      console.error(
        `[api] Network error calling ${error.config?.baseURL || API_BASE_URL}${error.config?.url || ""}. ` +
          "This is almost always CORS (backend's FRONTEND_URL doesn't match this site's origin), " +
          "a wrong VITE_API_URL, or the backend being down. Check the Network tab for the failed request.",
        error.message
      );
    } else {
      console.error(
        `[api] ${error.response.status} from ${error.config?.url}:`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

// Export the error handler utility that our Login page imports
export const getApiErrorMessage = (error, defaultMessage) => {
  if (error?.code === "ECONNABORTED") {
    return "The backend took too long to respond. It may be waking up from sleep — please try again in a moment.";
  }
  if (!error.response) {
    return "Backend server is offline. Please make sure your FastAPI server is running.";
  }
  return error.response?.data?.detail || error.message || defaultMessage;
};

export default api;
