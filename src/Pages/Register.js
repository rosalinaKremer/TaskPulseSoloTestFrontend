import { useState } from "react";
import { apiRegister, apiUpdateProfile } from "../Api";
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
      const data = await apiRegister(email, password, fullname.trim());
      setSuccessMsg("Account created! Redirecting to dashboard...");
      const displayEmail = data.user?.email || email;
      const token = data.access_token || data.token || "";

      if (token) {
        try {
          await apiUpdateProfile(token, email, {
            fullName: fullname.trim(),   // Added camelCase
            full_name: fullname.trim(),  // Kept snake_case for safety
          });
        } catch {
          // Registration succeeded; profile completion can be retried from Edit Profile.
        }
      }

      setTimeout(() => onLoginSuccess(displayEmail, token), 1200);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      {/* ── Left branding panel (Matches Login) ── */}
      <div className="register-left">
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
          <h1>Join your local<br/>community.</h1>
          <p>Create an account to post your tasks or start earning money on your own schedule.</p>
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
      <div className="register-right">
        <div className="form-card">
          <div className="form-top">
            <div className="form-title">Create Account</div>
            <div className="form-sub">Sign up to get started with TaskPulse</div>
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
            <label className="field-label" htmlFor="reg-fullname">Full Name</label>
            <input
              id="reg-fullname"
              type="text"
              className={`form-input ${errors.fullname ? "error-input" : ""}`}
              placeholder="Enter your full name"
              value={fullname}
              onChange={e => { setFullname(e.target.value); setErrors(p => ({ ...p, fullname: "" })); }}
            />
            {errors.fullname && <div className="field-error">⚠ {errors.fullname}</div>}
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              className={`form-input ${errors.email ? "error-input" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="reg-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-password"
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

          <div className="form-group">
            <label className="field-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-confirm"
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

          <div className="terms-section">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                id="terms" 
                className="checkbox" 
                checked={agreedToTerms}
                onChange={e => { 
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setErrors(p => ({ ...p, terms: "" }));
                }}
              />
              <label htmlFor="terms" className="checkbox-label">
                I agree to the <span className="terms-link">Terms & Conditions</span>
              </label>
            </div>
            {errors.terms && <div className="field-error">⚠ {errors.terms}</div>}
          </div>

          <button className="btn-primary-auth" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Create Account"}
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

          <div className="switch-link-section">
            Already have an account?{" "}
            <button type="button" onClick={onSwitch} className="switch-link">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}