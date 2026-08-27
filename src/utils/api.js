import axios from "axios";
import { emitAuthLogout } from "./authEvents";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
];

let refreshPromise = null;

const getAccessToken = () => sessionStorage.getItem("accessToken");
const getRefreshToken = () => sessionStorage.getItem("refreshToken");

const clearLocalSession = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // One refresh request services all concurrent 401 responses.
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      )
      .then((res) => {
        const data = res.data?.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (!res.data?.success || !newAccessToken) {
          throw new Error("Refresh response did not contain an access token.");
        }

        sessionStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          sessionStorage.setItem("refreshToken", newRefreshToken);
        }

        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isAuthEndpoint = AUTH_PATHS.some((path) => url.includes(path));

    if (!isAuthEndpoint) {
      const token = getAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      AUTH_PATHS.some((path) => (originalRequest.url || "").includes(path))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        clearLocalSession();
        emitAuthLogout();

        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearLocalSession();
      emitAuthLogout();

      return Promise.reject(refreshError);
    }
  },
);

export default api;
