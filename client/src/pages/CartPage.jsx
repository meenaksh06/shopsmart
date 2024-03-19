import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { useState } from 'react';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { cart, total, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="cart-page empty-state">
        <h2>Your Cart</h2>
        <p>Please log in to view your cart.</p>
        <Link to="/login" className="btn btn-primary">Log In</Link>
      </div>
    );
  }

  if (loading && !cart) {
    return <LoadingSpinner text="Loading your cart..." />;
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="cart-page empty-state">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      setError(`Only ${maxStock} units available for this item.`);
      return;
    }
    const res = await updateItem(itemId, newQuantity);
    if (!res.success) setError(res.error);
  };

  return (
    <div className="cart-page" data-testid="cart-page">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      <h1>Your Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Subtotal</span>
          </div>

          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-image" />
                <div>
                  <h3><Link to={`/products/${item.product.id}`}>{item.product.name}</Link></h3>
                  <p className="cart-item-price">${item.product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="cart-item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product.stock)}
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product.stock)}
                  disabled={item.quantity >= item.product.stock}
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <div className="cart-item-subtotal">
                <span className="subtotal-val">${(item.product.price * item.quantity).toFixed(2)}</span>
                <button
                  className="btn-text btn-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.product.name} from cart`}
                >Remove</button>
              </div>
            </div>
          ))}

          <div className="cart-actions">
            <button className="btn btn-outline" onClick={clearCart}>Clear Cart</button>
            <Link to="/products" className="btn btn-ghost">Continue Shopping</Link>
          </div>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{total >= 50 ? 'Free' : '$10.00'}</span>
          </div>
          {total < 50 && (
            <p className="shipping-hint">Spend ${(50 - total).toFixed(2)} more for free shipping!</p>
          )}
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${(total + (total >= 50 ? 0 : 10)).toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={() => navigate('/checkout')}
            disabled={items.length === 0}
            id="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
