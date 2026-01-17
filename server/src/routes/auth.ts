import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import { db } from '../lib/db';
import { signToken } from '../lib/jwt';
import { authMiddleware } from '../middleware/auth';
import { UserCredentialsSchema } from '@shared/schemas';

const auth = new Hono<{ Variables: { user: { userId: string } } }>();

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
