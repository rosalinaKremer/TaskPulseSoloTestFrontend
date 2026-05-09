// Example logic for Api.js
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error_description || "Invalid credentials");
  return data;
}

export async function apiRegister(email, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullname: fullName, full_name: fullName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error_description || "Registration failed");
  return data;
}

// FIXED: Added 'email' parameter and pointed to the correct backend endpoint
export async function apiUpdateProfile(token, email, payload) {
  const res = await fetch(`${API_BASE}/user/profile?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Profile update failed");
  return data;
}

export async function apiGetProfile(token, email) {
  // We append the email to the URL so Spring Boot stops complaining
  const res = await fetch(`${API_BASE}/user/profile?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch profile");
  return data;
}