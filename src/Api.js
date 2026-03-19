const API_BASE = "http://localhost:8080/api";

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

export async function apiUpdateProfile(token, payload) {
  const res = await fetch(`${API_BASE}/user/updateprofile`, {
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