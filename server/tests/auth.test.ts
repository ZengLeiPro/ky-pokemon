import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';

import { Hono } from 'hono';
import { db } from '../src/lib/db';

vi.mock('../src/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    }
  }
}));

import auth from '../src/routes/auth';

const app = new Hono();
app.route('/api/auth', auth);

describe('Auth API', () => {
  const testUser = {
    username: 'test_user',
    password: 'password123'
  };
  const hashedPassword = '$2b$10$hashedpasswordplaceholder';
  const mockUser = {
    id: 'user-123',
    username: testUser.username,
    passwordHash: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  vi.mock('bcrypt', () => ({
    default: {
      hash: vi.fn().mockResolvedValue('$2b$10$hashedpasswordplaceholder'),
      compare: vi.fn().mockImplementation((plain, hash) => plain === 'password123' && hash === '$2b$10$hashedpasswordplaceholder')
    }
  }));

  it('POST /register - 注册新用户', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue(mockUser);

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe(testUser.username);
    expect(typeof data.data.user.createdAt).toBe('number');
    token = data.data.token;
  });

  it('POST /register - 重复用户名应失败', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('POST /login - 正确密码登录', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('POST /login - 错误密码应失败', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, password: 'wrong_password_long_enough' })
    });

    expect(res.status).toBe(401);
  });

  it('GET /me - 有效 Token', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const res = await app.request('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe(testUser.username);
  });

  it('GET /me - 无 Token 应失败', async () => {
    const res = await app.request('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
