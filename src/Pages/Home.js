import { useState } from "react";
import "../css/Home.css";

export default function Home({ user, token, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetRange, setBudgetRange] = useState(50);

  // Mock categories
  const categories = [
    "Web Development",
    "Mobile Development", 
    "UI/UX Design",
    "Digital Marketing",
    "Content Writing",
    "Data Analysis",
    "Graphic Design",
    "SEO Services"
  ];

  // Mock products/services
  const products = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `Service ${i + 1}`,
    company: `Company ${String.fromCharCode(65 + i)}`,
    description: "Professional service description here...",
    price: Math.floor(Math.random() * 100) + 50,
    image: `https://via.placeholder.com/280x160/7a9ab0/ffffff?text=Service+${i + 1}`
  }));

  return (
    <>
      <div className="home-container">
        <div className="home-header">
          <div className="home-header-text">HomePage</div>
          <div className="header-actions">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">Search btn</button>
            </div>
            <div className="profile-icon" onClick={onLogout}>👤</div>
          </div>
        </div>

        <div className="main-content">
          <div className="sidebar">
            <div className="filter-section">
              <h3 className="filter-title">CATEGORIES</h3>
              <div className="category-list">
                {categories.map((category, index) => (
                  <label key={index} className="category-item">
                    <input type="checkbox" />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">BUDGET RANGE</h3>
              <div className="budget-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="slider"
                />
                <div className="budget-value">${budgetRange}</div>
              </div>
              <button className="apply-filters-btn">Apply Filters</button>
            </div>
          </div>

          <div className="content-area">
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="product-info">
                    <div className="company-tag">{product.company}</div>
                    <div className="product-description">{product.description}</div>
                    <div className="product-price">${product.price}</div>
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}