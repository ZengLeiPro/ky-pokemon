import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { SaveGameRequestSchema } from '@shared/schemas';

const game = new Hono<{ Variables: { user: { userId: string } } }>();

game.use('/*', authMiddleware);

game.get('/save', async (c) => {
  const user = c.get('user');
  
  const save = await db.gameSave.findUnique({
    where: { userId: user.userId }
  });

  if (!save) {
    return c.json({ success: true, data: null });
  }

  return c.json({ success: true, data: save });
});

game.post('/save', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const parsed = SaveGameRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: '存档数据格式错误' }, 400);
  }

  const { team, pcBox, currentLocationId, badges, pokedex, inventory, money, playTime } = parsed.data;

  const save = await db.gameSave.upsert({
    where: { userId: user.userId },
    create: {
      userId: user.userId,
      team,
      pcBox,
      currentLocation: currentLocationId,
      badges,
      pokedex,
      inventory: inventory ?? [],
      money: money ?? 3000,
      playTime: playTime ?? 0
    },
    update: {
      team,
      pcBox,
      currentLocation: currentLocationId,
      badges,
      pokedex,
      inventory: inventory ?? undefined,
      money: money ?? undefined,
      playTime: playTime ?? undefined
    }
  });

  return c.json({ success: true, data: { savedAt: save.updatedAt } });
});

game.delete('/save', async (c) => {
  const user = c.get('user');
  
  await db.gameSave.delete({
    where: { userId: user.userId }
  }).catch(() => null);

  return c.json({ success: true });
});

export default game;
