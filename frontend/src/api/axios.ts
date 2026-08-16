import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5149/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error - please check if backend is running");
      return Promise.reject(new Error("Network error - please check if backend is running"));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Handle 404 Not Found
    if (error.response.status === 404) {
      console.error("API endpoint not found:", error.config?.url);
    }

    // Handle 500 Internal Server Error
    if (error.response.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;