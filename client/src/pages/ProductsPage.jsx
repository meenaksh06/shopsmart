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
    <div className="products-page" style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem 2rem' }}>

      {/* Page header */}
      <div className="products-page-header">
        <h1>All Products</h1>
        <p>{pagination.total ? `${pagination.total} products` : ''}</p>
      </div>

      {/* Controls bar */}
      <div className="controls-bar">
        {/* Search */}
        <form onSubmit={handleSearch} role="search" style={{ display: 'flex', gap: '0.5rem', flex: '0 0 auto' }}>
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search products…"
            aria-label="Search products"
            id="product-search"
            style={{ width: '220px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" id="search-btn">Search</button>
        </form>

        {/* Category pills */}
        <div className="filter-pills">
          <button
            className={`pill ${categoryId === '' ? 'active' : ''}`}
            onClick={() => updateParam('categoryId', '')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill ${categoryId === String(c.id) ? 'active' : ''}`}
              onClick={() => updateParam('categoryId', String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          className="sort-select"
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
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating-desc">Top Rated</option>
        </select>
      </div>

      {/* Products grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No Products Found</h2>
          <p>Try adjusting your search or filters.</p>
          <button className="btn btn-outline" onClick={() => setSearchParams({})}>Clear Filters</button>
        </div>
      ) : (
        <div className="products-grid" data-testid="products-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          role="navigation"
          aria-label="Product pages"
          style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}
        >
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pill ${p === page ? 'active' : ''}`}
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
