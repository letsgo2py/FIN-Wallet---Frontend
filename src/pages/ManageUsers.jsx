import React, { useEffect, useState } from "react";
import "./ManageUsers.css";

import Navbar from "./Navbar";
import Toast from "./Toast";
import { decodeStoredToken } from "../utils/auth";

const ROLE_OPTIONS = ["VIEWER", "ANALYST", "ADMIN"];
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [updatedRoles, setUpdatedRoles] = useState({});
  const [updatedStatuses, setUpdatedStatuses] = useState({});
  const [applyingUserId, setApplyingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const showToast = (message, type = "error") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "error",
      });
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to fetch users", "error");
        return;
      }

      setUsers(data);
      setUpdatedRoles({});
      setUpdatedStatuses({});
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update role", "error");
        return;
      }

      showToast(data.message || "Role updated successfully", "success");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Error updating role", "error");
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update status", "error");
        return;
      }

      showToast(data.message || "Status updated successfully", "success");
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast("Error updating status", "error");
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleUserCreated = () => {
      fetchUsers();
    };

    window.addEventListener("user-created", handleUserCreated);

    return () => {
      window.removeEventListener("user-created", handleUserCreated);
    };
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUpdatedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUpdatedStatuses((prev) => ({
      ...prev,
      [userId]: newStatus,
    }));
  };

  const handleApplyChanges = async (user) => {
    setApplyingUserId(user.id);

    const selectedRole = updatedRoles[user.id] ?? user.role;
    const selectedStatus = updatedStatuses[user.id] ?? (user.isActive ? "active" : "inactive");
    const originalStatus = user.isActive ? "active" : "inactive";

    try {
      let hasUpdated = false;

      if (selectedRole !== user.role) {
        await updateRole(user.id, selectedRole);
        hasUpdated = true;
      }

      if (selectedStatus !== originalStatus) {
        await updateStatus(user.id, selectedStatus === "active");
        hasUpdated = true;
      }

      if (!hasUpdated) {
        return;
      }
    } finally {
      setApplyingUserId(null);
    }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <Navbar />
      <div className="manage-users-container">
        <h2>User Management</h2>

        <div className="user-table">
          {isLoading ? (
            <div className="manage-users-loading">
              <div className="manage-users-spinner" aria-hidden="true"></div>
              <div className="manage-users-loading-text">Loading users...</div>
            </div>
          ) : (
            <>
              <div className="user-header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {users.map((user) => {
                const selectedRole = updatedRoles[user.id] ?? user.role;
                const selectedStatus = updatedStatuses[user.id] ?? (user.isActive ? "active" : "inactive");
                const isChanged =
                  selectedRole !== user.role ||
                  selectedStatus !== (user.isActive ? "active" : "inactive");

                return (
                  <div key={user.id} className="user-row">
                    <span>{user.name}</span>
                    <span>{user.email}</span>

                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {user.role === roleOption ? `* ${roleOption}` : roleOption}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((statusOption) => (
                        <option key={statusOption.value} value={statusOption.value}>
                          {statusOption.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="apply-btn"
                      disabled={!isChanged || applyingUserId === user.id}
                      onClick={() => handleApplyChanges(user)}
                    >
                      {applyingUserId === user.id ? <div className="apply-spinner"></div> : "Apply"}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
