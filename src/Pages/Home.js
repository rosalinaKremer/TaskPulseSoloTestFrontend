import { useState } from "react";
import "../css/Home.css";
import Profile from "./Profile";

const HOME_VIEW_KEY = "taskpulse.homeView";

export default function Home({ user, token, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetRange, setBudgetRange] = useState(10000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showProfile, setShowProfile] = useState(
    () => localStorage.getItem(HOME_VIEW_KEY) === "profile"
  );

  function openProfile() {
    setShowProfile(true);
    localStorage.setItem(HOME_VIEW_KEY, "profile");
  }

  function closeProfile() {
    setShowProfile(false);
    localStorage.setItem(HOME_VIEW_KEY, "home");
  }

  function toggleCategory(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  // If user clicked profile icon, show Profile page
  if (showProfile) {
    return <Profile user={user} token={token} onLogout={onLogout} onBack={closeProfile} />;
  }

  // Mock categories
  const categories = [
    "Home Cleaning",
    "Plumbing",
    "Electrical",
    "Delivery",
    "Tutoring",
    "Gardening",
    "Carpentry",
    "Moving",
    "Pet Care",
  ];

  const products = [
    { id: 1, title: "Need help with home cleaning and organizing", category: "Home Cleaning", location: "Quezon City, Metro Manila", price: 800 },
    { id: 2, title: "Fix leaking pipes in kitchen and bathroom", category: "Plumbing", location: "Makati City, Metro Manila", price: 1200 },
    { id: 3, title: "Install ceiling fan and repair outlets", category: "Electrical", location: "Pasig City, Metro Manila", price: 1500 },
    { id: 4, title: "Deliver documents to BGC area", category: "Delivery", location: "Taguig City, Metro Manila", price: 300 },
    { id: 5, title: "Math tutor needed for Grade 10 student", category: "Tutoring", location: "Manila City, Metro Manila", price: 600 },
    { id: 6, title: "Weekly lawn mowing and garden maintenance", category: "Gardening", location: "Paranaque City, Metro Manila", price: 900 },
    { id: 7, title: "Build custom wooden bookshelf", category: "Carpentry", location: "Caloocan City, Metro Manila", price: 2500 },
    { id: 8, title: "Help move furniture to new apartment", category: "Moving", location: "Mandaluyong City, Metro Manila", price: 1800 },
    { id: 9, title: "Dog walking service for 2 weeks", category: "Pet Care", location: "San Juan City, Metro Manila", price: 700 },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesQuery = !normalizedQuery ||
      product.title.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.location.toLowerCase().includes(normalizedQuery);

    const matchesBudget = product.price <= Number(budgetRange);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesQuery && matchesBudget && matchesCategory;
  });

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-brand">TaskPulse</div>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="nav-link">Browse Tasks</button>
          <button className="nav-link">My Bids</button>
          <button className="nav-link">My Tasks</button>
          <button className="nav-btn-post">Post a Task</button>
          <button className="profile-icon" onClick={openProfile} title="Open profile" aria-label="Open profile">👤</button>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className="category-list">
              {categories.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`category-item ${active ? "active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Budget Range</h3>
            <div className="budget-slider">
              <div className="budget-meta">Minimum: ₱0</div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="slider"
              />
              <div className="budget-meta">Maximum: ₱{Number(budgetRange).toLocaleString()}</div>
            </div>
            <button className="apply-filters-btn">Apply Filters</button>
          </div>
        </aside>

        <section className="content-area">
          <div className="results-head">
            <h2>Available Tasks</h2>
            <p>Browse and bid on tasks</p>
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="company-tag">{product.category}</div>
                  <p className="product-description">📍 {product.location}</p>
                  <div className="card-footer">
                    <div className="product-price">₱{product.price.toLocaleString()}</div>
                  </div>
                  <button className="view-details-btn">View Details</button>
                </div>
              </article>
            ))}

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <h3>No matching services yet</h3>
                <p>Try widening your budget or clearing category filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}