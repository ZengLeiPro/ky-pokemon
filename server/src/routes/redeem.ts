import { Hono } from 'hono';
import { GameMode } from '@prisma/client';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

// ========== 礼包码配置 ==========

interface RedeemReward {
  items?: Array<{ id: string; name: string; description: string; category: string; quantity: number }>;
  money?: number;
}

interface RedeemCodeEntry {
  description: string;
  rewards: RedeemReward;
}

const REDEEM_CODES: Record<string, RedeemCodeEntry> = {
  'WELCOME2024': {
    description: '欢迎礼包',
    rewards: {
      items: [
        { id: 'ultraBall', name: '高级球', description: '性能比较好的精灵球。比超级球更容易捕捉宝可梦。', category: 'POKEBALLS', quantity: 10 },
        { id: 'superPotion', name: '好伤药', description: '喷雾式伤药。能恢复宝可梦60点HP。', category: 'MEDICINE', quantity: 5 },
      ],
      money: 5000,
    },
  },
  'MASTERBALL': {
    description: '大师球礼包',
    rewards: {
      items: [
        { id: 'masterBall', name: '大师球', description: '性能最好的精灵球。必定能捕捉野生宝可梦。', category: 'POKEBALLS', quantity: 1 },
      ],
    },
  },
  'JOHTO2024': {
    description: '城都地区冒险礼包',
    rewards: {
      items: [
        { id: 'potion', name: '伤药', description: '喷雾式伤药，能恢复宝可梦20点HP。', category: 'MEDICINE', quantity: 20 },
        { id: 'pokeball', name: '精灵球', description: '用于投向野生宝可梦并将其捕捉的球。', category: 'POKEBALLS', quantity: 30 },
      ],
      money: 10000,
    },
  },
  'LEGENDARY': {
    description: '传说宝可梦补给',
    rewards: {
      items: [
        { id: 'ultraBall', name: '高级球', description: '性能比较好的精灵球。比超级球更容易捕捉宝可梦。', category: 'POKEBALLS', quantity: 20 },
        { id: 'masterBall', name: '大师球', description: '性能最好的精灵球。必定能捕捉野生宝可梦。', category: 'POKEBALLS', quantity: 2 },
      ],
      money: 50000,
    },
  },
};

// ========== 内存中追踪已兑换的礼包码（userId -> Set<code>） ==========
const redeemedStore = new Map<string, Set<string>>();

const redeem = new Hono<{ Variables: { user: { userId: string } } }>();

redeem.use('/*', authMiddleware);

redeem.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.code !== 'string') {
    return c.json({ success: false, error: '请提供兑换码' }, 400);
  }

  const code = body.code.trim().toUpperCase();

  // 1. 检查礼包码是否存在
  const codeEntry = REDEEM_CODES[code];
  if (!codeEntry) {
    return c.json({ success: false, error: '无效的兑换码' }, 400);
  }

  // 2. 检查是否已经兑换过
  const userRedeemed = redeemedStore.get(user.userId);
  if (userRedeemed?.has(code)) {
    return c.json({ success: false, error: '该兑换码已使用过' }, 400);
  }

  // 3. 获取用户的游戏存档
  const mode: GameMode = (body.mode || 'NORMAL') as GameMode;
  const save = await db.gameSave.findUnique({
    where: {
      userId_mode: {
        userId: user.userId,
        mode,
      },
    },
  });

  if (!save) {
    return c.json({ success: false, error: '未找到游戏存档，请先开始游戏' }, 400);
  }

  // 4. 解析当前背包和金钱
  let inventory: Array<{ id: string; name: string; description: string; category: string; quantity: number }> = [];
  try {
    inventory = JSON.parse(save.inventory);
  } catch {
    inventory = [];
  }
  let money = save.money;

  // 5. 发放奖励
  const { rewards } = codeEntry;

  // 发放物品
  if (rewards.items) {
    for (const rewardItem of rewards.items) {
      const existing = inventory.find((i) => i.id === rewardItem.id);
      if (existing) {
        existing.quantity += rewardItem.quantity;
      } else {
        inventory.push({
          id: rewardItem.id,
          name: rewardItem.name,
          description: rewardItem.description,
          category: rewardItem.category,
          quantity: rewardItem.quantity,
        });
      }
    }
  }

  // 发放金钱
  if (rewards.money) {
    money += rewards.money;
  }

  // 6. 保存到数据库
  await db.gameSave.update({
    where: {
      userId_mode: {
        userId: user.userId,
        mode,
      },
    },
    data: {
      inventory: JSON.stringify(inventory),
      money,
    },
  });

  // 7. 标记已兑换
  if (!redeemedStore.has(user.userId)) {
    redeemedStore.set(user.userId, new Set());
  }
  redeemedStore.get(user.userId)!.add(code);

  // 8. 返回奖励信息
  return c.json({
    success: true,
    data: {
      description: codeEntry.description,
      rewards: codeEntry.rewards,
    },
  });
});

export default redeem;
