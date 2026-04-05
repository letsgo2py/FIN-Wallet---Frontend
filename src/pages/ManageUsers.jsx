import React, { useEffect, useState } from "react";
import "./ManageUsers.css";

import Navbar from "./Navbar";

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("DATA for all users: ", data);

      if (!res.ok) {
        alert(data.msg || "Failed to fetch users");
        return;
      }

      setUsers(data);
      setUpdatedRoles({});
      setUpdatedStatuses({});
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");

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
        alert(data.msg || "Failed to update role");
        return;
      }

      fetchUsers();

    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem("token");

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
        alert(data.message || "Failed to update status");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
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
      <Navbar />
      <div className="manage-users-container">
        <h2>User Management</h2>

        <div className="user-table">
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
                      {user.role === roleOption ? `✓ ${roleOption}` : roleOption}
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
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
