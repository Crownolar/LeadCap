import { useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.email === authForm.email && u.password === authForm.password
    );
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthForm({ email: "", password: "", name: "" });
    } else {
      alert("Invalid credentials!");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (users.find((u) => u.email === authForm.email)) {
      alert("User already exists!");
      return;
    }
    const newUser = {
      email: authForm.email,
      password: authForm.password,
      name: authForm.name,
      role: "agent",
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthForm({ email: "", password: "", name: "" });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return {
    isAuthenticated,
    currentUser,
    authForm,
    setAuthForm,
    showPassword,
    setShowPassword,
    authMode,
    setAuthMode,
    handleLogin,
    handleSignup,
    handleLogout,
  };
};
