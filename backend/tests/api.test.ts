import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('TalentOS Backend Health & Core API Tests', () => {
  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns database readiness', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('POST /api/v1/auth/login handles authentication', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@talentos.ai', password: 'Password123!' });

    expect([200, 401]).toContain(res.status);
  });
});
