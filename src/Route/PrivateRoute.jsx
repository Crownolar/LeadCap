import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasRole } from "../config/permissions";

/**
 * Authentication + optional role authorization guard.
 *
 * This component is intentionally responsible only for:
 *
 * 1. Authentication
 * 2. Role authorization
 *
 * Business-specific redirects belong elsewhere.
 */
const PrivateRoute = ({
  children,
  allowedRoles = [],
}) => {
  const location = useLocation();

  const {
    isAuthenticated,
    currentUser,
  } = useSelector((state) => state.auth);

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Authorization                                                            */
  /* ------------------------------------------------------------------------ */

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

export default PrivateRoute;