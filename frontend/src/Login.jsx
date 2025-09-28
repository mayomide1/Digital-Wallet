import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import logo from '../public/logo.png'

export const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost:8081/login", user)
      .then((res) => {
        if (res.data.success) {
          const loggedInUser = res.data.user;
          localStorage.setItem("user", JSON.stringify(loggedInUser));
          toast.success("Login successful ✅");

          setTimeout(() => {
            if (!loggedInUser.transaction_pin) {
              // redirect with state to trigger PIN modal
              navigate("/dashboard", { state: { showPinModal: true } });
            } else {
              navigate("/dashboard");
            }
          }, 1500);
        } else {
          toast.error(res.data.message || "Invalid credentials ❌");
        }
      })
      .catch(() => {
        toast.error("Login failed ❌");
        setLoading(false);
      });
  }

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <img src={logo} alt=""/>
        <h3>SIGN IN</h3>
        <div className="input-box">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>
        <div className="input-box">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
