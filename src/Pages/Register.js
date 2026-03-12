import { useState } from "react";
import { apiRegister } from "../Api";
import "../css/Register.css";

function validateRegister(fullname, email, password, confirmPassword, agreedToTerms) {
  const errors = {};
  if (!fullname.trim()) errors.fullname = "Full name is required";
  else if (fullname.trim().length < 2) errors.fullname = "Full name must be at least 2 characters";
  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
  if (!agreedToTerms) errors.terms = "Please agree to the Terms & Conditions";
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

export default function Register({ onSwitch, onLoginSuccess }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setApiError(""); setSuccessMsg("");
    const errs = validateRegister(fullname, email, password, confirmPassword, agreedToTerms);
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
    <div className="register-container">
      {/* Header */}
      <div className="register-header">
        <div className="brand-section">
          <div className="brand-logo">TaskPulse</div>
          <div className="welcome-text">Join TaskPulse</div>
          <div className="welcome-subtitle">Create an account to post tasks and start bidding</div>
        </div>
      </div>

      {/* Card */}
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Create Account</div>
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

          {/* Full Name */}
          <div className="form-group">
            <input
              type="text"
              className={`form-input ${errors.fullname ? "error-input" : ""}`}
              placeholder="Enter your full name"
              value={fullname}
              onChange={e => { setFullname(e.target.value); setErrors(p => ({ ...p, fullname: "" })); }}
            />
            {errors.fullname && <div className="field-error">⚠ {errors.fullname}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              className={`form-input ${errors.email ? "error-input" : ""}`}
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${errors.password ? "error-input" : ""}`}
                placeholder="Create a password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
              />
              <div className="password-toggle" onClick={() => setShowPassword(v => !v)}>
                <EyeIcon open={showPassword} />
              </div>
            </div>
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-input ${errors.confirmPassword ? "error-input" : ""}`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <div className="password-toggle" onClick={() => setShowConfirmPassword(v => !v)}>
                <EyeIcon open={showConfirmPassword} />
              </div>
            </div>
            {errors.confirmPassword && <div className="field-error">⚠ {errors.confirmPassword}</div>}
          </div>

          {/* Terms & Conditions */}
          <div className="terms-section">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                id="terms" 
                className="checkbox" 
                checked={agreedToTerms}
                onChange={e => { 
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) {
                    setErrors(p => ({ ...p, terms: "" }));
                  }
                }}
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the <span className="terms-link">Terms & Conditions</span> and <span className="terms-link">Privacy Policy</span>
              </label>
            </div>
            {errors.terms && <div className="field-error">⚠ {errors.terms}</div>}
          </div>

          {/* Create Account button */}
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Social buttons */}
          <div className="social-login-section">
            <button className="social-btn google-btn">
              <span className="social-icon google-icon"> </span>
              Sign up with Google
            </button>
            <button className="social-btn facebook-btn">
              <span className="social-icon facebook-icon"> </span>
              Sign up with Facebook
            </button>
          </div>

          {/* Sign in */}
          <div className="signup-link-section">
            Already have an account?{" "}
            <button type="button" onClick={onSwitch} className="signup-link">Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}