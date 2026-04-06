import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import Navbar from "./Navbar";
import Toast from "./Toast";
import { FaInfoCircle } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidName, setIsValidName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isMatchPassword, setIsMatchPassword] = useState(true);

  const [passwordError, setPasswordError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setIsValidName(true);
    setIsValidEmail(true);
    setPasswordError("");
    setIsMatchPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && !formData.name.trim()) {
      setIsValidName(false);
      return;
    }
    setIsValidName(true);

    if (!formData.email.trim()) {
      setIsValidEmail(false);
      return;
    }
    setIsValidEmail(true);

    if (isLogin && !formData.password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    if (!isLogin && formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordError("");

    if(!isLogin && formData.confirmPassword !== formData.password){
      setIsMatchPassword(false);
      return;
    }
    setIsMatchPassword(true);

    try {
      setIsSubmitting(true);
      const url = isLogin
        ? `${import.meta.env.VITE_API_URL}/api/auth/login`
        : `${import.meta.env.VITE_API_URL}/api/auth/register`;

      const body = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Something went wrong", "error");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        showToast("Registration successful", "success");
        setIsLogin(true);
      }

    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <div className="testing-info">
        <div className="testing-info-header">
          <FaInfoCircle className="testing-info-icon" />
          <span>Test Credentials</span>
        </div>
        <p>For testing, use the following `SUPER_ADMIN` account:</p>
        <p><strong>Email:</strong> admin@finance.com</p>
        <p><strong>Password:</strong> admin</p>
      </div>
      <Navbar showAuthControls={false} />
      <div className="container">
        <div className="card">
          
          <div className="toggle">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} />
            )}
            {!isLogin && !isValidName && (
              <p className="error-text">Full name is required.</p>
            )}

            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            {!isValidEmail && (
              <p className="error-text">Email is required.</p>
            )}

            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            {passwordError  && (
              <p className="error-text">{passwordError}</p>
            )}

            {!isLogin && (
              <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
            )} 
            {!isLogin && !isMatchPassword && (
              <p className="error-text">The password does not match.</p>
            )}

            <button type="submit" className="submit" disabled={isSubmitting}>
              {isSubmitting ? <div className="auth-spinner"></div> : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="login-footer">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>

        </div>
      </div>
    </>
  );
}
