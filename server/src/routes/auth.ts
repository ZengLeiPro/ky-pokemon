import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';
import { signToken } from '../lib/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import { UserCredentialsSchema } from '../../../shared/schemas/index.js';

const auth = new Hono<{ Variables: { user: { userId: string } } }>();

const UpdateUsernameSchema = z.object({
  newUsername: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
});

const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100)
});

auth.get('/me', authMiddleware, async (c) => {
  const payload = c.get('user');
  
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, createdAt: true }
  });

  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime()
      }
    }
  });
});

auth.put('/username', authMiddleware, async (c) => {
  const payload = c.get('user');
  const body = await c.req.json();
  
  const parsed = UpdateUsernameSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { newUsername } = parsed.data;

  const existing = await db.user.findUnique({ where: { username: newUsername } });
  if (existing && existing.id !== payload.userId) {
    return c.json({ success: false, error: '用户名已存在' }, 409);
  }

  const user = await db.user.update({
    where: { id: payload.userId },
    data: { username: newUsername },
    select: { id: true, username: true, createdAt: true }
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime()
      }
    }
  });
});

auth.put('/password', authMiddleware, async (c) => {
  const payload = c.get('user');
  const body = await c.req.json();
  
  const parsed = UpdatePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { oldPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    return c.json({ success: false, error: '旧密码错误' }, 401);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: payload.userId },
    data: { passwordHash: newHash }
  });

  return c.json({ success: true });
});

auth.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = UserCredentialsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { username, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    return c.json({ success: false, error: '用户名已存在' }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { username, passwordHash },
    select: { id: true, username: true, createdAt: true }
  });

  const token = await signToken({ userId: user.id, username: user.username });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime()
      },
      token
    }
  });
});

auth.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = UserCredentialsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }

  const { username, password } = parsed.data;

  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return c.json({ success: false, error: '用户名或密码错误' }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ success: false, error: '用户名或密码错误' }, 401);
  }

  const token = await signToken({ userId: user.id, username: user.username });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime()
      },
      token
    }
  });
});

export default auth;
