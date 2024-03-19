import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 4, sortBy: 'rating', order: 'desc' })
      .then((res) => setFeatured(res.data.products))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero" aria-label="Hero banner">
        <div className="hero-content">
          <div className="hero-badge">✨ New Arrivals Every Week</div>
          <h1 className="hero-title">
            Shop Smarter,<br />
            <span className="hero-title-accent">Live Better.</span>
          </h1>
          <p className="hero-subtitle">
            Discover premium electronics, fashion, and home essentials — all in one place with unbeatable prices.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg" id="shop-now-btn">
              Shop Now →
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Join Free
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>12+</strong><span>Products</span></div>
            <div className="stat"><strong>3</strong><span>Categories</span></div>
            <div className="stat"><strong>⭐ 4.6</strong><span>Avg Rating</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-blob"></div>
          <div className="floating-card fc-1">🎧 Top Rated</div>
          <div className="floating-card fc-2">🚀 Fast Delivery</div>
          <div className="floating-card fc-3">🔒 Secure Pay</div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section" aria-labelledby="categories-heading">
        <div className="section-header">
          <h2 id="categories-heading">Shop by Category</h2>
          <p>Find exactly what you&apos;re looking for</p>
        </div>
        <div className="category-cards">
          <Link to="/products?categoryId=1" className="category-card" id="electronics-cat">
            <span className="category-icon">💻</span>
            <strong>Electronics</strong>
            <span>Gadgets & Tech</span>
          </Link>
          <Link to="/products?categoryId=2" className="category-card" id="clothing-cat">
            <span className="category-icon">👗</span>
            <strong>Clothing</strong>
            <span>Style & Fashion</span>
          </Link>
          <Link to="/products?categoryId=3" className="category-card" id="home-cat">
            <span className="category-icon">🏡</span>
            <strong>Home & Garden</strong>
            <span>Comfort & Living</span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section" aria-labelledby="featured-heading">
        <div className="section-header">
          <h2 id="featured-heading">Top Rated Products</h2>
          <Link to="/products" className="view-all-link">View All →</Link>
        </div>
        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : (
          <div className="products-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner" aria-label="Sign up call to action">
        <div className="cta-content">
          <h2>Ready to start shopping?</h2>
          <p>Create a free account and get access to exclusive deals.</p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
