import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Helper function to normalize role for comparison
const normalizeRole = (role) => {
  if (!role) return "";
  return role.toLowerCase().replace(/[\s_.]/g, "");
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!currentUser) return null;

  const normalizedRole = normalizeRole(currentUser?.role);

  console.log("PrivateRoute", {
    isAuthenticated,
    currentUser,
    normalizedRole,
    location: location.pathname,
  });

  // POLICYMAKER RESTRICTIONS
  if (
    normalizedRole.startsWith("policymaker") &&
    normalizedRole !== "policymakerfmohsw"
  ) {
    const blockedRoutes = ["/reports", "/database", "/agents"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // SUPERVISOR RESTRICTIONS
  if (normalizedRole === "supervisor") {
    const blockedRoutes = ["/invitecodes", "/reports"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/collectors" replace />;
    }
  }

  // ROLE ACCESS CHECK
  if (allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;