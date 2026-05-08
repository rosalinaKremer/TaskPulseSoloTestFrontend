import { useState } from "react";
import { apiLogin } from "../Api";
import "../css/Login.css";

function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  return errors;
}

function EyeIcon({ open }) {
  const color = "#8aa0b8";
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login({ onSwitch, onLoginSuccess, navigate }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit() {
    setApiError("");
    const errs = validateLogin(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await apiLogin(email, password);

      // Role comes entirely from the server — never from the client
      const role      = data.user?.role?.toLowerCase() || "user";
      const token     = data.access_token || data.token || "";
      const userEmail = data.user?.email  || email;

      localStorage.setItem("token", token);
      localStorage.setItem("role",  role);
      localStorage.setItem("email", userEmail);

      onLoginSuccess(userEmail, token, role);

      // Server role decides where you go
      navigate(role === "admin" ? "/admin/dashboard" : "/home");

    } catch (e) {
      setApiError(e.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* ── Left branding panel ── */}
      <div className="login-left">
        <div className="brand-mark">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="brand-name">TaskPulse</span>
        </div>

        <div className="brand-copy">
          <h1>Local tasks.<br/>Real opportunities.</h1>
          <p>Post an errand or earn money on your schedule — all within your neighborhood.</p>
        </div>

        <div className="brand-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>Secure real-time bidding</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <span>Trusted local community</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span>Earn on your own schedule</span>
          </div>
        </div>

        <div className="brand-dots">
          <span /><span /><span />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="form-card">
          <div className="form-top">
            <div className="form-title">Welcome back</div>
            <div className="form-sub">Sign in to continue to TaskPulse</div>
          </div>

          {apiError && (
            <div className="alert alert-error">
              <span>⚠</span> {apiError}
            </div>
          )}

          <div className="form-group">
            <label className="field-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? "error-input" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                className={`form-input ${errors.password ? "error-input" : ""}`}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <div className="password-toggle" onClick={() => setShowPw(v => !v)}>
                <EyeIcon open={showPw} />
              </div>
            </div>
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          <div className="form-options">
            <label className="checkbox-row">
              <input type="checkbox" className="checkbox" />
              <span className="checkbox-label">Remember me</span>
            </label>
            <button type="button" className="forgot-link">Forgot password?</button>
          </div>

          <button className="btn-primary-login" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="divider"><span>OR</span></div>

          <div className="social-row">
            <button className="social-btn google-btn">
              <span className="social-icon google-icon"> </span>
              Google
            </button>
            <button className="social-btn facebook-btn">
              <span className="social-icon facebook-icon"> </span>
              Facebook
            </button>
          </div>

          <div className="signup-link-section">
            No account?{" "}
            <button type="button" onClick={onSwitch} className="signup-link">
              Sign up free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}