import React, { useState, useEffect } from 'react'
import { FaUserCircle } from "react-icons/fa";
import Toast from "./Toast";

import { useNavigate, useLocation } from "react-router-dom";
import { decodeStoredToken } from "../utils/auth";


import './Navbar.css';

function Navbar({ showAuthControls = true }) {
  const [role, setRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER",
  });
  const [createUserFieldErrors, setCreateUserFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = decodeStoredToken();

    if (!auth) {
      setRole("");
      setIsAuthenticated(false);
      setUser({ name: "", email: "" });
      return;
    }

    setRole(auth.role);
    setUser({
      name: auth.name,
      email: auth.email,
    });
    setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleLogoClick = () => {
    if(!isAuthenticated){
      navigate("/");
      return;
    }
    navigate("/dashboard");
  };

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

  const handleOpenAddUserModal = () => {
    setCreateUserForm({
      name: "",
      email: "",
      password: "",
      role: "VIEWER",
    });
    setCreateUserFieldErrors({
      name: "",
      email: "",
      password: "",
    });
    setShowAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    if (isCreatingUser) return;
    setShowAddUserModal(false);
    setCreateUserFieldErrors({
      name: "",
      email: "",
      password: "",
    });
  };

  const handleCreateUserFormChange = (e) => {
    const { name, value } = e.target;
    setCreateUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name" || name === "email" || name === "password") {
      setCreateUserFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCreateUser = async () => {
    const nextErrors = {
      name: "",
      email: "",
      password: "",
    };

    if (!createUserForm.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!createUserForm.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!createUserForm.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (createUserForm.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      setCreateUserFieldErrors(nextErrors);
      return;
    }

    try {
      setIsCreatingUser(true);
      setCreateUserFieldErrors({
        name: "",
        email: "",
        password: "",
      });

      const auth = decodeStoredToken();

      if (!auth) {
        showToast("You are not logged in", "error");
        return;
      }

      const token = auth.token;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createUserForm),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to create user", "error");
        return;
      }

      setShowAddUserModal(false);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        role: "VIEWER",
      });
      window.dispatchEvent(new CustomEvent("user-created", {
        detail: data.user,
      }));
      showToast(data.message || "User created successfully", "success");
    } catch (error) {
      console.error("Error creating user:", error);
      showToast("Something went wrong while creating the user", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const roleOptions = role === "SUPER_ADMIN"
    ? ["VIEWER", "ANALYST", "ADMIN"]
    : ["VIEWER", "ANALYST"];
  
  return (
    <>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <div className={`navbar-container ${!(showAuthControls && isAuthenticated) ? "navbar-logged-out" : ""}`}>
        <div className="app-logo" onClick={handleLogoClick}>
          <img src="/logo.png" alt="Fin Wallet logo" className="app-logo-image" />
          <h1 className="app-logo-text">FIN Wallet</h1>
        </div>
        {showAuthControls && isAuthenticated && (
          <div className="right-side">
            {(role === "SUPER_ADMIN" || role === "ADMIN") && location.pathname === "/manage-users" && (
              <button className="role-badge add-user-btn" onClick={handleOpenAddUserModal}>
                Add User
              </button>
            )}
            <div className="role-badge">{role}</div>
            {(role === "SUPER_ADMIN" || role === "ADMIN") && location.pathname !== "/manage-users" && (
              <button className="manage-users-btn" onClick={() => navigate("/manage-users")}>
                Manage Users
              </button>
            )}
            <div className="user-profile">
              {showProfile && (
                <div
                  className="profile-overlay"
                  onClick={() => setShowProfile(false)}
                />
              )}
              <div onClick={() => setShowProfile(prev => !prev)}>
                <FaUserCircle size={36} color="#444342" />
              </div>
              {showProfile && (
                <div className="profile-div">
                  <div className="profile-info">
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-email">{user.email}</div>
                  </div>

                  <button className="logout-btn" onClick={handleLogout}>
                    <span></span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddUserModal && (
        <div className="navbar-modal-backdrop" onClick={handleCloseAddUserModal}>
          <div
            className="navbar-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-modal-title"
          >
            <h2 id="add-user-modal-title" className="navbar-modal-title">Add User</h2>

            <div className="navbar-modal-form">
              <input
                className="navbar-modal-input"
                type="text"
                name="name"
                placeholder="Full name"
                value={createUserForm.name}
                onChange={handleCreateUserFormChange}
              />
              {createUserFieldErrors.name && (
                <p className="navbar-field-error">{createUserFieldErrors.name}</p>
              )}
              <input
                className="navbar-modal-input"
                type="email"
                name="email"
                placeholder="Email"
                value={createUserForm.email}
                onChange={handleCreateUserFormChange}
              />
              {createUserFieldErrors.email && (
                <p className="navbar-field-error">{createUserFieldErrors.email}</p>
              )}
              <input
                className="navbar-modal-input"
                type="password"
                name="password"
                placeholder="Password"
                value={createUserForm.password}
                onChange={handleCreateUserFormChange}
              />
              {createUserFieldErrors.password && (
                <p className="navbar-field-error">{createUserFieldErrors.password}</p>
              )}
              <select
                className="navbar-modal-input"
                name="role"
                value={createUserForm.role}
                onChange={handleCreateUserFormChange}
              >
                {roleOptions.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="navbar-modal-actions">
              <button
                type="button"
                className="navbar-modal-cancel"
                onClick={handleCloseAddUserModal}
                disabled={isCreatingUser}
              >
                Cancel
              </button>
              <button
                type="button"
                className="navbar-modal-submit"
                onClick={handleCreateUser}
                disabled={isCreatingUser}
              >
                {isCreatingUser ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
