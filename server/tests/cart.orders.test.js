const request = require('supertest');
const app = require('../src/app');

describe('Cart Routes', () => {
  let authToken;
  let cartItemId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@shopsmart.com', password: 'demo1234' });
    authToken = res.body.token;
  });

  it('GET /api/cart - returns cart for authenticated user', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.cart).toBeDefined();
    expect(Array.isArray(res.body.cart.items)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /api/cart - returns 401 without token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/cart/items - adds product to cart', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 1, quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.cartItem).toBeDefined();
    expect(res.body.cartItem.quantity).toBeGreaterThanOrEqual(2);
    cartItemId = res.body.cartItem.id;
  });

  it('POST /api/cart/items - rejects invalid product ID', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 'abc', quantity: 1 });
    expect(res.statusCode).toBe(422);
  });

  it('POST /api/cart/items - returns 404 for non-existent product', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 99999, quantity: 1 });
    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/cart/items/:id - updates quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(3);
  });

  it('DELETE /api/cart/items/:id - removes item from cart', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Item removed from cart');
  });

  it('DELETE /api/cart - clears the entire cart', async () => {
    // Add items first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 2, quantity: 1 });

    const res = await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Cart cleared');
  });
});

describe('Orders Routes', () => {
  let authToken;
  let orderId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@shopsmart.com', password: 'demo1234' });
    authToken = res.body.token;

    // Add product to cart so we can place an order
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ productId: 3, quantity: 1 });
  });

  it('POST /api/orders - places an order from cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.status).toBe('processing');
    expect(res.body.order.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.order.items)).toBe(true);
    orderId = res.body.order.id;
  });

  it('POST /api/orders - returns 400 for empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Cart is empty');
  });

  it('GET /api/orders - returns orders for user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it('GET /api/orders/:id - returns single order', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.order.id).toBe(orderId);
  });

  it('GET /api/orders/:id - returns 404 for nonexistent order', async () => {
    const res = await request(app)
      .get('/api/orders/99999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/orders - returns 401 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(401);
  });
});
