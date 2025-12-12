import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Helper function to normalize role for comparison
const normalizeRole = (role) => {
  if (!role) return "";
  return role.toLowerCase().replace(/[\s_]/g, "");
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = currentUser?.role;
  const normalizedRole = normalizeRole(userRole);

  // POLICY-MAKER RESTRICTIONS
  // Check for all policy maker roles (POLICY_MAKER_SON, POLICY_MAKER_NAFDAC, etc.)
  if (normalizedRole.startsWith("policymaker")) {
    const blockedRoutes = ["/reports", "/database", "/agents"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/map" replace />;
    }
  }

  // SUPERVISOR RESTRICTIONS
  if (normalizedRole === "supervisor") {
    const blockedRoutes = ["/invitecodes", "/reports"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/collectors" replace />;
    }
  }

  // ADMIN-ONLY ROUTES - Normalize allowed roles for comparison
  if (allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
