import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    params.sortBy = sortBy;
    params.order = order;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, categoryId, sortBy, order, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.categories));
  }, []);

  const updateParam = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set(key, val); else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.search.value.trim();
    updateParam('search', val);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>All Products</h1>
        <p>{pagination.total ? `${pagination.total} products found` : ''}</p>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <form className="search-form" onSubmit={handleSearch} role="search">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="search-input"
            aria-label="Search products"
            id="product-search"
          />
          <button type="submit" className="btn btn-primary" id="search-btn">Search</button>
        </form>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={categoryId}
            onChange={(e) => updateParam('categoryId', e.target.value)}
            aria-label="Filter by category"
            id="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [sb, o] = e.target.value.split('-');
              const params = new URLSearchParams(searchParams);
              params.set('sortBy', sb);
              params.set('order', o);
              params.delete('page');
              setSearchParams(params);
            }}
            aria-label="Sort products"
            id="sort-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>🔍 No products found.</p>
          <button className="btn btn-outline" onClick={() => setSearchParams({})}>Clear filters</button>
        </div>
      ) : (
        <div className="products-grid" data-testid="products-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination" role="navigation" aria-label="Product pages">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', p);
                setSearchParams(params);
              }}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
