import axios from "axios";
import i18n from "../i18n";

const api = axios.create({
  baseURL: "http://localhost:5149/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error("Network error - please check if backend is running");
      return Promise.reject(
        new Error(i18n.t("errors.network"))
      );
    }

    const status = error.response.status;

    // 401 Unauthorized → logout
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // 403 Forbidden → permission message
    if (status === 403) {
      error.response.data = {
        message: i18n.t("errors.forbidden"),
      };
    }

    // 404 Not Found
    if (status === 404) {
      console.error("API endpoint not found:", error.config?.url);
    }

    // 500+ Server error
    if (status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;