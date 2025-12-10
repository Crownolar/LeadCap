import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");

  // POLICY-MAKER RESTRICTIONS
  if (normalizedRole === "policymakerson") {
    const blockedRoutes = ["/reports", "/database", "/agents"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/map" replace />;
    }
  }

  // SUPERVISOR RESTRICTIONS
  if (normalizedRole === "supervisor") {
    const blockedRoutes = ["/invitecodes", "/reports", "/dashboard"];
    if (blockedRoutes.includes(location.pathname)) {
      return <Navigate to="/agents" replace />;
    }
  }

  // ADMIN-ONLY ROUTES
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(normalizedRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
