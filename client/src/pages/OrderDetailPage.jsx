import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getOrder } from '../api/orders';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const showSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (error || !order) return (
    <div className="empty-state">
      <h2>Oops!</h2>
      <p>{error}</p>
      <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
    </div>
  );

  return (
    <div className="order-detail-page">
      {showSuccess && <Toast message="Order placed successfully!" type="success" />}
      
      <div className="order-detail-header">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <h1>Order #{order.id}</h1>
        <div className="order-meta-info">
          <span>Placed on {new Date(order.createdAt).toLocaleString()}</span>
          <span className={`status-badge status-${order.status}`}>{order.status}</span>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-items-list">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="order-item-row">
              <img src={item.product.imageUrl} alt={item.product.name} />
              <div className="item-info">
                <h3><Link to={`/products/${item.product.id}`}>{item.product.name}</Link></h3>
                <p>Qty: {item.quantity}</p>
              </div>
              <div className="item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary-box">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>${(order.total - (order.total >= 50 ? 0 : 10)).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.total >= 50 ? 'Free' : '$10.00'}</span>
          </div>
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
