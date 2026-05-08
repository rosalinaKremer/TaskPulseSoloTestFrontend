import { useState, useEffect, useRef, useCallback } from "react";
import "../css/Profile.css";
import { apiGetProfile, apiUpdateProfile } from "../Api";

const API_BASE = "http://localhost:8080/api/user";
const TASK_API_BASE = "http://localhost:8080/api/tasks";
const ENDPOINTS = {
  uploadPhoto:   `${API_BASE}/upload-photo`,
  updatePassword:`${API_BASE}/updatepassword`,
  userReviews:   `${TASK_API_BASE}/user-reviews`,
};

function apiHeaders(token) {
  return { "Authorization": "Bearer " + token, "Content-Type": "application/json" };
}

function resolvePhotoSrc(profile) {
  const url = profile?.photo_url;
  if (url) return url;
  const rawPhoto = profile?.photo;
  if (!rawPhoto) return null;
  if (typeof rawPhoto === "string" && rawPhoto.startsWith("data:image/")) return rawPhoto;
  return `data:image/jpeg;base64,${rawPhoto}`;
}

function Stars({ rating }) {
  return (
    <span className="tp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

function UserIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function Profile({ user, token, onLogout, onBack, isReadOnly }) {
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

  // New States for Real Reviews
  const [taskerReviews, setTaskerReviews] = useState([]);
  const [posterReviews, setPosterReviews] = useState([]);

  function unwrapApiData(payload) {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      if (payload.success === false) throw new Error(payload.error || "Request failed");
      if (Object.prototype.hasOwnProperty.call(payload, "data")) return payload.data;
      if (Object.prototype.hasOwnProperty.call(payload, "error")) throw new Error(payload.error || "Request failed");
    }
    return payload;
  }

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Basic Profile Data
      const raw = await apiGetProfile(token, user); 
      const data = unwrapApiData(raw);
      let p;
      if (Array.isArray(data)) {
        const currentUserEmail = (user || "").toLowerCase();
        p = data.find(row => (row?.email || "").toLowerCase() === currentUserEmail) || data[0];
      } else {
        p = data;
      }
      if (!p) throw new Error("No profile found.");
      setProfile(p);
      setPhotoPreview(resolvePhotoSrc(p));

      // 2. Fetch Real Reviews
      try {
        const revRes = await fetch(`${ENDPOINTS.userReviews}?email=${user}`, { headers: apiHeaders(token) });
        if (revRes.ok) {
          const revData = await revRes.json();
          setTaskerReviews(revData.asTasker || []);
          setPosterReviews(revData.asPoster || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }

    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Cannot connect to server." : e.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function openEdit() {
    setEditData({ full_name: profile?.full_name || "", bio: profile?.bio || "" });
    setSaveMsg("");
    setShowEdit(true);
  }

  function openPasswordEdit() {
    setPasswordData({ oldPassword: "", password: "", confirmPassword: "" });
    setPasswordMsg("");
    setShowPasswordEdit(true);
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = { full_name: editData.full_name, fullName: editData.full_name, bio: editData.bio };
      const raw = await apiUpdateProfile(token, user, payload);
      const updated = unwrapApiData(raw);
      if (Array.isArray(updated) && updated.length === 0) throw new Error("No rows were updated.");

      const updatedRow = Array.isArray(updated) ? updated[0] : updated;
      if (updatedRow && typeof updatedRow === "object") setProfile(prev => ({ ...(prev || {}), ...updatedRow }));
      else setProfile(prev => ({ ...(prev || {}), ...payload }));

      setSaveMsg("success:Profile updated successfully!");
      await fetchProfile();
      setTimeout(() => setShowEdit(false), 1000);
    } catch (e) {
      setSaveMsg("error:" + (e.message === "Failed to fetch" ? "Cannot connect to server." : e.message));
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    setPasswordMsg("");
    if (!passwordData.oldPassword) return setPasswordMsg("error:Please enter your old password.");
    if (!passwordData.password || !passwordData.confirmPassword) return setPasswordMsg("error:Please enter and confirm your new password.");
    if (passwordData.password !== passwordData.confirmPassword) return setPasswordMsg("error:Passwords do not match.");
    if (passwordData.oldPassword === passwordData.password) return setPasswordMsg("error:New password must be different from old password.");
    if (passwordData.password.length < 6) return setPasswordMsg("error:Password must be at least 6 characters.");

    setPasswordSaving(true);
    try {
      const res = await fetch(ENDPOINTS.updatePassword, {
        method: "PUT",
        headers: apiHeaders(token),
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.password, password: passwordData.password }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}: ${await res.text() || res.statusText}`);
      
      unwrapApiData(await res.json());
      setPasswordMsg("success:Password updated successfully!");
      setPasswordData({ oldPassword: "", password: "", confirmPassword: "" });
    } catch (e) {
      setPasswordMsg("error:" + e.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("email", user);

    try {
      const res = await fetch(ENDPOINTS.uploadPhoto, { method: "POST", headers: { "Authorization": "Bearer " + token }, body: formData });
      if (!res.ok) throw new Error(`Server ${res.status}: ${await res.text() || res.statusText}`);
      await fetchProfile();
    } catch (e) {
      alert("Photo upload failed: " + e.message);
    }
  }

  // Calculate Dynamic Ratings based on REAL database reviews
  const allReviews = [...taskerReviews, ...posterReviews];
  const reviewsCount = allReviews.length;
  const computedRating = reviewsCount > 0 
    ? (allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviewsCount).toFixed(1) 
    : 0;

  const rating    = computedRating > 0 ? computedRating : (profile?.rating || 0);
  const location  = profile?.location || "Cebu City, Philippines";
  const memberSince = profile?.member_since || "2024";
  const full_name = profile?.full_name || profile?.fullName || profile?.email?.split("@")[0] || "Your Name";
  const about     = profile?.bio || "No bio yet. Click Edit Profile to add one and let your community know what you can do!";
  const skillsRaw = profile?.skills || "General Help, Organization";
  const skillList = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  // Real Statistics
  const taskerStats = { completed: taskerReviews.length, successRate: taskerReviews.length > 0 ? "100%" : "0%" };
  const posterStats = { posted: posterReviews.length, avgResponse: "Within 24 hrs" };

  const reviewsToShow = activeTab === "tasker" ? taskerReviews : posterReviews;

  if (loading) return (
    <div className="tp-profile-root">
      <header className="tp-profile-header"><div className="tp-brand">TaskPulse</div></header>
      <div className="tp-loading-state"><div className="tp-spinner" /> Loading profile...</div>
    </div>
  );

  if (error) return (
    <div className="tp-profile-root">
      <header className="tp-profile-header"><div className="tp-brand">TaskPulse</div></header>
      <div className="tp-error-state">
        <div className="tp-error-icon">⚠</div>
        <h2>Oops, something went wrong</h2>
        <p>{error}</p>
        <div className="tp-error-actions">
          <button onClick={fetchProfile} className="tp-btn-secondary">Try Again</button>
          <button onClick={onBack} className="tp-btn-primary">Return Home</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tp-profile-root">
      <header className="tp-profile-header">
        <div className="tp-brand">TaskPulse</div>
        <div className="tp-header-actions">
          {onBack && <button className="tp-header-btn-text" onClick={onBack}>← Back to Feed</button>}
          {onLogout && <button className="tp-header-btn-outline" onClick={onLogout}>Logout</button>}
        </div>
      </header>

      <main className="tp-profile-main">
        <div className="tp-hero-card">
          <div className="tp-hero-banner"></div>
          <div className="tp-hero-content">
            <div className="tp-avatar-container">
              <div className="tp-avatar-ring">
                {photoPreview ? <img src={photoPreview} alt="avatar" /> : <UserIcon />}
              </div>
              {!isReadOnly && (
                <>
                  <button className="tp-avatar-edit-btn" onClick={() => fileRef.current.click()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                </>
              )}
            </div>

            <div className="tp-hero-info">
              <h1 className="tp-hero-name">{full_name}</h1>
              <div className="tp-hero-badges">
                <span className="tp-badge-location">📍 {location}</span>
                <span className="tp-badge-date">🗓 Member since {memberSince}</span>
              </div>
              <div className="tp-hero-rating">
                {rating > 0 ? (
                  <>
                    <Stars rating={rating} />
                    <span className="tp-rating-text">{rating} ({reviewsCount} reviews)</span>
                  </>
                ) : (
                  <span className="tp-rating-text" style={{color: '#94a3b8', fontStyle: 'italic'}}>No reviews yet</span>
                )}
              </div>
            </div>

            <div className="tp-hero-actions">
                {!isReadOnly && (
                  <>
                    <button className="tp-btn-primary" onClick={openEdit}>Edit Profile</button>
                    <button className="tp-btn-secondary" onClick={openPasswordEdit}>Security</button>
                  </>
                )}
            </div>
          </div>
        </div>

        <div className="tp-metrics-grid">
          <div className="tp-metric-card">
            <div className="tp-metric-val">{taskerStats.completed}</div>
            <div className="tp-metric-label">Tasks Done</div>
          </div>
          <div className="tp-metric-card">
            <div className="tp-metric-val">{taskerStats.successRate}</div>
            <div className="tp-metric-label">Success Rate</div>
          </div>
          <div className="tp-metric-card">
            <div className="tp-metric-val">{posterStats.posted}</div>
            <div className="tp-metric-label">Tasks Posted</div>
          </div>
          <div className="tp-metric-card">
            <div className="tp-metric-val">{posterStats.avgResponse}</div>
            <div className="tp-metric-label">Avg Response</div>
          </div>
        </div>

        <div className="tp-content-split">
          <div className="tp-split-left">
            <div className="tp-card tp-about-card">
              <h2>About Me</h2>
              <p>{about}</p>
            </div>
            {skillList.length > 0 && (
              <div className="tp-card tp-skills-card">
                <h2>Verified Skills</h2>
                <div className="tp-skills-wrap">
                  {skillList.map((skill, i) => <span key={i} className="tp-skill-pill">{skill}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="tp-split-right">
            <div className="tp-card tp-reviews-card">
              <div className="tp-reviews-header">
                <h2>Community Reviews</h2>
                <div className="tp-review-toggles">
                  <button className={activeTab === "tasker" ? "active" : ""} onClick={() => setActiveTab("tasker")}>As Tasker</button>
                  <button className={activeTab === "poster" ? "active" : ""} onClick={() => setActiveTab("poster")}>As Poster</button>
                </div>
              </div>

              <div className="tp-reviews-list">
                {reviewsToShow.length === 0 ? (
                  <div className="tp-no-reviews">No reviews yet.</div>
                ) : (
                  reviewsToShow.map(review => (
                    <div key={review.id} className="tp-review-item">
                      <div className="tp-reviewer-row">
                        <div className="tp-reviewer-pic">
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold' }}>
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="tp-reviewer-info">
                          <h4 style={{marginBottom: '0.1rem'}}>{review.name}</h4>
                          <span style={{fontSize: '0.75rem', color: '#64748b'}}>Task: {review.taskTitle} • {review.date}</span>
                        </div>
                        <div className="tp-review-score" style={{marginLeft: 'auto'}}><Stars rating={review.rating} /></div>
                      </div>
                      <p className="tp-review-body" style={{marginTop: '0.75rem'}}>"{review.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Edit Profile Modal ── */}
      {showEdit && (
        <div className="tp-modal-overlay" onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="tp-modal">
            <h2>Edit Profile</h2>
            {saveMsg && (
              <div className={`tp-alert ${saveMsg.startsWith("success") ? "success" : "error"}`}>
                {saveMsg.replace(/^(success|error):/, "")}
              </div>
            )}
            <div className="tp-input-group">
              <label>Full Name</label>
              <input value={editData.full_name} onChange={e => setEditData(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div className="tp-input-group">
              <label>About Me</label>
              <textarea value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} />
            </div>
            <div className="tp-modal-actions">
              <button className="tp-btn-text" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="tp-btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPasswordEdit && (
        <div className="tp-modal-overlay" onClick={e => e.target === e.currentTarget && setShowPasswordEdit(false)}>
          <div className="tp-modal">
            <h2>Security Settings</h2>
            {passwordMsg && (
              <div className={`tp-alert ${passwordMsg.startsWith("success") ? "success" : "error"}`}>
                {passwordMsg.replace(/^(success|error):/, "")}
              </div>
            )}
            <div className="tp-input-group" style={{marginTop: "1.5rem"}}>
              <label>Current Password</label>
              <input type="password" value={passwordData.oldPassword} onChange={e => setPasswordData(p => ({ ...p, oldPassword: e.target.value }))} />
            </div>
            <div className="tp-input-group">
              <label>New Password</label>
              <input type="password" value={passwordData.password} onChange={e => setPasswordData(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="tp-input-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            <div className="tp-modal-actions">
              <button className="tp-btn-text" onClick={() => setShowPasswordEdit(false)}>Cancel</button>
              <button className="tp-btn-primary" onClick={savePassword} disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}