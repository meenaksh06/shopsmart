import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/products', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      await fetchCart();
      navigate('/products', { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-page">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join ShopSmart today</p>
        
        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-control">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              minLength="6"
            />
            <small className="form-hint">Must be at least 6 characters</small>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="register-submit-btn">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
