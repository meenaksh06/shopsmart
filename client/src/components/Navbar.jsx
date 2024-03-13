import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="ShopSmart Home">
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">ShopSmart</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Products
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Orders
              </NavLink>
              <NavLink to="/cart" className={({ isActive }) => `nav-link cart-link ${isActive ? 'active' : ''}`} id="cart-nav-link">
                <span>Cart</span>
                {itemCount > 0 && <span className="cart-badge" aria-label={`${itemCount} items in cart`}>{itemCount}</span>}
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}!</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" id="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline btn-sm" id="login-nav-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/products" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Products</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                Cart {itemCount > 0 && `(${itemCount})`}
              </NavLink>
              <NavLink to="/orders" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Orders</NavLink>
              <button onClick={handleLogout} className="mobile-nav-link mobile-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
