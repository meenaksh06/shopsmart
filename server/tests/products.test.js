const request = require('supertest');
const app = require('../src/app');

describe('Products Routes', () => {
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // Login as demo user
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@shopsmart.com', password: 'demo1234' });
    authToken = res.body.token;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@shopsmart.com', password: 'admin123' });
    adminToken = adminRes.body.token;
  });

  describe('GET /api/products', () => {
    it('returns products list with pagination', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('filters products by search query', async () => {
      const res = await request(app).get('/api/products?search=headphones');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products[0].name.toLowerCase()).toContain('headphones');
    });

    it('filters by min and max price', async () => {
      const res = await request(app).get('/api/products?minPrice=50&maxPrice=150');
      expect(res.statusCode).toBe(200);
      res.body.products.forEach((p) => {
        expect(p.price).toBeGreaterThanOrEqual(50);
        expect(p.price).toBeLessThanOrEqual(150);
      });
    });

    it('respects limit parameter', async () => {
      const res = await request(app).get('/api/products?limit=3');
      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/products/categories', () => {
    it('returns list of categories', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.id).toBe(1);
    });

    it('returns 404 for nonexistent product', async () => {
      const res = await request(app).get('/api/products/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/products (admin only)', () => {
    it('creates a product as admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product description',
          price: 99.99,
          stock: 10,
          categoryId: 1,
          imageUrl: 'https://example.com/img.jpg',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.product.name).toBe('Test Product');
    });

    it('returns 403 for non-admin user', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test',
          description: 'Test',
          price: 10,
          stock: 1,
          categoryId: 1,
          imageUrl: 'https://example.com/img.jpg',
        });
      expect(res.statusCode).toBe(403);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/products').send({});
      expect(res.statusCode).toBe(401);
    });
  });
});
