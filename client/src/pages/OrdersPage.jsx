import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import LoadingSpinner from '../components/LoadingSpinner';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  if (orders.length === 0) {
    return (
      <div className="orders-page empty-state">
        <h2>No Orders Yet</h2>
        <p>You haven&apos;t placed any orders.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-meta">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-status-total">
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                <span className="order-total">${order.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="order-items-preview">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="preview-item">
                  <img src={item.product.imageUrl} alt={item.product.name} title={item.product.name} />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="preview-more">+{order.items.length - 3} more</div>
              )}
            </div>
            
            <div className="order-footer">
              <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
