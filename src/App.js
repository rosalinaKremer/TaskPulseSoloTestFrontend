import { useState } from "react";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";

export default function App() {
  const [screen, setScreen] = useState("login"); // "login" | "register" | "home"
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  function handleLoginSuccess(email, token) {
    setAuthUser(email);
    setAuthToken(token);
    setScreen("home");
  }

  function handleLogout() {
    setAuthUser(null);
    setAuthToken(null);
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