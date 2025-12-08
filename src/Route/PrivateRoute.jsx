import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0) {
    const normalizedRole = currentUser?.role
      ?.toLowerCase()
      .replace(/[\s_]/g, "");

    if (!allowedRoles.includes(normalizedRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
