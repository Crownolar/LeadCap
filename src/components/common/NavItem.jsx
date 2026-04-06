import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavItem = ({
  icon: Icon,
  label,
  route,
  badge,
  setMobileMenuOpen,
  darkMode,
  theme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === route ||
    (route !== "/" && location.pathname.startsWith(`${route}/`));

  return (
    <button
      onClick={() => {
        navigate(route);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? darkMode
            ? "bg-emerald-600 text-white"
            : "bg-emerald-500 text-white"
          : `${theme?.text} ${theme?.hover}`
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

export default NavItem;
