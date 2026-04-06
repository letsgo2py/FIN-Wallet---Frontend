import { Outlet, useLocation } from "react-router-dom";
import { decodeStoredToken, hasRouteAccess } from "../utils/auth";
import StatusPage from "../pages/StatusPage";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const auth = decodeStoredToken();

  if (!auth) {
    return (
      <StatusPage
        title="Access Denied"
        message={`You are not allowed to open ${location.pathname} because you are not logged in.`}
        showAuthControls={false}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return (
      <StatusPage
        title="Access Denied"
        message={`Your role does not have permission to open ${location.pathname}.`}
      />
    );
  }

  if (!hasRouteAccess(auth.role, location.pathname)) {
    return (
      <StatusPage
        title="Access Denied"
        message={`Your role does not have permission to open ${location.pathname}.`}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
