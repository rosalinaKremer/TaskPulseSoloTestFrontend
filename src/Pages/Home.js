import { useState, useEffect, useRef } from "react";
import "../css/Home.css";
import Profile from "./Profile";

const HOME_VIEW_KEY = "taskpulse.homeView";
const API_BASE = "http://localhost:8080/api/tasks";

function CategoryIcon({ name }) {
  const svgProps = { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    "all-tasks": <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    "cleaning": <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    "plumbing": <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
    "electrical": <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    "delivery": <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    "tutoring": <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    "gardening": <><path d="M12 22V12"/><path d="M12 12A4 4 0 0 0 8 8V4h4a4 4 0 0 1 4 4"/><path d="M12 16a4 4 0 0 0 4-4v-4h-4a4 4 0 0 0-4 4"/></>,
    "carpentry": <><rect x="3" y="8" width="18" height="6" rx="2"/><line x1="12" y1="14" x2="12" y2="22"/></>,
    "moving": <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    "pets": <><path d="M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/><path d="M18.5 10c-1.38 0-2.5-1.12-2.5-2.5S17.12 5 18.5 5 21 6.12 21 7.5 19.88 10 18.5 10z"/><path d="M5.5 10C4.12 10 3 8.88 3 7.5S4.12 5 5.5 5 8 6.12 8 7.5 6.88 10 5.5 10z"/><path d="M12 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 2 12 2s2.5 1.12 2.5 2.5S13.38 7 12 7z"/></>
  };
  return <svg {...svgProps}>{icons[name] || icons["all-tasks"]}</svg>;
}

const categories = [
  { name: "All Tasks", iconId: "all-tasks" },
  { name: "Home Cleaning", iconId: "cleaning" },
  { name: "Plumbing", iconId: "plumbing" },
  { name: "Electrical", iconId: "electrical" },
  { name: "Delivery", iconId: "delivery" },
  { name: "Tutoring", iconId: "tutoring" },
  { name: "Gardening", iconId: "gardening" },
  { name: "Carpentry", iconId: "carpentry" },
  { name: "Moving", iconId: "moving" },
  { name: "Pet Care", iconId: "pets" },
];

