import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createPokemon } from '../../../shared/utils/pokemon-factory.js';
import { parseJsonOrThrow } from '../lib/game-save-utils.js';

// 礼包码配置
const REDEEM_CODES: Record<string, {
  description: string;
  rewards: {
    items?: Array<{ id: string; name: string; description: string; category: string; quantity: number }>;
    pokemon?: Array<{ speciesKey: string; level: number }>;
  };
}> = {
  'LKY202650': {
    description: '楷言特别礼包',
    rewards: {
      pokemon: [
        { speciesKey: 'lugia', level: 50 },
      ],
    },
  },
};

const redeem = new Hono<{ Variables: { user: { userId: string } } }>();
redeem.use('/*', authMiddleware);

redeem.post('/', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json<{ code: string }>();
  const code = body.code?.trim()?.toUpperCase();

  if (!code) {
    return c.json({ success: false, error: '请输入礼包码' }, 400);
  }

  const rewardConfig = REDEEM_CODES[code];
  if (!rewardConfig) {
    return c.json({ success: false, error: '无效的礼包码' }, 400);
  }

  // 检查是否已兑换过
  const existing = await db.redeemRecord.findUnique({
    where: { userId_code: { userId, code } },
  });
  if (existing) {
    return c.json({ success: false, error: '这个礼包码已经使用过了' }, 400);
  }

  // 查找用户当前存档（NORMAL 模式）
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: 'NORMAL' } },
  });
  if (!save) {
    return c.json({ success: false, error: '未找到游戏存档，请先开始游戏' }, 400);
  }

  const team = parseJsonOrThrow<any[]>(save.team, 'team');
  const pcBox = parseJsonOrThrow<any[]>(save.pcBox, 'pcBox');
  const inventory = parseJsonOrThrow<any[]>(save.inventory, 'inventory');
  const pokedex = parseJsonOrThrow<Record<string, string>>(save.pokedex, 'pokedex');
  const rewardSummary: string[] = [];

  // 发放物品
  if (rewardConfig.rewards.items) {
    for (const item of rewardConfig.rewards.items) {
      const existing = inventory.find((i: any) => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        inventory.push({ ...item });
      }
      rewardSummary.push(`${item.name} x${item.quantity}`);
    }
  }

  // 发放宝可梦
  if (rewardConfig.rewards.pokemon) {
    for (const p of rewardConfig.rewards.pokemon) {
      const newPokemon = createPokemon(p.speciesKey, p.level, []);
      if (team.length < 6) {
        team.push(newPokemon);
      } else {
        pcBox.push(newPokemon);
      }
      pokedex[String(newPokemon.speciesData.pokedexId)] = 'CAUGHT';
      rewardSummary.push(`${newPokemon.speciesName} (Lv.${p.level})`);
    }
  }

  // 事务：记录兑换 + 更新存档
  await db.$transaction([
    db.redeemRecord.create({
      data: { userId, code },
    }),
    db.gameSave.update({
      where: { userId_mode: { userId, mode: 'NORMAL' } },
      data: {
        team: JSON.stringify(team),
        pcBox: JSON.stringify(pcBox),
        inventory: JSON.stringify(inventory),
        pokedex: JSON.stringify(pokedex),
      },
    }),
  ]);

  return c.json({
    success: true,
    data: {
      description: rewardConfig.description,
      rewards: rewardSummary,
    },
  });
});

export default redeem;
