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
            <Navbar />
            
            <main className="main-content">
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
                  <div className="empty-state">
                    <h2>Page Not Found</h2>
                    <p>The page you are looking for does not exist.</p>
                  </div>
                } />
              </Routes>
            </main>
            
            <footer className="footer">
              <p>&copy; {new Date().getFullYear()} ShopSmart. All rights reserved.</p>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
