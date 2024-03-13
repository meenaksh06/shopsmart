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
          {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
          <span className="category-badge">{product.category?.name}</span>
        </div>
      </Link>

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
          <button
            className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            id={`add-to-cart-${product.id}`}
          >
            {adding ? '...' : added ? '✓ Added' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
