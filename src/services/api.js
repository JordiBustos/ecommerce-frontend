import axios from "axios";
import { getApiUrl } from "../config";
import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  clearTokens,
} from "../utils/secureStorage";
import { isTokenExpired, sanitizeObject } from "../utils/security";
import { parseAPIError } from "../utils/security";

// Global error notification handler
let notificationHandler = null;

/**
 * Set global notification handler for error alerts
 * @param {Function} handler - Snackbar enqueue function
 */
export const setNotificationHandler = (handler) => {
  notificationHandler = handler;
};

/**
 * Create axios instance with default configuration
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  },
});

/**
 * Request interceptor to add auth token and security headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      if (isTokenExpired(token)) {
        console.warn("Access token expired, attempting refresh...");
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Sanitize request data (but not FormData or File objects)
    if (
      config.data &&
      typeof config.data === "object" &&
      !(config.data instanceof FormData) &&
      !(config.data instanceof File) &&
      !(config.data instanceof Blob)
    ) {
      const sanitized = sanitizeObject(config.data);

      if (
        config.method === "post" ||
        config.method === "put" ||
        config.method === "patch"
      ) {
        config.data = JSON.stringify(sanitized);
        config.headers["Content-Type"] = "application/json";
      } else {
        config.data = sanitized;
      }
    }

    // Add request timestamp for replay attack prevention
    config.headers["X-Request-Timestamp"] = Date.now().toString();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh and security
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      if (notificationHandler) {
        notificationHandler("Something went wrong", { variant: "error" });
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 400) {
      const message = error.response.data.detail || "Bad request.";
      if (notificationHandler) {
        notificationHandler(message, { variant: "error" });
      }
    }

    // Handle 401 Unauthorized - Token refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } =
            response.data;

          storeTokens(access_token, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearTokens();
          if (window.location.pathname !== "/login" && notificationHandler) {
            notificationHandler("Session expired. Please log in again.", {
              variant: "warning",
            });
          }
          if (window.location.pathname !== "/login") {
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        
        if (window.location.pathname !== "/login" && notificationHandler) {
          notificationHandler("Please log in to continue.", {
            variant: "info",
          });
        }

        if (window.location.pathname !== "/login") {
           setTimeout(() => {
             window.location.href = "/login";
           }, 1000);
        }
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const message = parseAPIError(
        error,
        "Access denied. You do not have permission to perform this action."
      );
      if (notificationHandler) {
        notificationHandler(message, { variant: "error" });
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      const message = parseAPIError(error, "Resource not found.");
      if (notificationHandler) {
        notificationHandler(message, { variant: "warning" });
      }
    }

    // Handle 422 Validation Errors
    if (status === 422) {
      const message = parseAPIError(error, "Invalid data provided.");
      if (notificationHandler) {
        notificationHandler(message, { variant: "error" });
      }
    }

    // Handle 429 Rate Limiting
    if (status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const message = retryAfter
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : "Too many requests. Please slow down and try again later.";
      if (notificationHandler) {
        notificationHandler(message, { variant: "warning" });
      }
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      const message = "Server error. Please try again later.";
      if (notificationHandler) {
        notificationHandler(message, { variant: "error" });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;