export default function Home({ user, token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showProfile, setShowProfile] = useState(() => localStorage.getItem(HOME_VIEW_KEY) === "profile");
  const [viewingProfile, setViewingProfile] = useState(null); 
  const [appMode, setAppMode] = useState("tasker"); 

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Tasks");
  const categoryScrollRef = useRef(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterMinBudget, setFilterMinBudget] = useState("");
  const [filterMaxBudget, setFilterMaxBudget] = useState("");
  const [filterUrgent, setFilterUrgent] = useState(false);

  // Modals
  const [taskModal, setTaskModal] = useState({ isOpen: false, mode: 'create', id: null });
  const [taskForm, setTaskForm] = useState({ 
    title: "", category: "Home Cleaning", location: "", price: "", description: "", urgent: false,
    startDate: "", endDate: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bidModal, setBidModal] = useState({ isOpen: false, mode: 'create', task: null, bidId: null });
  const [bidForm, setBidForm] = useState({ amount: "", coverLetter: "" });

  const [reviewBidsModal, setReviewBidsModal] = useState({ isOpen: false, task: null, bidsList: [] });
  const [viewTaskModal, setViewTaskModal] = useState({ isOpen: false, task: null });
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, task: null, file: null, preview: null });

  // NEW: Rating/Review Modal States
  const [leaveReviewModal, setLeaveReviewModal] = useState({ isOpen: false, role: '', task: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers = { "Authorization": "Bearer " + token };
      
      const tasksRes = await fetch(`${API_BASE}/available`, { headers });
      const tasksData = await tasksRes.json();
      if (Array.isArray(tasksData)) setTasks(tasksData);

      const postsRes = await fetch(`${API_BASE}/my-posts?email=${user}`, { headers });
      const postsData = await postsRes.json();
      if (Array.isArray(postsData)) setMyPosts(postsData);

      const bidsRes = await fetch(`http://localhost:8080/api/bids/my-bids?email=${user}`, { headers });
      const bidsData = await bidsRes.json();
      if (Array.isArray(bidsData)) setMyBids(bidsData);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // API Callbacks
  const handleSaveTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = taskModal.mode === 'edit';
      const url = isEdit ? `${API_BASE}/${taskModal.id}?email=${user}` : `${API_BASE}?email=${user}`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(taskForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      closeTaskModal();
      await loadData(); 
    } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const handleSaveBid = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = bidModal.mode === 'edit';
      const url = isEdit 
        ? `http://localhost:8080/api/bids/${bidModal.bidId}?email=${user}` 
        : `http://localhost:8080/api/bids/task/${bidModal.task.id}?email=${user}`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(bidForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setBidModal({ isOpen: false, mode: 'create', task: null, bidId: null });
      setBidForm({ amount: "", coverLetter: "" });
      await loadData(); 
    } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const handleCancelBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to withdraw your bid?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${bidId}?email=${user}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await loadData();
    } catch (err) { alert(err.message); }
  };

  const handleOpenReviewBids = async (task) => {
    try {
      const res = await fetch(`http://localhost:8080/api/bids/task/${task.id}?email=${user}`, { headers: { "Authorization": "Bearer " + token } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setReviewBidsModal({ isOpen: true, task: task, bidsList: data.bids || [] });
    } catch (err) { alert("Failed to fetch bids: " + err.message); }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to hire this person?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${bidId}/accept?email=${user}`, { method: "POST", headers: { "Authorization": "Bearer " + token } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert("Bid accepted! The task is now in progress.");
      setReviewBidsModal({ isOpen: false, task: null, bidsList: [] });
      await loadData();
    } catch (err) { alert("Failed to accept bid: " + err.message); }
  };

  const handleVerifyPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVerifyModal(prev => ({ ...prev, file: file, preview: URL.createObjectURL(file) }));
    }
  };

  const submitTaskVerification = async (e) => {
    e.preventDefault();
    if (!verifyModal.file) return alert("Please select a photo to verify your work.");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("photo", verifyModal.file);

      const res = await fetch(`${API_BASE}/${verifyModal.task.id}/verify-finish?email=${user}`, { 
        method: "POST", 
        headers: { "Authorization": "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert("Verification submitted! The Poster will review it shortly.");
      setVerifyModal({ isOpen: false, task: null, file: null, preview: null });
      await loadData();
    } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  // NEW: Submit Review logic for both Poster and Tasker
  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.text) return alert("Please write a short review.");
    setIsSubmitting(true);
    try {
      const isPoster = leaveReviewModal.role === 'poster';
      const endpoint = isPoster ? 'confirm' : 'rate-poster';
      const url = `${API_BASE}/${leaveReviewModal.task.id}/${endpoint}?email=${user}&rating=${reviewForm.rating}&reviewText=${encodeURIComponent(reviewForm.text)}`;
      
      const res = await fetch(url, { method: "POST", headers: { "Authorization": "Bearer " + token } });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      alert(isPoster ? "Payment confirmed and Review Submitted!" : "Review Submitted!");
      setLeaveReviewModal({ isOpen: false, role: '', task: null });
      await loadData();
    } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const openCreateModal = () => {
    setTaskForm({ title: "", category: "Home Cleaning", location: "", price: "", description: "", urgent: false, startDate: "", endDate: "" });
    setTaskModal({ isOpen: true, mode: 'create', id: null });
  };

  const openEditModal = (task) => {
    setTaskForm({ 
      title: task.title, category: task.category, location: task.location, price: task.price, 
      description: task.description, urgent: task.urgent,
      startDate: task.startDate ? task.startDate.split('T')[0] : "", 
      endDate: task.endDate ? task.endDate.split('T')[0] : "" 
    });
    setTaskModal({ isOpen: true, mode: 'edit', id: task.id });
  };

  const closeTaskModal = () => setTaskModal({ isOpen: false, mode: 'create', id: null });

  function scrollCategories(direction) {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: direction === "left" ? -250 : 250, behavior: "smooth" });
    }
  }

  function clearFilters() { setFilterMinBudget(""); setFilterMaxBudget(""); setFilterUrgent(false); }
  const hasActiveFilters = filterMinBudget || filterMaxBudget || filterUrgent;

  const handleBackFromProfile = () => {
    setViewingProfile(null);
    setShowProfile(false);
    localStorage.setItem(HOME_VIEW_KEY, "home");
  };

  if (viewingProfile) return <Profile user={viewingProfile} token={token} onBack={handleBackFromProfile} isReadOnly={true} />;
  if (showProfile) return <Profile user={user} token={token} onLogout={onLogout} onBack={handleBackFromProfile} />;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((p) => {
    const matchesQuery = !normalizedQuery || p.title.toLowerCase().includes(normalizedQuery) || p.location.toLowerCase().includes(normalizedQuery);
    const matchesCategory = activeCategory === "All Tasks" || p.category === activeCategory;
    const min = filterMinBudget ? Number(filterMinBudget) : 0;
    const max = filterMaxBudget ? Number(filterMaxBudget) : Infinity;
    const matchesBudget = p.price >= min && p.price <= max;
    const matchesUrgent = !filterUrgent || p.urgent === true;
    return matchesQuery && matchesCategory && matchesBudget && matchesUrgent;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="tp-feed-root">
      {/* ── Top Header ── */}
      <header className="tp-feed-header">
        <div className="tp-feed-brand">TaskPulse</div>
        <div className="tp-mode-toggle">
          <button className={`tp-mode-btn ${appMode === 'tasker' ? 'active' : ''}`} onClick={() => setAppMode('tasker')}>Find Work</button>
          <button className={`tp-mode-btn ${appMode === 'poster' ? 'active' : ''}`} onClick={() => setAppMode('poster')}>My Posts</button>
          <button className={`tp-mode-btn ${appMode === 'my-bids' ? 'active' : ''}`} onClick={() => setAppMode('my-bids')}>My Bids</button>
        </div>
        <div className="tp-feed-actions">
          <button className="tp-feed-post-btn" onClick={openCreateModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span className="hide-mobile">New Task</span>
          </button>
          <button className="tp-feed-avatar" onClick={() => { setShowProfile(true); localStorage.setItem(HOME_VIEW_KEY, "profile"); }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </button>
        </div>
      </header>

      {/* ── Search & Filter Strip ── */}
      {appMode === 'tasker' && (
        <div className="tp-filter-strip-container">
          <div className="tp-filter-strip">
            <div className="tp-feed-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input type="text" placeholder="Search tasks or locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="tp-category-wrapper">
              <button className="tp-scroll-arrow left" onClick={() => scrollCategories('left')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
              <div className="tp-category-scroll" ref={categoryScrollRef}>
                {categories.map((cat) => (
                  <button key={cat.name} className={`tp-cat-pill ${activeCategory === cat.name ? 'active' : ''}`} onClick={() => setActiveCategory(cat.name)}>
                    <span className="tp-cat-pill-icon" style={{display: 'flex', alignItems: 'center'}}><CategoryIcon name={cat.iconId} /></span>{cat.name}
                  </button>
                ))}
              </div>
              <button className="tp-scroll-arrow right" onClick={() => scrollCategories('right')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            </div>
            <button className={`tp-advanced-filter-btn ${hasActiveFilters ? 'has-filters' : ''}`} onClick={() => setShowFilters(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              Filters {hasActiveFilters && <span className="tp-filter-dot"></span>}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="tp-feed-main">
        {/* VIEW 1: FIND WORK (Tasker) */}
        {appMode === 'tasker' && (
          <>
            <div className="tp-feed-header-text">
              <h2>{activeCategory === "All Tasks" ? "Latest Opportunities" : `${activeCategory} Tasks`}</h2>
              <p>{isLoading ? "Loading tasks..." : `${filteredTasks.length} tasks available`}</p>
            </div>
            <div className="tp-feed-grid">
              {!isLoading && filteredTasks.map((p) => {
                const userBid = myBids.find(b => b.task.id === p.id); 
                return (
                  <article key={p.id} className="tp-gig-card" onClick={() => setViewTaskModal({ isOpen: true, task: p })}>
                    <div className="tp-gig-top">
                      <div className="tp-gig-meta"><span className="tp-gig-cat">{p.category}</span><span className="tp-gig-time">• {p.time}</span></div>
                      {p.urgent && <span className="tp-gig-urgent">Urgent</span>}
                    </div>
                    <h3 className="tp-gig-title">{p.title}</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{p.description}</p>
                    <div className="tp-gig-location" style={{ marginBottom: '0.5rem' }}>🗓 {formatDate(p.startDate)} - {formatDate(p.endDate)}</div>
                    <div className="tp-gig-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{p.location}</div>
                    
                    <div className="tp-gig-bottom" onClick={(e) => e.stopPropagation()}>
                      <div className="tp-gig-price-info"><div className="tp-gig-price">₱{Number(p.price).toLocaleString()}</div></div>
                      {p.creatorEmail === user ? (
                        <button className="tp-gig-action-btn" style={{background: '#f1f5f9', color: '#0f172a'}} onClick={() => openEditModal(p)}>Edit Task</button>
                      ) : userBid ? (
                        <button className="tp-gig-action-btn" style={{background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed'}} disabled>Bid Placed</button>
                      ) : (
                        <button className="tp-gig-action-btn" onClick={() => { setBidForm({ amount: p.price, coverLetter: "" }); setBidModal({ isOpen: true, mode: 'create', task: p, bidId: null }); }}>Place Bid</button>
                      )}
                    </div>
                  </article>
                );
              })}
              {!isLoading && filteredTasks.length === 0 && (
                <div className="tp-feed-empty"><div className="tp-feed-empty-icon">🍃</div><h3>No tasks found</h3><button className="tp-feed-post-btn" style={{marginTop: "1.5rem", width: "auto"}} onClick={clearFilters}>Clear All Filters</button></div>
              )}
            </div>
          </>
        )}

        {/* VIEW 2: MY POSTS (Poster) */}
        {appMode === 'poster' && (
          <div className="tp-poster-dashboard">
            <div className="tp-poster-header">
              <h2>Your Posted Tasks</h2>
              <p>Manage your requests and review bids from local Taskers.</p>
            </div>
            <div className="tp-feed-grid">
              {myPosts.map(p => (
                 <article key={p.id} className="tp-gig-card" onClick={() => setViewTaskModal({ isOpen: true, task: p })}>
                  <div className="tp-gig-top">
                    <div className="tp-gig-meta">
                      <span className="tp-gig-cat">{p.category}</span>
                      {p.status === 'COMPLETED' && <span className="tp-gig-time" style={{color: '#10b981', fontWeight: 600}}>• Closed</span>}
                      {p.status === 'REVIEW' && <span className="tp-gig-time" style={{color: '#f59e0b', fontWeight: 600}}>• Review Needed</span>}
                      {p.status === 'IN_PROGRESS' && <span className="tp-gig-time" style={{color: '#3b82f6', fontWeight: 600}}>• In Progress</span>}
                    </div>
                    {p.urgent && <span className="tp-gig-urgent">Urgent</span>}
                  </div>
                  <h3 className="tp-gig-title">{p.title}</h3>
                  <div className="tp-gig-location" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>🗓 {formatDate(p.startDate)} - {formatDate(p.endDate)}</div>
                  
                  <div className="tp-gig-bottom" style={{borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start'}} onClick={(e) => e.stopPropagation()}>
                    <div className="tp-gig-price-info" style={{width: '100%'}}>
                      <div className="tp-gig-price">₱{Number(p.price).toLocaleString()}</div>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem'}}>
                      {p.status === 'COMPLETED' ? (
                        <button className="tp-gig-action-btn" style={{flex: 1, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed'}} disabled>Task Completed</button>
                      ) : p.status === 'REVIEW' ? (
                        <button className="tp-gig-action-btn" style={{flex: 1, background: '#10b981'}} onClick={() => setViewTaskModal({ isOpen: true, task: p })}>Review Work</button>
                      ) : p.assignedToEmail ? (
                        <button className="tp-gig-action-btn" style={{flex: 1, background: '#e2e8f0', color: '#64748b', cursor: 'not-allowed'}} disabled>In Progress</button>
                      ) : (
                        <>
                          <button className="tp-gig-action-btn" style={{flex: 1, background: '#f1f5f9', color: '#0f172a'}} onClick={() => openEditModal(p)}>Edit</button>
                          <button className="tp-gig-action-btn" style={{flex: 1}} onClick={() => handleOpenReviewBids(p)}>Review Bids</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              {myPosts.length === 0 && <div className="tp-feed-empty"><div className="tp-feed-empty-icon">📝</div><h3>You haven't posted any tasks yet</h3><button className="tp-feed-post-btn" style={{marginTop: '1.5rem', width: 'auto'}} onClick={openCreateModal}>Create Your First Post</button></div>}
            </div>
          </div>
        )}

        {/* VIEW 3: MY BIDS (Tasker Tracker) */}
        {appMode === 'my-bids' && (
          <div className="tp-poster-dashboard">
            <div className="tp-poster-header">
              <h2>My Active Bids</h2>
              <p>Track the status of the tasks you've offered to help with.</p>
            </div>
            <div className="tp-feed-grid">
              {myBids.map(bid => (
                 <article key={bid.id} className="tp-gig-card" onClick={() => setViewTaskModal({ isOpen: true, task: bid.task })}>
                  <div className="tp-gig-top">
                    <div className="tp-gig-meta">
                       <span className="tp-gig-cat" style={{ color: bid.status === 'PENDING' ? '#f59e0b' : bid.status === 'ACCEPTED' ? '#10b981' : '#ef4444', background: bid.status === 'PENDING' ? '#fef3c7' : bid.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2', border: 'none' }}>
                         {bid.status}
                       </span>
                       {bid.task.status === 'REVIEW' && <span style={{marginLeft: 'auto', fontSize: '0.7rem', color: '#64748b'}}>Under Review</span>}
                       {bid.task.status === 'COMPLETED' && <span style={{marginLeft: 'auto', fontSize: '0.7rem', color: '#10b981'}}>Paid</span>}
                    </div>
                  </div>
                  <h3 className="tp-gig-title">{bid.task.title}</h3>
                  <div className="tp-gig-location" style={{marginBottom: '0.5rem', fontSize: '0.8rem'}}>🗓 {formatDate(bid.task.startDate)} - {formatDate(bid.task.endDate)}</div>
                  <div className="tp-gig-location" style={{marginBottom: '1rem'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {bid.task.location}
                  </div>
                  
                  <div className="tp-gig-bottom" style={{borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start'}} onClick={(e) => e.stopPropagation()}>
                    <div className="tp-gig-price-info" style={{width: '100%'}}>
                      <div className="tp-gig-bids">Poster's Budget: ₱{Number(bid.task.price).toLocaleString()}</div>
                      <div className="tp-gig-price" style={{fontSize: '1.1rem'}}>Your Offer: ₱{Number(bid.amount).toLocaleString()}</div>
                    </div>
                    {bid.status === 'ACCEPTED' && bid.task.status === 'IN_PROGRESS' && (
                        <button className="tp-gig-action-btn" style={{width: '100%', marginTop: '0.5rem', background: '#3b82f6', color: 'white'}} onClick={() => setVerifyModal({ isOpen: true, task: bid.task, file: null, preview: null })}>Upload Work Proof</button>
                    )}
                    {/* NEW: Allow Tasker to rate Poster if Completed and not rated yet */}
                    {bid.status === 'ACCEPTED' && bid.task.status === 'COMPLETED' && !bid.task.taskerToPosterRating && (
                        <button className="tp-gig-action-btn" style={{width: '100%', marginTop: '0.5rem', background: '#f59e0b', color: 'white'}} onClick={() => { setLeaveReviewModal({ isOpen: true, role: 'tasker', task: bid.task }); setReviewForm({ rating: 5, text: "" }); }}>Rate the Poster</button>
                    )}
                    {bid.status === 'PENDING' && (
                      <div style={{display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem'}}>
                        <button className="tp-gig-action-btn" style={{flex: 1, background: '#f1f5f9', color: '#0f172a'}} onClick={() => { setBidForm({ amount: bid.amount, coverLetter: bid.coverLetter }); setBidModal({ isOpen: true, mode: 'edit', task: bid.task, bidId: bid.id }); }}>Edit</button>
                        <button className="tp-gig-action-btn" style={{flex: 1, background: '#fee2e2', color: '#b91c1c'}} onClick={() => handleCancelBid(bid.id)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {myBids.length === 0 && <div className="tp-feed-empty"><div className="tp-feed-empty-icon">🤝</div><h3>You haven't bid on anything yet</h3><button className="tp-feed-post-btn" style={{marginTop: '1.5rem', width: 'auto'}} onClick={() => setAppMode('tasker')}>Browse Tasks</button></div>}
            </div>
          </div>
        )}
      </main>

      {/* ── CREATE / EDIT TASK MODAL ── */}
      {taskModal.isOpen && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeTaskModal()}>
          <div className="tp-filter-modal">
            <div className="tp-filter-modal-header"><h2>{taskModal.mode === 'edit' ? 'Edit Task' : 'Post a New Task'}</h2><button className="tp-close-btn" onClick={closeTaskModal}>✕</button></div>
            <form onSubmit={handleSaveTask} className="tp-filter-body">
              <div className="tp-input-group"><label>Task Title</label><input required type="text" placeholder="e.g. Fix leaking kitchen pipe" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} /></div>
              <div className="tp-input-group"><label>Category</label><select value={taskForm.category} onChange={e => setTaskForm({...taskForm, category: e.target.value})}>{categories.filter(c => c.name !== "All Tasks").map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}</select></div>
              <div className="tp-form-row">
                <div className="tp-input-group flex-1"><label>Start Date</label><input required type="date" value={taskForm.startDate} onChange={e => setTaskForm({...taskForm, startDate: e.target.value})} /></div>
                <div className="tp-input-group flex-1"><label>Completion Date</label><input required type="date" value={taskForm.endDate} onChange={e => setTaskForm({...taskForm, endDate: e.target.value})} /></div>
              </div>
              <div className="tp-form-row">
                <div className="tp-input-group flex-1"><label>Location</label><input required type="text" placeholder="e.g. Cebu City" value={taskForm.location} onChange={e => setTaskForm({...taskForm, location: e.target.value})} /></div>
                <div className="tp-input-group flex-1"><label>Price (₱)</label><input required type="number" min="1" placeholder="e.g. 500" value={taskForm.price} onChange={e => setTaskForm({...taskForm, price: e.target.value})} /></div>
              </div>
              <div className="tp-input-group"><label>Description details</label><textarea required placeholder="Describe what you need help with..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} /></div>
              <label className="tp-checkbox-label" style={{marginTop: '0.5rem'}}><div className="tp-checkbox-text"><span className="tp-checkbox-title">Mark as Urgent?</span><span className="tp-filter-desc" style={{marginBottom: 0}}>Highlights your task to local taskers.</span></div><div className={`tp-custom-toggle ${taskForm.urgent ? 'active' : ''}`} onClick={() => setTaskForm({...taskForm, urgent: !taskForm.urgent})}><div className="tp-toggle-knob"></div></div></label>
            </form>
            <div className="tp-filter-modal-actions"><button type="button" className="tp-btn-clear" onClick={closeTaskModal}>Cancel</button><button type="submit" className="tp-btn-apply" onClick={handleSaveTask} disabled={isSubmitting}>{isSubmitting ? "Saving..." : (taskModal.mode === 'edit' ? "Save Changes" : "Post Task")}</button></div>
          </div>
        </div>
      )}

      {/* ── PLACE / EDIT BID MODAL ── */}
      {bidModal.isOpen && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && setBidModal({ isOpen: false, mode: 'create', task: null, bidId: null })}>
          <div className="tp-filter-modal">
            <div className="tp-filter-modal-header"><h2>{bidModal.mode === 'edit' ? 'Edit Your Bid' : `Place Bid for "${bidModal.task.title}"`}</h2><button className="tp-close-btn" onClick={() => setBidModal({ isOpen: false, mode: 'create', task: null, bidId: null })}>✕</button></div>
            <form onSubmit={handleSaveBid} className="tp-filter-body">
              <div className="tp-input-group"><label>Your Asking Price (₱)</label><input required type="number" min="1" value={bidForm.amount} onChange={e => setBidForm({...bidForm, amount: e.target.value})} /></div>
              <div className="tp-input-group"><label>Why are you a good fit? (Cover Letter)</label><textarea required placeholder="Hi! I have 3 years of experience doing this..." value={bidForm.coverLetter} onChange={e => setBidForm({...bidForm, coverLetter: e.target.value})} /></div>
            </form>
            <div className="tp-filter-modal-actions"><button type="button" className="tp-btn-clear" onClick={() => setBidModal({ isOpen: false, mode: 'create', task: null, bidId: null })}>Cancel</button><button type="submit" className="tp-btn-apply" onClick={handleSaveBid} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : (bidModal.mode === 'edit' ? "Update Bid" : "Submit Bid")}</button></div>
          </div>
        </div>
      )}

      {/* ── TASKER VERIFICATION UPLOAD MODAL ── */}
      {verifyModal.isOpen && verifyModal.task && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && setVerifyModal({ isOpen: false, task: null, file: null, preview: null })}>
          <div className="tp-filter-modal">
             <div className="tp-filter-modal-header"><h2>Upload Proof of Work</h2><button className="tp-close-btn" onClick={() => setVerifyModal({ isOpen: false, task: null, file: null, preview: null })}>✕</button></div>
             <div className="tp-filter-body">
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Upload a clear photo showing the completed task.</p>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => document.getElementById('verify-photo').click()}>
                   {verifyModal.preview ? <img src={verifyModal.preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} /> : <p>Click to select a photo</p>}
                   <input type="file" id="verify-photo" accept="image/*" style={{ display: 'none' }} onChange={handleVerifyPhotoChange} />
                </div>
             </div>
             <div className="tp-filter-modal-actions">
                <button type="button" className="tp-btn-clear" onClick={() => setVerifyModal({ isOpen: false, task: null, file: null, preview: null })}>Cancel</button>
                <button type="submit" className="tp-btn-apply" onClick={submitTaskVerification} disabled={isSubmitting || !verifyModal.file}>Submit for Review</button>
             </div>
          </div>
        </div>
      )}

      {/* ── REVIEW BIDS MODAL ── */}
      {reviewBidsModal.isOpen && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && setReviewBidsModal({ isOpen: false, task: null, bidsList: [] })}>
          <div className="tp-filter-modal" style={{maxWidth: '600px'}}>
            <div className="tp-filter-modal-header"><h2>Review Bids: {reviewBidsModal.task?.title}</h2><button className="tp-close-btn" onClick={() => setReviewBidsModal({ isOpen: false, task: null, bidsList: [] })}>✕</button></div>
            <div className="tp-filter-body">
              {reviewBidsModal.bidsList.length === 0 ? (<div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>No bids yet.</div>) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {reviewBidsModal.bidsList.map(b => (
                    <div key={b.id} className="tp-bid-review-card">
                      <div className="tp-bid-reviewer-info">
                        <div className="tp-bid-reviewer-details"><strong className="tp-bidder-link" onClick={() => setViewingProfile(b.bidderEmail)}>{b.bidderEmail}</strong><span className="tp-bidder-stats">⭐ {b.bidderRating || '4.9'} ({b.bidderReviewCount || '12'} reviews)</span></div>
                        <button className="tp-btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}} onClick={() => handleAcceptBid(b.id)}>Hire & Accept</button>
                      </div>
                      <p className="tp-review-body">{b.coverLetter}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RATING & REVIEW MODAL (Two-Way) ── */}
      {leaveReviewModal.isOpen && leaveReviewModal.task && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && setLeaveReviewModal({ isOpen: false, role: '', task: null })}>
          <div className="tp-filter-modal" style={{maxWidth: '500px'}}>
             <div className="tp-filter-modal-header">
                <h2>{leaveReviewModal.role === 'poster' ? 'Confirm Payment & Review Tasker' : 'Review Your Poster'}</h2>
                <button className="tp-close-btn" onClick={() => setLeaveReviewModal({ isOpen: false, role: '', task: null })}>✕</button>
             </div>
             <div className="tp-filter-body">
                {leaveReviewModal.role === 'poster' && <p style={{marginBottom: '1.5rem', color: '#10b981', fontWeight: 600}}>By submitting this, the task will be permanently closed and payment released.</p>}
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a'}}>Rating (1-5)</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} width="32" height="32" viewBox="0 0 24 24" fill={star <= reviewForm.rating ? "#f59e0b" : "none"} stroke={star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor: 'pointer', transition: 'all 0.2s'}}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="tp-input-group">
                  <label>Written Review</label>
                  <textarea required placeholder="How was your experience?" value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} style={{minHeight: '120px'}} />
                </div>
             </div>
             <div className="tp-filter-modal-actions">
                <button type="button" className="tp-btn-clear" onClick={() => setLeaveReviewModal({ isOpen: false, role: '', task: null })}>Cancel</button>
                <button type="submit" className="tp-btn-apply" onClick={submitReview} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Review"}</button>
             </div>
          </div>
        </div>
      )}

      {/* ── VIEW FULL TASK DETAILS MODAL (Includes Poster Verification View) ── */}
      {viewTaskModal.isOpen && viewTaskModal.task && (
        <div className="tp-filter-modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewTaskModal({ isOpen: false, task: null })}>
          <div className="tp-filter-modal" style={{ maxWidth: '650px' }}>
            <div className="tp-filter-modal-header">
              <h2>Task Details</h2>
              <button className="tp-close-btn" onClick={() => setViewTaskModal({ isOpen: false, task: null })}>✕</button>
            </div>
            <div className="tp-filter-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>{viewTaskModal.task.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="tp-gig-cat" style={{ background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{viewTaskModal.task.category || 'Task'}</span>
                    {viewTaskModal.task.urgent && <span className="tp-gig-urgent">Urgent</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>₱{Number(viewTaskModal.task.price).toLocaleString()}</div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Budget</span>
                </div>
              </div>

              {viewTaskModal.task.creatorEmail && (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold' }}>{viewTaskModal.task.creatorEmail.charAt(0).toUpperCase()}</div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Posted by</span>
                    <strong className="tp-bidder-link" onClick={() => { setViewTaskModal({ isOpen: false, task: null }); setViewingProfile(viewTaskModal.task.creatorEmail); }}>{viewTaskModal.task.creatorEmail}</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}><span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Location</span><div style={{ color: '#0f172a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {viewTaskModal.task.location}</div></div>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}><span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Schedule</span><div style={{ color: '#0f172a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>🗓 {formatDate(viewTaskModal.task.startDate)} - {formatDate(viewTaskModal.task.endDate)}</div></div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Description Details</h4>
                <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>{viewTaskModal.task.description || "No specific details provided."}</div>
              </div>

              {/* POSTER VERIFICATION SECTION */}
              {viewTaskModal.task.status === 'REVIEW' && viewTaskModal.task.verificationPhoto && (
                <div style={{ marginTop: '0.5rem', padding: '1.5rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px' }}>
                   <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>Tasker's Proof of Completion</h4>
                   <img 
                      src={viewTaskModal.task.verificationPhoto.startsWith("http") ? viewTaskModal.task.verificationPhoto : `data:image/jpeg;base64,${viewTaskModal.task.verificationPhoto}`} 
                      alt="Verification Proof" 
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                   />
                   {appMode === 'poster' && (
                     // Changed to open the Review modal instead of direct confirmation
                     <button className="tp-btn-apply" style={{ width: '100%', marginTop: '1.5rem', background: '#10b981', fontSize: '1rem', padding: '1rem' }} onClick={() => {
                        setLeaveReviewModal({ isOpen: true, role: 'poster', task: viewTaskModal.task });
                        setReviewForm({ rating: 5, text: "" });
                        setViewTaskModal({ isOpen: false, task: null });
                     }}>
                        Approve Proof & Close Task
                     </button>
                   )}
                </div>
              )}
            </div>
            <div className="tp-filter-modal-actions">
              <button type="button" className="tp-btn-clear" onClick={() => setViewTaskModal({ isOpen: false, task: null })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}