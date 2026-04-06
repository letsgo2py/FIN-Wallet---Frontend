import { jwtDecode } from "jwt-decode";

export const ROLE_ROUTE_ACCESS = {
  SUPER_ADMIN: ["/dashboard", "/manage-users", "/summary"],
  ADMIN: ["/dashboard", "/manage-users", "/summary"],
  ANALYST: ["/dashboard", "/summary"],
  VIEWER: ["/dashboard"],
};

export function decodeStoredToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return {
      token,
      role: decoded.role || "",
      name: decoded.name || "User",
      email: decoded.email || "",
      decoded,
    };
  } catch (error) {
    console.error("Invalid token found in storage", error);
    localStorage.removeItem("token");
    return null;
  }
}

export function getDefaultRouteForRole(role) {
  const allowedRoutes = ROLE_ROUTE_ACCESS[role] || [];
  return allowedRoutes[0] || "/";
}

export function hasRouteAccess(role, path) {
  const allowedRoutes = ROLE_ROUTE_ACCESS[role] || [];
  return allowedRoutes.includes(path);
}
