import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { SaveGameRequestSchema } from '../../../shared/schemas/index.js';

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

  // Parse JSON strings
  const data = {
    ...save,
    team: JSON.parse(save.team),
    pcBox: JSON.parse(save.pcBox),
    badges: JSON.parse(save.badges),
    pokedex: JSON.parse(save.pokedex),
    inventory: JSON.parse(save.inventory),
    currentLocationId: save.currentLocation
  };

  return c.json({ success: true, data });
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
      team: JSON.stringify(team),
      pcBox: JSON.stringify(pcBox),
      currentLocation: currentLocationId,
      badges: JSON.stringify(badges),
      pokedex: JSON.stringify(pokedex),
      inventory: JSON.stringify(inventory ?? []),
      money: money ?? 3000,
      playTime: playTime ?? 0
    },
    update: {
      team: JSON.stringify(team),
      pcBox: JSON.stringify(pcBox),
      currentLocation: currentLocationId,
      badges: JSON.stringify(badges),
      pokedex: JSON.stringify(pokedex),
      inventory: inventory ? JSON.stringify(inventory) : undefined,
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
