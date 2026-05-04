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

// 查询当前用户在图鉴排行榜中的排名
pokedex.get('/me-rank', async (c) => {
  const user = c.get('user');

  // 当前用户已捕获数量
  const myCount = await db.pokedexEntry.count({
    where: { userId: user.userId, status: 'CAUGHT' }
  });

  // 所有玩家按捕获数分组（只统计有至少 1 只 CAUGHT 的）
  const allPlayers = await db.pokedexEntry.groupBy({
    by: ['userId'],
    where: { status: 'CAUGHT' },
    _count: { speciesId: true },
    orderBy: { _count: { speciesId: 'desc' } }
  });

  // 排名 = 捕获数严格多于自己的玩家数 + 1（并列取较高排名）
  const betterCount = allPlayers.filter(p => p._count.speciesId > myCount).length;
  const rank = myCount > 0 ? betterCount + 1 : null; // 未抓到任何宝可梦则不参与排名

  return c.json({
    success: true,
    data: {
      rank,
      caughtCount: myCount,
      totalRankedPlayers: allPlayers.length
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

// ===== 每日大师球结算（一次性活动：2026-05-04）=====
// 北京时间 2026-05-04 15:30 后，给排行榜第 1 名发 1 个大师球
// 全局只结算一次，由用户访问触发（任何登录用户都可以触发，幂等保证只执行一次）
const MASTER_BALL_EVENT_KEY = 'master_ball_grant_2026-05-04';
const MASTER_BALL_GRANT_AT_MS = Date.UTC(2026, 4, 4, 7, 30); // 北京时间 2026-05-04 15:30 = UTC 07:30
const MASTER_BALL_DEADLINE_MS = Date.UTC(2026, 4, 4, 16, 0); // 北京时间 2026-05-05 00:00 截止

pokedex.post('/grant-daily-master-ball', async (c) => {
  const now = Date.now();
  if (now < MASTER_BALL_GRANT_AT_MS) {
    return c.json({ success: true, data: { granted: false, status: 'pending', startsAt: MASTER_BALL_GRANT_AT_MS } });
  }
  if (now >= MASTER_BALL_DEADLINE_MS) {
    return c.json({ success: true, data: { granted: false, status: 'expired' } });
  }

  // 先看是否已结算过
  const existing = await db.dailyEvent.findUnique({ where: { eventKey: MASTER_BALL_EVENT_KEY } });
  if (existing) {
    const payload = existing.payload ? JSON.parse(existing.payload) : null;
    return c.json({ success: true, data: { granted: false, status: 'already_granted', winner: payload } });
  }

  // 查排行榜第 1 名
  const top = await db.pokedexEntry.groupBy({
    by: ['userId'],
    where: { status: 'CAUGHT' },
    _count: { speciesId: true },
    orderBy: { _count: { speciesId: 'desc' } },
    take: 1
  });
  if (top.length === 0) {
    return c.json({ success: true, data: { granted: false, status: 'no_winner' } });
  }
  const winnerId = top[0].userId;
  const caughtCount = top[0]._count.speciesId;
  const winnerUser = await db.user.findUnique({ where: { id: winnerId }, select: { username: true } });

  // 加大师球到第一名 NORMAL 存档
  const save = await db.gameSave.findUnique({ where: { userId_mode: { userId: winnerId, mode: 'NORMAL' } } });
  if (!save) {
    return c.json({ success: true, data: { granted: false, status: 'no_save' } });
  }
  const inventory = JSON.parse(save.inventory) as Array<{ id: string; name: string; description: string; category: string; quantity: number }>;
  const masterBall = inventory.find(i => i.id === 'masterball');
  if (masterBall) {
    masterBall.quantity += 1;
  } else {
    inventory.push({ id: 'masterball', name: '大师球', description: '必定能捉到的终极球', category: 'POKEBALLS', quantity: 1 });
  }

  const winnerPayload = { userId: winnerId, username: winnerUser?.username ?? '未知', caughtCount };

  // 事务：写 DailyEvent（唯一约束保证幂等）+ 更新 inventory
  try {
    await db.$transaction([
      db.dailyEvent.create({ data: { eventKey: MASTER_BALL_EVENT_KEY, payload: JSON.stringify(winnerPayload) } }),
      db.gameSave.update({
        where: { userId_mode: { userId: winnerId, mode: 'NORMAL' } },
        data: { inventory: JSON.stringify(inventory) }
      })
    ]);
  } catch (e: any) {
    // 唯一约束冲突 = 并发请求中另一个已经成功，重新读一次返回
    const after = await db.dailyEvent.findUnique({ where: { eventKey: MASTER_BALL_EVENT_KEY } });
    if (after) {
      const payload = after.payload ? JSON.parse(after.payload) : null;
      return c.json({ success: true, data: { granted: false, status: 'already_granted', winner: payload } });
    }
    throw e;
  }

  return c.json({ success: true, data: { granted: true, status: 'granted', winner: winnerPayload } });
});

export default pokedex;
