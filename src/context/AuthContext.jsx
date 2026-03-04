import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    inviteCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = "/api";
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      if (res.data?.success) {
        const newAccessToken = res.data.data?.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        console.log("🔄 Token refreshed successfully");
        return newAccessToken;
      } else {
        throw new Error("Refresh failed");
      }
    } catch (err) {
      console.error("❌ Refresh token failed:", err.response?.data || err);
      handleLogout();
      return null;
    }
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      console.log("✅ Login response:", res.data);

      if (res.data?.success && res.data?.data) {
        const { user, tokens } = res.data.data;
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setCurrentUser(user);
        setIsAuthenticated(true);

        setAuthForm({ email: "", password: "" });

        return { success: true, user };
      } else {
        return {
          success: false,
          message: res.data.message || "Invalid credentials.",
        };
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (authForm) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: authForm.email,
        fullName: authForm.name,
        password: authForm.password,
        inviteCode: authForm.inviteCode,
      });

      if (res.data?.success) {
        return {
          success: true,
          message: res.data.message || "Signup successful! You can now login.",
        };
      } else {
        return {
          success: false,
          message: res.data.message || "Signup failed. Try again.",
        };
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Signup failed. Invalid invite code or server error.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInviteCode = async (role) => {
    try {
      const res = await api.post("/auth/generate-invite", { role });
      const code = res.data.data.code;

      await navigator.clipboard.writeText(code);
      alert(`✅ Invite code for ${role} copied to clipboard!`);
    } catch (err) {
      console.error(
        "❌ Failed to generate invite code:",
        err.response?.data || err
      );
      alert("❌ Failed to generate invite code. Check your permissions.");
    }
  };

  const handleLogout = async () => {
    console.log("🔹 Logout clicked");
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const token = localStorage.getItem("accessToken");

      if (refreshToken && token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { refreshToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error(
        "Logout request failed:",
        err.response?.data || err.message
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthForm({ email: "", password: "" });
      navigate("/auth");
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        authForm,
        setAuthForm,
        showPassword,
        setShowPassword,
        authMode,
        setAuthMode,
        handleLogin,
        handleSignup,
        handleGenerateInviteCode,
        handleLogout,
        loading,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
