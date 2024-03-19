const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
  };
  let authToken;

  it('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();
    authToken = res.body.token;
  });

  it('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register - rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'notanemail', email: `invalid_${Date.now()}` });
    expect(res.statusCode).toBe(422);
  });

  it('POST /api/auth/register - rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: `short_${Date.now()}@ex.com`, password: '123' });
    expect(res.statusCode).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it('POST /api/auth/login - should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    authToken = res.body.token;
  });

  it('POST /api/auth/login - rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/login - rejects nonexistent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'anything' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me - returns user info with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('GET /api/auth/me - returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
