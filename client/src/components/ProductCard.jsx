import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(true);
    const result = await addToCart(product.id, 1);
    setAdding(false);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <article className="product-card" data-testid="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        <div className="product-card-image-wrapper">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />

          {/* Category badge */}
          <span className="category-badge">{product.category?.name}</span>

          {/* Out of stock badge (replaces wishlist when out of stock) */}
          {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}

          {/* Quick-add overlay (slides up on hover) */}
          {!isOutOfStock && (
            <div className="product-card-overlay">
              <button
                className={`btn btn-sm btn-block ${added ? 'btn-success' : 'btn-primary'}`}
                style={{ borderRadius: '4px' }}
                onClick={handleAddToCart}
                disabled={adding}
                aria-label={`Add ${product.name} to cart`}
                id={`add-to-cart-${product.id}`}
              >
                {adding ? 'Adding…' : added ? '✓ Added to Cart' : '＋ Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist icon (top-right, only when in-stock so it doesn't clash with out-of-stock badge) */}
      {!isOutOfStock && (
        <button
          className="wishlist-btn"
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 3 }}
          onClick={() => setWishlisted((w) => !w)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      )}

      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-card-title-link">
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        <div className="product-card-rating" aria-label={`Rating: ${product.rating} out of 5`}>
          <span className="stars" aria-hidden="true">
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className="review-count">({product.reviewCount})</span>
        </div>

        <div className="product-card-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {/* Desktop fallback button (visible on touch devices) */}
          {isOutOfStock ? (
            <button className="btn btn-sm btn-outline" disabled>Out of Stock</button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
