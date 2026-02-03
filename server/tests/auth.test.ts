import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

import { Hono } from 'hono';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
});

vi.mock('../src/lib/db.js', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$hashedpasswordplaceholder'),
    compare: vi.fn().mockImplementation((plain: string, hash: string) =>
      plain === 'password123' && hash === '$2b$10$hashedpasswordplaceholder'
    )
  }
}));

import { db } from '../src/lib/db.js';
import { signToken } from '../src/lib/jwt.js';
import auth from '../src/routes/auth.js';

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

  beforeEach(async () => {
    vi.clearAllMocks();
    token = await signToken({ userId: mockUser.id, username: mockUser.username });
  });

  it('POST /register - 注册新用户', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null as any);
    vi.mocked(db.user.create).mockResolvedValue(mockUser as any);

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
    expect(typeof data.data.token).toBe('string');
  });

  it('POST /register - 重复用户名应失败', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

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
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.data.token).toBe('string');
  });

  it('POST /login - 错误密码应失败', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, password: 'wrong_password_long_enough' })
    });

    expect(res.status).toBe(401);
  });

  it('GET /me - 有效 Token', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

    const res = await app.request('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
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

