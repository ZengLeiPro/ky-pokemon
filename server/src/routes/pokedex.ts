import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { z } from 'zod';

const pokedex = new Hono<{ Variables: { user: { userId: string } } }>();

pokedex.use('/*', authMiddleware);

// 获取当前用户的图鉴数据
pokedex.get('/', async (c) => {
  const user = c.get('user');

  const entries = await db.pokedexEntry.findMany({
    where: { userId: user.userId }
  });

  // 转换为前端期望的格式 Record<number, PokedexStatus>
  const pokedexData: Record<number, string> = {};
  for (let i = 1; i <= 151; i++) {
    pokedexData[i] = 'UNKNOWN';
  }
  entries.forEach(entry => {
    pokedexData[entry.speciesId] = entry.status;
  });

  return c.json({ success: true, data: { pokedex: pokedexData } });
});

// 更新图鉴状态
const UpdatePokedexSchema = z.object({
  speciesId: z.number().int().min(1).max(151),
  status: z.enum(['SEEN', 'CAUGHT'])
});

pokedex.post('/update', async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ success: false, error: '请求体不是有效的 JSON' }, 400);
  }

  const parsed = UpdatePokedexSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: '参数格式错误' }, 400);
  }

  const { speciesId, status } = parsed.data;

  // 使用 upsert 实现"有则更新，无则创建"
  const existing = await db.pokedexEntry.findUnique({
    where: {
      userId_speciesId: {
        userId: user.userId,
        speciesId
      }
    }
  });

  if (existing) {
    // 只在状态升级时更新（SEEN -> CAUGHT）
    if (existing.status === 'CAUGHT') {
      // 已捕获，不需要更新
      return c.json({ success: true });
    }

    await db.pokedexEntry.update({
      where: {
        userId_speciesId: {
          userId: user.userId,
          speciesId
        }
      },
      data: {
        status,
        firstCaughtAt: status === 'CAUGHT' ? new Date() : undefined
      }
    });
  } else {
    await db.pokedexEntry.create({
      data: {
        userId: user.userId,
        speciesId,
        status,
        firstSeenAt: new Date(),
        firstCaughtAt: status === 'CAUGHT' ? new Date() : null
      }
    });
  }

  return c.json({ success: true });
});

// 获取全服统计数据
pokedex.get('/stats', async (c) => {
  // 统计每只宝可梦被捕获的次数
  const stats = await db.pokedexEntry.groupBy({
    by: ['speciesId'],
    where: { status: 'CAUGHT' },
    _count: { speciesId: true }
  });

  // 转换为 Record<speciesId, count>
  const catchCounts: Record<number, number> = {};
  stats.forEach(stat => {
    catchCounts[stat.speciesId] = stat._count.speciesId;
  });

  // 获取总玩家数
  const totalPlayers = await db.user.count();

  return c.json({
    success: true,
    data: {
      stats: {
        catchCounts,
        totalPlayers
      }
    }
  });
});

// 获取图鉴排行榜
pokedex.get('/leaderboard', async (c) => {
  // 统计每个用户捕获的宝可梦数量
  const leaderboard = await db.pokedexEntry.groupBy({
    by: ['userId'],
    where: { status: 'CAUGHT' },
    _count: { speciesId: true },
    orderBy: { _count: { speciesId: 'desc' } },
    take: 20
  });

  // 获取用户名
  const userIds = leaderboard.map(entry => entry.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true }
  });

  const userMap = new Map(users.map(u => [u.id, u.username]));

  const rankings = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    username: userMap.get(entry.userId) || '未知用户',
    caughtCount: entry._count.speciesId
  }));

  return c.json({ success: true, data: { leaderboard: rankings } });
});

export default pokedex;
