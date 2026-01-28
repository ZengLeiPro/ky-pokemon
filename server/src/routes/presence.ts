import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const presence = new Hono<{ Variables: { user: { userId: string } } }>();
presence.use('/*', authMiddleware);

// 心跳端点 - 前端每 15 秒调用一次
presence.post('/heartbeat', async (c) => {
  const user = c.get('user');

  await db.user.update({
    where: { id: user.userId },
    data: { lastSeenAt: new Date() }
  });

  return c.json({ success: true });
});

export default presence;
