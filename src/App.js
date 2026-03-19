import { useState } from "react";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";

const AUTH_USER_KEY = "taskpulse.authUser";
const AUTH_TOKEN_KEY = "taskpulse.authToken";

export default function App() {
  const [authUser, setAuthUser] = useState(() => localStorage.getItem(AUTH_USER_KEY));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [screen, setScreen] = useState(() =>
    localStorage.getItem(AUTH_TOKEN_KEY) ? "home" : "login"
  ); // "login" | "register" | "home"

  function handleLoginSuccess(email, token) {
    setAuthUser(email);
    setAuthToken(token);
    localStorage.setItem(AUTH_USER_KEY, email);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setScreen("home");
  }

  function handleLogout() {
    setAuthUser(null);
    setAuthToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setScreen("login");
  }

  if (screen === "home") {
    return <Home user={authUser} token={authToken} onLogout={handleLogout} />;
  }

  if (screen === "register") {
    return (
      <Register
        onSwitch={() => setScreen("login")}
        onLoginSuccess={handleLoginSuccess}
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