import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/orders';
import Toast from '../components/Toast';

const CheckoutPage = () => {
  const { cart, total, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];
  const shipping = total >= 50 ? 0 : 10;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="checkout-page empty-state">
        <h2>Cannot Checkout</h2>
        <p>Your cart is empty.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Return to Shop</button>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate payment process delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await placeOrder();
      await fetchCart(); // Refresh cart (should be empty now)
      navigate(`/orders/${res.data.order.id}?success=true`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
      
      <h1>Checkout</h1>
      
      <div className="checkout-layout">
        <div className="checkout-form-section">
          <form id="checkout-form" onSubmit={handleCheckout}>
            <section className="form-group-section">
              <h2>Shipping Information</h2>
              <div className="form-row">
                <div className="form-control">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" required defaultValue="Jane" />
                </div>
                <div className="form-control">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" required defaultValue="Doe" />
                </div>
              </div>
              <div className="form-control">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" required defaultValue="123 Main St" />
              </div>
              <div className="form-row">
                <div className="form-control">
                  <label htmlFor="city">City</label>
                  <input type="text" id="city" required defaultValue="Anytown" />
                </div>
                <div className="form-control">
                  <label htmlFor="zip">ZIP Code</label>
                  <input type="text" id="zip" required defaultValue="12345" />
                </div>
              </div>
            </section>

            <section className="form-group-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="radio-label">
                  <input type="radio" name="payment" value="card" defaultChecked />
                  Credit / Debit Card
                </label>
                <label className="radio-label">
                  <input type="radio" name="payment" value="paypal" disabled />
                  PayPal (Unavailable)
                </label>
              </div>
              
              <div className="card-details">
                <div className="form-control">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" pattern="\d*" maxLength="16" required defaultValue="4242424242424242" />
                </div>
                <div className="form-row">
                  <div className="form-control">
                    <label htmlFor="expiry">Expiry (MM/YY)</label>
                    <input type="text" id="expiry" placeholder="MM/YY" required defaultValue="12/25" />
                  </div>
                  <div className="form-control">
                    <label htmlFor="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="123" maxLength="4" required defaultValue="123" />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {items.map((item) => (
              <div key={item.id} className="summary-item">
                <img src={item.product.imageUrl} alt={item.product.name} />
                <div className="item-info">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total to Pay</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className={`btn btn-primary btn-block btn-lg ${loading ? 'loading' : ''}`}
            disabled={loading}
            id="place-order-btn"
          >
            {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
          </button>
          <p className="secure-badge">🔒 Secure checkout</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
