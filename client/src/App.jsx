import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">

            {/* Announcement Bar */}
            <div className="announcement-bar">
              🚀 Free shipping on orders over $50 &nbsp;|&nbsp; Use code{' '}
              <strong>SMART10</strong> for 10% off your first order
            </div>

            <Navbar />

            <main className="main-content full-width">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={
                  <div style={{ padding: '4rem 2rem', maxWidth: '1440px', margin: '0 auto' }}>
                    <div className="empty-state">
                      <h2>Page Not Found</h2>
                      <p>The page you are looking for does not exist.</p>
                    </div>
                  </div>
                } />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="footer">
              <div className="footer-grid">
                <div className="footer-brand">
                  <span className="footer-logo">🛍️ ShopSmart</span>
                  <p>Your one-stop destination for premium electronics, fashion, and home essentials — curated for the modern shopper.</p>
                </div>
                <div className="footer-col">
                  <h4>Shop</h4>
                  <ul>
                    <li><a href="/products">All Products</a></li>
                    <li><a href="/products?categoryId=1">Electronics</a></li>
                    <li><a href="/products?categoryId=2">Clothing</a></li>
                    <li><a href="/products?categoryId=3">Home & Garden</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Account</h4>
                  <ul>
                    <li><a href="/login">Log In</a></li>
                    <li><a href="/register">Sign Up</a></li>
                    <li><a href="/orders">My Orders</a></li>
                    <li><a href="/cart">My Cart</a></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Help</h4>
                  <ul>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Shipping Policy</a></li>
                    <li><a href="#">Returns</a></li>
                    <li><a href="#">Contact Us</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>© {new Date().getFullYear()} ShopSmart. All rights reserved.</p>
                <div className="footer-bottom-links">
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms of Service</a>
                  <a href="#">Cookie Policy</a>
                </div>
              </div>
            </footer>

          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
