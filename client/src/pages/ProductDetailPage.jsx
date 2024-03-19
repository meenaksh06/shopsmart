import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data.product))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading product detail..." />;

  if (error || !product) {
    return (
      <div className="empty-state">
        <h2>Product not found</h2>
        <p>The item you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    await addToCart(product.id, qty);
    setAdding(false);
    navigate('/cart');
  };

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">← Back to Products</Link>
      
      <div className="product-detail-container">
        <div className="product-detail-image-wrapper">
          <img src={product.imageUrl} alt={product.name} />
          {isOutOfStock && <span className="badge-out-stock">Out of Stock</span>}
        </div>
        
        <div className="product-detail-info">
          <span className="category-label">{product.category.name}</span>
          <h1>{product.name}</h1>
          
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
          </div>
          
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          
          <div className="product-stock-status">
            <span className={`status-dot ${isOutOfStock ? 'red' : product.stock < 10 ? 'orange' : 'green'}`}></span>
            {isOutOfStock ? 'Currently out of stock' : product.stock < 10 ? `Only ${product.stock} left in stock - order soon.` : 'In Stock'}
          </div>

          <div className="add-to-cart-box">
            <div className="qty-selector">
              <label htmlFor="qty">Quantity:</label>
              <select 
                id="qty" 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))}
                disabled={isOutOfStock}
              >
                {[...Array(Math.min(10, product.stock || 1)).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-primary btn-lg btn-block" 
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              id="detail-add-cart-btn"
            >
              {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
