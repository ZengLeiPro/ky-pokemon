import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { SaveGameRequestSchema } from '../../../shared/schemas/index.js';

const game = new Hono<{ Variables: { user: { userId: string } } }>();

game.use('/*', authMiddleware);

game.get('/save', async (c) => {
  const user = c.get('user');
  const mode = c.req.query('mode') || 'NORMAL';
  
  const save = await db.gameSave.findUnique({
    where: { 
      userId_mode: {
        userId: user.userId,
        mode: mode
      }
    }
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
    legendaryProgress: JSON.parse(save.legendaryProgress || '{}'),
    currentLocationId: save.currentLocation
  };

  return c.json({ success: true, data });
});

game.post('/save', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = SaveGameRequestSchema.safeParse(body);
  if (!parsed.success) {
    console.error('Save validation failed:', JSON.stringify(parsed.error.format(), null, 2));
    return c.json({ success: false, error: '存档数据格式错误', details: parsed.error.format() }, 400);
  }

  const { team, pcBox, currentLocationId, badges, pokedex, inventory, legendaryProgress, money, playTime, mode } = parsed.data;
  const saveMode = mode || 'NORMAL';

  const save = await db.gameSave.upsert({
    where: {
      userId_mode: {
        userId: user.userId,
        mode: saveMode
      }
    },
    create: {
      userId: user.userId,
      mode: saveMode,
      team: JSON.stringify(team),
      pcBox: JSON.stringify(pcBox),
      currentLocation: currentLocationId,
      badges: JSON.stringify(badges),
      pokedex: JSON.stringify(pokedex),
      inventory: JSON.stringify(inventory ?? []),
      legendaryProgress: JSON.stringify(legendaryProgress ?? {}),
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
      legendaryProgress: legendaryProgress ? JSON.stringify(legendaryProgress) : undefined,
      money: money ?? undefined,
      playTime: playTime ?? undefined
    }
  });

  return c.json({ success: true, data: { savedAt: save.updatedAt } });
});

game.delete('/save', async (c) => {
  const user = c.get('user');
  const mode = c.req.query('mode') || 'NORMAL';
  
  await db.gameSave.delete({
    where: { 
      userId_mode: {
        userId: user.userId,
        mode: mode
      }
    }
  }).catch(() => null);

  return c.json({ success: true });
});

export default game;
