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

  // 同步更新 PokedexEntry 表（仅 NORMAL 模式同步）
  if (saveMode === 'NORMAL' && pokedex) {
    const pokedexEntries = Object.entries(pokedex as Record<string, string>)
      .filter(([_, status]) => status !== 'UNKNOWN')
      .map(([speciesIdStr, status]) => ({
        speciesId: parseInt(speciesIdStr),
        status
      }));

    // 获取用户现有的图鉴记录
    const existingEntries = await db.pokedexEntry.findMany({
      where: { userId: user.userId }
    });
    const existingMap = new Map(existingEntries.map(e => [e.speciesId, e]));

    // 过滤掉不需要更新的记录（已是 CAUGHT 状态的）
    const needsUpdate = pokedexEntries.filter(({ speciesId, status }) => {
      const existing = existingMap.get(speciesId);
      // 已是 CAUGHT 状态，无需任何操作
      if (existing?.status === 'CAUGHT') return false;
      // SEEN 状态收到 SEEN 请求，也无需更新
      if (existing?.status === 'SEEN' && status === 'SEEN') return false;
      return true;
    });

    // 使用事务批量处理
    if (needsUpdate.length > 0) {
      await db.$transaction(
        needsUpdate.map(({ speciesId, status }) => {
          const existing = existingMap.get(speciesId);

          if (existing) {
            // 状态升级（SEEN -> CAUGHT）
            return db.pokedexEntry.update({
              where: { userId_speciesId: { userId: user.userId, speciesId } },
              data: {
                status,
                firstCaughtAt: status === 'CAUGHT' && !existing.firstCaughtAt ? new Date() : undefined
              }
            });
          } else {
            // 新记录
            return db.pokedexEntry.create({
              data: {
                userId: user.userId,
                speciesId,
                status,
                firstSeenAt: new Date(),
                firstCaughtAt: status === 'CAUGHT' ? new Date() : null
              }
            });
          }
        })
      );
    }
  }

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
