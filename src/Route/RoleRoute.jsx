import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasRole } from "../config/permissions";

const RoleRoute = ({
  allowedRoles = [],
  children,
}) => {
  const location = useLocation();

  const {
    isAuthenticated,
    currentUser,
  } = useSelector((state) => state.auth);

  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !hasRole(currentUser.role, allowedRoles)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default RoleRoute;