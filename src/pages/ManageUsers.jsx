import React, { useEffect, useState } from "react";
import "./ManageUsers.css";

import Navbar from "./Navbar";

const ROLE_OPTIONS = ["VIEWER", "ANALYST", "ADMIN"];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [updatedRoles, setUpdatedRoles] = useState({});

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/users", {
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
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/users/role", {
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

      // refresh list after update
      fetchUsers();

    } catch (err) {
      console.error(err);
      alert("Error updating role");
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
            <span>Action</span>
          </div>

          {users.map((user) => {
            const selectedRole = updatedRoles[user.id] ?? user.role;
            const isRoleChanged = selectedRole !== user.role;

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
                <button
                  className="apply-btn"
                  disabled={!isRoleChanged}
                  onClick={() => updateRole(user.id, selectedRole)}
                >
                  Apply
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
