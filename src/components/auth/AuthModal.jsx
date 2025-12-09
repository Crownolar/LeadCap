import React, { useState } from "react";
import { AlertTriangle, Eye, EyeOff, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { handleLogin, handleSignup } from "../../redux/slice/authSlice";

const AuthModal = ({ theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, currentUser, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    inviteCode: "",
  });
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (authMode === "login") {
      const result = await dispatch(
        handleLogin({ email: authForm.email, password: authForm.password })
      );

      if (handleLogin.fulfilled.match(result)) {
        const { fullName, role } = result.payload.user;
        setMessage(`Welcome back, ${fullName || "User"}!`);

        const normalizedRole = role?.toLowerCase().replace(/[\s_]/g, "");

        // if (normalizedRole === "datacollector") {
        //   navigate("/data-collector-welcome");
        // } else if (normalizedRole === "policymakerson") {
        //   navigate("/policy-welcome");
        // } else if (normalizedRole === "superadmin") {
        //   navigate("/invitecodes");
        // } else if (normalizedRole === "supervisor") {
        //   navigate("/agents");
        // } else {
        //   navigate("/dashboard");
        // }
        if (normalizedRole === "policymakerson") {
          navigate("/map"); // ONLY MAP PAGE
        } else if (normalizedRole === "supervisor") {
          navigate("/agents");
        } else if (normalizedRole === "datacollector") {
          navigate("/data-collector-welcome");
        } else if (normalizedRole === "superadmin") {
          navigate("/invitecodes");
        } else if (normalizedRole === "headresearcher") {
          navigate("/database");
        } else {
          navigate("/dashboard");
        }
      } else {
        setMessage(result.payload || "Login failed!");
      }
    } else {
      const result = await dispatch(handleSignup(authForm));
      if (handleSignup.fulfilled.match(result)) {
        setMessage(result.payload);
        setAuthMode("login");
      } else {
        setMessage(result.payload);
      }
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center p-4`}
    >
      <div
        className={`${theme.card} rounded-lg shadow-xl max-w-md w-full p-8 border ${theme.border}`}
      >
        <div className="text-center mb-8">
          <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white">LEDAcap</h1>
          <p className={`text-sm ${theme.textMuted}`}>
            Lead Exposure Detection & Capacity Platform
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {["login", "signup"].map((mode) => (
            <button
              key={mode}
              onClick={() => setAuthMode(mode)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                authMode === mode
                  ? "bg-emerald-500 text-white"
                  : `${theme.hover}`
              }`}
            >
              {mode === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <>
              <Input
                label="Full Name"
                value={authForm.name || ""}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
                placeholder="John Doe"
                theme={theme}
              />
              <Input
                label="Invite Code"
                value={authForm.inviteCode || ""}
                onChange={(e) =>
                  setAuthForm({ ...authForm, inviteCode: e.target.value })
                }
                placeholder="Enter invite code"
                theme={theme}
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(e) =>
              setAuthForm({ ...authForm, email: e.target.value })
            }
            placeholder="user@ledacap.ng"
            theme={theme}
          />

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg ${theme.input}`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading
              ? authMode === "login"
                ? "Logging in..."
                : "Signing up..."
              : authMode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-3 text-emerald-400">{message}</p>
        )}
      </div>
    </div>
  );
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  theme,
}) => (
  <div>
    <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-lg ${theme.input}`}
      required
    />
  </div>
);

export default AuthModal;

// Ploicy Maker Son
// policymaker.son@ledacap.ng
// policy123!

// Ploicy Maker Nafdac
//policymaker.son@ledacap.ng

// Head Researcher
// headresearcher@ledacap.ng
// researcher123!

// Data Collector
// datacollector.lagos@ledacap.ng
// collector123!

//Supervisor
// supervisor@ledacap.ng
// supervisor123!
