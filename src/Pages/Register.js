import { useState } from "react";
import { apiRegister } from "../Api";
import "../css/Register.css";

function validateRegister(fullname, email, password, confirmPassword) {
  const errors = {};
  if (!fullname.trim()) errors.fullname = "Full name is required";
  else if (fullname.trim().length < 2) errors.fullname = "Full name must be at least 2 characters";
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export default function Register({ onSwitch, onLoginSuccess }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setApiError(""); setSuccessMsg("");
    const errs = validateRegister(fullname, email, password, confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await apiRegister(email, password);
      setSuccessMsg("Account created! Redirecting to dashboard...");
      const displayEmail = data.user?.email || email;
      const token = data.access_token || data.token || "";
      setTimeout(() => onLoginSuccess(displayEmail, token), 1200);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="register-container">
        <div className="register-header">
        </div>

        <div className="logo-section">
          <div className="logo-box">LOGO</div>
        </div>

        <div className="form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <div className="form-title">Create account</div>
            </div>

            {apiError && (
              <div className="alert alert-error">
                <span>⚠</span> {apiError}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success">
                <span>✓</span> {successMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.fullname ? "error-input" : ""}`}
                placeholder="Enter your full name"
                value={fullname}
                onChange={e => { setFullname(e.target.value); setErrors(p => ({ ...p, fullname: "" })); }}
              />
              {errors.fullname && <div className="field-error">⚠ {errors.fullname}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? "error-input" : ""}`}
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
              />
              {errors.email && <div className="field-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  className={`form-input ${errors.password ? "error-input" : ""}`}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                />
                <div className="password-toggle">👁️</div>
              </div>
              {errors.password && <div className="field-error">⚠ {errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  className={`form-input ${errors.confirmPassword ? "error-input" : ""}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })); }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <div className="password-toggle">👁️</div>
              </div>
              {errors.confirmPassword && <div className="field-error">⚠ {errors.confirmPassword}</div>}
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Creating account..." : "Create account"}
            </button>

            <div className="signup-section">
              <div className="signup-box">
                <span className="signup-icon">✓</span>
                <div>
                  <div className="signup-title">Already have an account?</div>
                  <a onClick={onSwitch} className="signup-link">Sign in</a>
                </div>
              </div>
              <div className="signup-box">
                <span className="signup-icon">?</span>
                <div>
                  <div className="signup-title">Need help?</div>
                  <a className="signup-link">Contact support</a>
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