import { Context, Next } from 'hono';
import { verifyToken } from '../lib/jwt';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未提供认证令牌' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ success: false, error: '令牌无效或已过期' }, 401);
  }

  c.set('user', payload);
  await next();
}
