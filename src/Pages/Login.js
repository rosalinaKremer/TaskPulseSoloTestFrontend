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

export default function Login({ onSwitch, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <>
      <div className="login-container">
        <div className="login-header">
        </div>

        <div className="logo-section">
          <div className="logo-box">LOGO</div>
        </div>

        <div className="form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <div className="form-title">Sign in</div>
            </div>

            {apiError && (
              <div className="alert alert-error">
                <span>⚠</span> {apiError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? "error-input" : ""}`}
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              {errors.email && <div className="field-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  className={`form-input ${errors.password ? "error-input" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <div className="password-toggle">👁️</div>
              </div>
              {errors.password && <div className="field-error">⚠ {errors.password}</div>}
            </div>

            <div className="checkbox-row">
              <input type="checkbox" id="remember" className="checkbox" />
              <label htmlFor="remember" className="checkbox-label">Remember me</label>
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="signup-section">
              <div className="signup-box">
                <span className="signup-icon">✓</span>
                <div>
                  <div className="signup-title">Don't have an account?</div>
                  <a onClick={onSwitch} className="signup-link">Create one</a>
                </div>
              </div>
              <div className="signup-box">
                <span className="signup-icon">?</span>
                <div>
                  <div className="signup-title">Forgot Password?</div>
                  <a className="signup-link">Reset here</a>
                </div>
              </div>
            </div>

            <div className="forgot-password-link">
              <a>← Back to home</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}