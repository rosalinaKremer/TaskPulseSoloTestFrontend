import { useState, useEffect, useRef, useCallback } from "react";
import "../css/Profile.css";

// ── API base URL ──────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api/user";

// ── API endpoint map (matches your Spring Boot controller) ────
const ENDPOINTS = {
  getProfile:    `${API_BASE}/profile`,          // GET
  updateProfile: `${API_BASE}/updateprofile`,    // PATCH  ← fixed
  uploadPhoto:   `${API_BASE}/upload-photo`,     // POST
  updatePassword:`${API_BASE}/updatepassword`,         // PUT
};

function apiHeaders(token) {
  return { "Authorization": "Bearer " + token, "Content-Type": "application/json" };
}

function resolvePhotoSrc(profile) {
  const url = profile?.photo_url;
  if (url) return url;

  const rawPhoto = profile?.photo;
  if (!rawPhoto) return null;

  if (typeof rawPhoto === "string" && rawPhoto.startsWith("data:image/")) {
    return rawPhoto;
  }

  return `data:image/jpeg;base64,${rawPhoto}`;
}

// ── Star renderer ─────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#d1d9e6" }}>★</span>
      ))}
    </span>
  );
}

// ── User avatar icon ──────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// ── Main Profile Component ────────────────────────────────────
export default function Profile({ user, token, onLogout, onBack }) {
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [activeTab, setActiveTab]   = useState("tasker");
  const [showEdit, setShowEdit]     = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [editData, setEditData]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState("");
  const [passwordData, setPasswordData] = useState({ oldPassword: "", password: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef();

  function unwrapApiData(payload) {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      if (payload.success === false) {
        throw new Error(payload.error || "Request failed");
      }
      if (Object.prototype.hasOwnProperty.call(payload, "data")) {
        return payload.data;
      }
      if (Object.prototype.hasOwnProperty.call(payload, "error")) {
        throw new Error(payload.error || "Request failed");
      }
    }
    return payload;
  }

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(ENDPOINTS.getProfile, {
        headers: apiHeaders(token),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text || res.statusText}`);
      }
      const raw = await res.json();
      const data = unwrapApiData(raw);
      let p;
      if (Array.isArray(data)) {
        const currentUserEmail = (user || "").toLowerCase();
        p = data.find(row => (row?.email || "").toLowerCase() === currentUserEmail) || data[0];
      } else {
        p = data;
      }
      if (!p) throw new Error("No profile found. Make sure your profiles table has a row for this user.");
      setProfile(p);
      setPhotoPreview(resolvePhotoSrc(p));
    } catch (e) {
      if (e.message === "Failed to fetch") {
        setError("Cannot connect to server. Make sure your Spring Boot app is running on http://localhost:8080");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  // ── Fetch profile on mount ──────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Open edit modal ─────────────────────────────────────────
  function openEdit() {
    setEditData({
      full_name:    profile?.full_name    || "",
      bio:          profile?.bio          || "",
    });
    setSaveMsg("");
    setShowEdit(true);
  }

  function openPasswordEdit() {
    setPasswordData({ oldPassword: "", password: "", confirmPassword: "" });
    setPasswordMsg("");
    setShowPasswordEdit(true);
  }

  // ── Save profile ────────────────────────────────────────────
  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        full_name: editData.full_name,
        bio: editData.bio,
      };
      const res = await fetch(ENDPOINTS.updateProfile, {
        method: "PATCH",
        headers: apiHeaders(token),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text || res.statusText}`);
      }
      const raw = await res.json();
      const updated = unwrapApiData(raw);
      if (Array.isArray(updated) && updated.length === 0) {
        throw new Error("No rows were updated in Supabase. Check your backend WHERE clause and RLS policy.");
      }

      const updatedRow = Array.isArray(updated) ? updated[0] : updated;
      if (updatedRow && typeof updatedRow === "object") {
        setProfile(prev => ({ ...(prev || {}), ...updatedRow }));
      } else {
        setProfile(prev => ({ ...(prev || {}), ...payload }));
      }

      setSaveMsg("success:Profile updated successfully!");
      await fetchProfile();
      setTimeout(() => setShowEdit(false), 1000);
    } catch (e) {
      if (e.message === "Failed to fetch") {
        setSaveMsg("error:Cannot connect to server. Make sure Spring Boot is running on port 8080.");
      } else {
        setSaveMsg("error:" + e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setPasswordMsg("");
    if (!passwordData.oldPassword) {
      setPasswordMsg("error:Please enter your old password.");
      return;
    }
    if (!passwordData.password || !passwordData.confirmPassword) {
      setPasswordMsg("error:Please enter and confirm your new password.");
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordMsg("error:Passwords do not match.");
      return;
    }
    if (passwordData.oldPassword === passwordData.password) {
      setPasswordMsg("error:New password must be different from old password.");
      return;
    }
    if (passwordData.password.length < 6) {
      setPasswordMsg("error:Password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch(ENDPOINTS.updatePassword, {
        method: "PUT",
        headers: apiHeaders(token),
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.password,
          password: passwordData.password,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text || res.statusText}`);
      }

      const raw = await res.json();
      unwrapApiData(raw);
      setPasswordMsg("success:Password updated successfully!");
      setPasswordData({ oldPassword: "", password: "", confirmPassword: "" });
    } catch (e) {
      if (e.message === "Failed to fetch") {
        setPasswordMsg("error:Cannot connect to server. Make sure Spring Boot is running on port 8080.");
      } else {
        setPasswordMsg("error:" + e.message);
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  // ── Upload photo ────────────────────────────────────────────
  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to API
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch(ENDPOINTS.uploadPhoto, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text || res.statusText}`);
      }
      await fetchProfile();
    } catch (e) {
      if (e.message === "Failed to fetch") {
        alert("Cannot connect to server. Make sure Spring Boot is running on port 8080.");
      } else {
        alert("Photo upload failed: " + e.message);
      }
    }
  }

  // ── Render stars helper ─────────────────────────────────────
  const rating    = profile?.rating        || 4.9;
  const reviews   = profile?.reviews_count || 35;
  const location  = profile?.location      || "Quezon City, Metro Manila";
  const memberSince = profile?.member_since || "January 2024";
  const full_name  = profile?.full_name || profile?.fullName || profile?.email?.split("@")[0] || "Your Name";
  const about     = profile?.bio           || "No bio yet. Click Edit Profile to add one.";
  const skillsRaw = profile?.skills        || "";
  const skillList = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  const email     = profile?.email         || "";
  const phone     = profile?.phone         || "";

  // Mock stats (replace with real data from your API if available)
  const taskerStats  = { completed: profile?.tasks_completed || 24, successRate: profile?.success_rate || "96%" };
  const posterStats  = { posted: profile?.tasks_posted || 12, completed: profile?.poster_completed || 10, avgResponse: profile?.avg_response || "2 hrs" };

  // Mock reviews (replace with real reviews API when available)
  const mockTaskerReviews = [
    { id: 1, name: "Maria Santos",   date: "March 5, 2026",    rating: 5, text: "Excellent work! Fixed our leaking pipes quickly and professionally. Very reasonable pricing and cleaned up after. Highly recommend!" },
    { id: 2, name: "Roberto Gomez",  date: "March 1, 2026",    rating: 5, text: "Very professional and skilled. Installed our ceiling fan perfectly and also fixed some electrical outlets. Great service!" },
    { id: 3, name: "Ana Rodriguez",  date: "February 28, 2026", rating: 4, text: "Good work overall. Was punctual and completed the carpentry project as discussed. Would hire again." },
  ];
  const mockPosterReviews = [
    { id: 4, name: "Carlo Reyes",    date: "February 20, 2026", rating: 5, text: "Clear instructions and paid on time. Great poster to work with!" },
    { id: 5, name: "Liza Mendoza",   date: "February 10, 2026", rating: 4, text: "Good communication throughout the project." },
  ];

  const reviewsToShow = activeTab === "tasker" ? mockTaskerReviews : mockPosterReviews;

  // ── Loading state ───────────────────────────────────────────
  if (loading) return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">TaskPulse</span>
      </nav>
      <div className="loading-screen">
        <div className="spinner" /> Loading profile...
      </div>
    </div>
  );

  // ── Error state ─────────────────────────────────────────────
  if (error) return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">TaskPulse</span>
      </nav>
      <div className="loading-screen" style={{ color: "#dc2626" }}>
        ⚠ {error} — <button onClick={fetchProfile} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-brand">TaskPulse</span>
        <div className="navbar-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search for tasks..." />
        </div>
        <div className="navbar-links">
          {onBack && (
            <button className="nav-link" onClick={onBack}>← Back</button>
          )}
          <button className="nav-link">Browse Tasks</button>
          <button className="nav-link">My Bids</button>
          <button className="nav-link">My Tasks</button>
          {onLogout && (
            <button className="nav-link" onClick={onLogout}>Logout</button>
          )}
          <div className="nav-avatar">
            {photoPreview
              ? <img src={photoPreview} alt="avatar" />
              : <UserIcon />}
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <div className="profile-page">

        {/* ── LEFT SIDEBAR ── */}
        <div className="sidebar">
          <div className="profile-card">

            {/* Avatar + name + rating */}
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <div className="avatar-circle" onClick={() => fileRef.current.click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="profile" />
                    : <UserIcon />}
                </div>
                <div className="avatar-upload-btn" onClick={() => fileRef.current.click()}>✏</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="profile-name">{full_name}</div>

              <div className="profile-rating">
                <Stars rating={rating} />
                <span className="rating-text">{rating} ({reviews} reviews)</span>
              </div>

              <div className="profile-meta">
                <div className="meta-item">📍 {location}</div>
                <div className="meta-item">📅 Member since {memberSince}</div>
              </div>

              <button className="edit-profile-btn" onClick={openEdit}>
                ✏ Edit Profile
              </button>
              <button className="edit-profile-btn" onClick={openPasswordEdit} style={{ marginTop: "10px" }}>
                🔒 Change Password
              </button>
            </div>

            {/* As Tasker stats */}
            <div className="stats-section">
              <div className="stats-section-title">As Tasker</div>
              <div className="stat-row">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">{taskerStats.completed}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value">{taskerStats.successRate}</span>
              </div>
            </div>

            {/* As Task Poster stats */}
            <div className="stats-section">
              <div className="stats-section-title">As Task Poster</div>
              <div className="stat-row">
                <span className="stat-label">Tasks Posted</span>
                <span className="stat-value">{posterStats.posted}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Tasks Completed</span>
                <span className="stat-value">{posterStats.completed}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avg Response Time</span>
                <span className="stat-value">{posterStats.avgResponse}</span>
              </div>
            </div>

            {/* Contact info */}
            {(email || phone) && (
              <div className="contact-section">
                {email && <div className="contact-item">✉ {email}</div>}
                {phone && <div className="contact-item">📞 {phone}</div>}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div className="right-content">

          {/* About Me */}
          <div className="card">
            <div className="section-title">About Me</div>
            <p className="about-text">{about}</p>
          </div>

          {/* Skills & Services */}
          {skillList.length > 0 && (
            <div className="card">
              <div className="section-title">Skills &amp; Services</div>
              <div className="skills-grid">
                {skillList.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <div className="section-title">Reviews</div>
            <div className="review-tabs">
              <button
                className={`review-tab ${activeTab === "tasker" ? "active" : ""}`}
                onClick={() => setActiveTab("tasker")}
              >
                As Tasker ({mockTaskerReviews.length})
              </button>
              <button
                className={`review-tab ${activeTab === "poster" ? "active" : ""}`}
                onClick={() => setActiveTab("poster")}
              >
                As Poster ({mockPosterReviews.length})
              </button>
            </div>

            {reviewsToShow.map(review => (
              <div key={review.id} className="review-item">
                <div className="reviewer-header">
                  <div className="reviewer-avatar">
                    <UserIcon />
                  </div>
                  <div>
                    <div className="reviewer-name">{review.name}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                </div>
                <div className="review-stars"><Stars rating={review.rating} /></div>
                <p className="review-text">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="modal-card">
            <div className="modal-title">Edit Profile</div>

            {saveMsg && (
              <div className={`alert-bar ${saveMsg.startsWith("success") ? "success" : "error"}`}>
                {saveMsg.startsWith("success") ? "✓" : "⚠"} {saveMsg.replace(/^(success|error):/, "")}
              </div>
            )}

            <div className="modal-field">
              <label className="modal-label">Full Name</label>
              <input className="modal-input" value={editData.full_name}
                onChange={e => setEditData(p => ({ ...p, full_name: e.target.value }))} />
            </div>

            <div className="modal-field">
              <label className="modal-label">About Me</label>
              <textarea className="modal-textarea" value={editData.bio}
                onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn-save" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPasswordEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPasswordEdit(false)}>
          <div className="modal-card">
            <div className="modal-title">Change Password</div>

            <div className="modal-field" style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <label className="modal-label">Old Password</label>
              <input
                className="modal-input"
                type="password"
                value={passwordData.oldPassword}
                onChange={e => setPasswordData(p => ({ ...p, oldPassword: e.target.value }))}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">New Password</label>
              <input
                className="modal-input"
                type="password"
                value={passwordData.password}
                onChange={e => setPasswordData(p => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Confirm New Password</label>
              <input
                className="modal-input"
                type="password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
              />
            </div>

            {passwordMsg && (
              <div className={`alert-bar ${passwordMsg.startsWith("success") ? "success" : "error"}`}>
                {passwordMsg.startsWith("success") ? "✓" : "⚠"} {passwordMsg.replace(/^(success|error):/, "")}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPasswordEdit(false)}>Cancel</button>
              <button className="btn-save" onClick={savePassword} disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}