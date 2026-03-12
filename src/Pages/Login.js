import { useState } from "react";
import { apiLogin } from "../Api";
import "../css/Login.css";

function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  return errors;
}

function EyeIcon({ open }) {
  const color = "#8aa0b8";
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login({ onSwitch, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setApiError("");
    const errs = validateLogin(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      const displayEmail = data.user?.email || email;
      const token = data.access_token || data.token || "";
      onLoginSuccess(displayEmail, token);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Header */}
      <div className="login-header">
        <div className="brand-section">
          <div className="brand-logo">TaskPulse</div>
          <div className="welcome-text">Welcome Back</div>
          <div className="welcome-subtitle">Sign in to your account to continue</div>
        </div>
      </div>

      {/* Card */}
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Login</div>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <span>⚠</span> {apiError}
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              className={`form-input ${errors.email ? "error-input" : ""}`}
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "error-input" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <div className="password-toggle" onClick={() => setShowPassword(v => !v)}>
                <EyeIcon open={showPassword} />
              </div>
            </div>
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          {/* Options */}
          <div className="form-options">
            <div className="checkbox-row">
              <input type="checkbox" id="remember" className="checkbox" />
              <label htmlFor="remember" className="checkbox-label">Remember me</label>
            </div>
            <button type="button" className="forgot-link">Forgot Password?</button>
          </div>

          {/* Login button */}
          <button className="btn-primary-login" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social buttons */}
          <div className="social-login-section">
            <button className="social-btn google-btn">
              <span className="social-icon google-icon"> </span>
              Continue with Google
            </button>
            <button className="social-btn facebook-btn">
              <span className="social-icon facebook-icon"> </span>
              Continue with Facebook
            </button>
          </div>

          {/* Sign up */}
          <div className="signup-link-section">
            Don't have an account?{" "}
            <button type="button" onClick={onSwitch} className="signup-link">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}