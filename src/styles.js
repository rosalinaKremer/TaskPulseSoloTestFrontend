const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0b0f1a;
    --surface: #111827;
    --surface2: #1a2235;
    --border: #1f2d45;
    --accent: #4f8ef7;
    --accent2: #7c5cfc;
    --success: #22c55e;
    --error: #ef4444;
    --warning: #f59e0b;
    --text: #f0f4ff;
    --muted: #6b7fa3;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
  }

  /* LOGIN CONTAINER */
  .login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0d1424 0%, #111c35 50%, #0a1628 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    position: relative;
  }

  .login-container::before {
    content: '';
    position: absolute;
    top: -120px; left: -120px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-container::after {
    content: '';
    position: absolute;
    bottom: -80px; right: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-header {
    width: 100%;
    padding: 20px 40px;
    text-align: left;
    position: relative;
    z-index: 1;
  }

  .login-header-text {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 600;
    color: var(--muted);
  }

  .logo-section {
    display: flex;
    justify-content: center;
    margin: 30px 0;
    position: relative;
    z-index: 1;
  }

  .logo-box {
    width: 120px;
    height: 80px;
    background: #8fa8cc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--bg);
    font-size: 16px;
  }

  .form-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    flex: 1;
    position: relative;
    z-index: 1;
  }

  .form-card {
    width: 100%;
    max-width: 480px;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px;
    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .form-header { margin-bottom: 32px; }

  .form-title {
    font-family: var(--font-head);
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .form-group { margin-bottom: 24px; }

  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #8fa8cc;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-toggle {
    position: absolute;
    right: 16px;
    cursor: pointer;
    font-size: 18px;
    user-select: none;
  }

  .form-input {
    width: 100%;
    background: rgba(13, 20, 36, 0.5);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 13px 16px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder { color: #3d5070; }

  .form-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
  }

  .form-input.error-input {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 20px 0 28px;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .checkbox-label {
    font-size: 14px;
    color: var(--muted);
    cursor: pointer;
  }

  .field-error {
    color: var(--error);
    font-size: 12px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .alert {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .alert-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
  }

  .alert-success {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.25);
    color: #86efac;
  }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(79,142,247,0.3);
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(79,142,247,0.4);
  }

  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .signup-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 32px;
  }

  .signup-box {
    background: rgba(13, 20, 36, 0.5);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .signup-box:hover {
    border-color: var(--accent);
    background: rgba(79, 142, 247, 0.08);
  }

  .signup-icon {
    width: 24px;
    height: 24px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
  }

  .signup-title {
    font-size: 14px;
    color: var(--text);
    font-weight: 500;
  }

  .signup-link {
    font-size: 13px;
    color: var(--accent);
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;
  }

  .signup-link:hover { text-decoration: underline; }

  .forgot-password-link {
    text-align: center;
    margin-top: 24px;
  }

  .forgot-password-link a {
    font-size: 13px;
    color: var(--muted);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .forgot-password-link a:hover { color: var(--accent); }

  /* DASHBOARD */
  .dashboard {
    min-height: 100vh;
    background: var(--bg);
    animation: fadeIn 0.4s ease;
  }

  .dash-nav {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dash-welcome {
    padding: 48px 40px 32px;
  }

  .dash-welcome h1 {
    font-family: var(--font-head);
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 6px;
  }

  .dash-welcome p { color: var(--muted); font-size: 15px; }

  .dash-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0 40px 40px;
  }

  .dash-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
  }

  .dash-card-label {
    color: var(--muted);
    font-size: 13px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .dash-card-value {
    font-family: var(--font-head);
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .dash-card-value.blue { color: var(--accent); }
  .dash-card-value.purple { color: #a78bfa; }
  .dash-card-value.green { color: var(--success); }

  .btn-logout {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 8px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-logout:hover { border-color: var(--error); color: #fca5a5; }

  .token-info {
    background: rgba(79,142,247,0.08);
    border: 1px solid rgba(79,142,247,0.2);
    border-radius: 10px;
    padding: 12px 16px;
    margin: 0 40px 24px;
    font-size: 12px;
    color: var(--muted);
    word-break: break-all;
  }

  .token-info strong { color: var(--accent); }

  @media (max-width: 900px) {
    .login-container { padding: 20px 16px; }
    .form-card { padding: 32px 24px; max-width: 100%; }
    .logo-box { width: 100px; height: 70px; }
    .signup-section { gap: 10px; }
    .dash-cards { grid-template-columns: 1fr; }
  }
`;

export default styles;