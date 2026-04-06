import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import Summary from "./pages/Summary";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import StatusPage from "./pages/StatusPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "ANALYST", "VIEWER"]} />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]} />
        }
      >
        <Route path="/manage-users" element={<ManageUsers />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "ANALYST"]} />
        }
      >
        <Route path="/summary" element={<Summary />} />
      </Route>

      <Route
        path="*"
        element={
          <StatusPage
            title="Page Not Found"
            message="This page does not exist."
            showAuthControls={false}
          />
        }
      />
    </Routes>
  );
}
