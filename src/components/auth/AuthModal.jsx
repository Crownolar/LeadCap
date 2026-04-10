import React, { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleLogin, handleSignup } from "../../redux/slice/authSlice";
import PopupModal from "../modals/PopupModal";
import { useTheme } from "../../context/ThemeContext";

const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    inviteCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [showPopup, setShowPopup] = useState(false);

  const validateFields = () => {
    const errors = {};

    if (!authForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(authForm.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!authForm.password.trim()) {
      errors.password = "Password is required.";
    } else if (authForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBackendFieldErrors = (message) => {
    if (!message) return;

    const lower = message.toLowerCase();

    if (lower.includes("email")) {
      setFieldErrors({ email: message });
    } else if (lower.includes("password")) {
      setFieldErrors({ password: message });
    } else {
      setPopupMessage(message);
      setPopupType("error");
      setShowPopup(true);
    }
  };

  const handleChange = (field, value) => {
    setAuthForm({ ...authForm, [field]: value });

    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const navigateBasedOnRole = (user) => {
    const normalizedRole = user.role?.toLowerCase().replace(/[\s_.-]/g, "");

    if (normalizedRole === "policymakerfmohsw") {
      navigate("/moh/dashboard", { replace: true });
    } else if (
      [
        "policymakerson",
        "policymakerresolve",
        "policymakeruniversity",
      ].includes(normalizedRole)
    ) {
      navigate("/dashboard", { replace: true });
    } else if (normalizedRole === "policymakernafdac") {
      navigate("/dashboard", { replace: true });
    } else if (normalizedRole === "supervisor") {
      navigate("/collectors");
    } else if (normalizedRole === "datacollector") {
      navigate("/data-collector-welcome");
    } else if (normalizedRole === "superadmin") {
      navigate("/invitecodes");
    } else if (normalizedRole === "headresearcher") {
      navigate("/database");
    } else if (normalizedRole === "labanalyst") {
      navigate("/lab-samples");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    if (authMode === "login") {
      try {
        const data = await dispatch(
          handleLogin({
            email: authForm.email,
            password: authForm.password,
          }),
        ).unwrap();

        setPopupMessage(`Welcome back, ${data.user.fullName || "User"}!`);
        setPopupType("success");
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          navigateBasedOnRole(data.user);
        }, 800);
      } catch (errMessage) {
        handleBackendFieldErrors(errMessage);
      }
    } else {
      try {
        const data = await dispatch(handleSignup(authForm)).unwrap();

        setPopupMessage(data.message || "Signup successful!");
        setPopupType("success");
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          setAuthMode("login");
        }, 1200);
      } catch (errMessage) {
        handleBackendFieldErrors(errMessage);
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
          <h1 className="text-2xl font-bold mb-2 text-white">LEADcap</h1>
          <p className={`text-sm ${theme.textMuted}`}>
            Lead Exposure & Detection Capacity Platform
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {["login", "signup"].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setAuthMode(mode);
                setFieldErrors({});
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                authMode === mode ? "bg-emerald-500 text-white" : theme.hover
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
                value={authForm.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your full name"
                theme={theme}
              />

              <Input
                label="Invite Code"
                value={authForm.inviteCode}
                onChange={(e) => handleChange("inviteCode", e.target.value)}
                placeholder="Enter invite code"
                theme={theme}
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="user@ledacap.ng"
            theme={theme}
            error={fieldErrors.email}
          />

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${
                  fieldErrors.password ? "border-red-500" : theme.input
                }`}
                placeholder="••••••••"
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
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg ${
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
      </div>

      <PopupModal
        show={showPopup}
        message={popupMessage}
        type={popupType}
        onClose={() => setShowPopup(false)}
      />
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
  error,
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
      className={`w-full px-4 py-2 border rounded-lg ${
        error ? "border-red-500" : theme.input
      }`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default AuthModal;
