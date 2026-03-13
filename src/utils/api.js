import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach token (never on login/register/refresh so stale JWT is not sent)
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh-token"];
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isAuthEndpoint = AUTH_PATHS.some((path) => url.includes(path));
    if (!isAuthEndpoint) {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors (lazy import to avoid circular dependency)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      import("../redux/store").then(({ store }) => {
        import("../redux/slice/authSlice").then(({ handleLogout }) => {
          store.dispatch(handleLogout());
        });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
