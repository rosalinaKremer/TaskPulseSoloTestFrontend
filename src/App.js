import { useState } from "react";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
// import AdminDashboard from "./Pages/AdminDashboard"; // You'll create this next!

const AUTH_USER_KEY = "taskpulse.authUser";
const AUTH_TOKEN_KEY = "taskpulse.authToken";
const AUTH_ROLE_KEY = "taskpulse.authRole"; // Added role key

export default function App() {
  const [authUser, setAuthUser] = useState(() => localStorage.getItem(AUTH_USER_KEY));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [authRole, setAuthRole] = useState(() => localStorage.getItem(AUTH_ROLE_KEY) || "user");
  
  // Determine initial screen based on whether a token exists AND what the role is
  const [screen, setScreen] = useState(() => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return "login";
    return localStorage.getItem(AUTH_ROLE_KEY) === "admin" ? "admin" : "home";
  }); 

  // Updated to accept the role parameter from Login.jsx
  function handleLoginSuccess(email, token, role = "user") {
    setAuthUser(email);
    setAuthToken(token);
    setAuthRole(role);
    
    localStorage.setItem(AUTH_USER_KEY, email);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_ROLE_KEY, role);
    
    setScreen(role === "admin" ? "admin" : "home");
  }

  function handleLogout() {
    setAuthUser(null);
    setAuthToken(null);
    setAuthRole("user");
    
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    
    setScreen("login");
  }

  // ── Routing Logic ──

  if (screen === "admin") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Admin Dashboard Placeholder</h1>
        <p>Welcome, {authUser}. Platform moderation tools will go here.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
      // return <AdminDashboard user={authUser} token={authToken} onLogout={handleLogout} />;
    );
  }

  if (screen === "home") {
    return <Home user={authUser} token={authToken} onLogout={handleLogout} />;
  }

  if (screen === "register") {
    return (
      <Register
        onSwitch={() => setScreen("login")}
        onLoginSuccess={(email, token) => handleLoginSuccess(email, token, "user")}
      />
    );
  }

  return (
    <Login
      onSwitch={() => setScreen("register")}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}