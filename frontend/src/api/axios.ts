import axios from "axios";

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

// Get current language and forbidden message
const getForbiddenMessage = (): string => {
  const lang = localStorage.getItem("language") || "en";
  return lang === "pt"
    ? "Você não tem permissão para fazer isso"
    : "You don't have permission to do this";
};

const getNetworkErrorMessage = (): string => {
  const lang = localStorage.getItem("language") || "en";
  return lang === "pt"
    ? "Erro de rede - verifique se o backend está em execução"
    : "Network error - please check if backend is running";
};

// Handle error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error("Network error - please check if backend is running");
      return Promise.reject(new Error(getNetworkErrorMessage()));
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
        message: getForbiddenMessage(),
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