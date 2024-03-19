import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/products';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      await fetchCart(); // Load user cart
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@shopsmart.com');
    setPassword('demo1234');
    // Automating form submit via state update effect would be complex here,
    // so we just let the user click 'Login' or we do it directly:
    setLoading(true);
    const res = await login('demo@shopsmart.com', 'demo1234');
    setLoading(false);
    if (res.success) {
      await fetchCart();
      navigate(from, { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-page">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Log in to access your cart and orders</p>
        
        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="login-submit-btn">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-divider">or</div>
        
        <button className="btn btn-outline btn-block" onClick={handleDemoLogin}>
          Log in as Demo User
        </button>
        
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
