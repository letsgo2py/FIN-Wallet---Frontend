import { Outlet } from "react-router-dom";
import { decodeStoredToken } from "../utils/auth";
import StatusPage from "../pages/StatusPage";

function PublicRoute() {
  const auth = decodeStoredToken();

  if (auth) {
    return (
      <StatusPage
        title="Access Denied"
        message="You are already logged in and cannot access this page."
      />
    );
  }

  return <Outlet />;
}

export default PublicRoute;
