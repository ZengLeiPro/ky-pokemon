import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createTradeRequestSchema, acceptTradeSchema } from '../../../shared/schemas/social.schema.js';
import { addPokemonToPcBox, parseJsonOrThrow, removePokemonById } from '../lib/game-save-utils.js';

const trade = new Hono<{ Variables: { user: { userId: string } } }>();

trade.use('/*', authMiddleware);

class ApiError extends Error {
  status: ContentfulStatusCode;

  constructor(status: ContentfulStatusCode, message: string) {
    super(message);
    this.status = status;
  }
}

// 辅助函数：从存档获取宝可梦
async function getPokemonFromSave(userId: string, pokemonId: string, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return null;

  const team = parseJsonOrThrow<any[]>(save.team, 'GameSave.team');
  const pcBox = parseJsonOrThrow<any[]>(save.pcBox, 'GameSave.pcBox');
  const allPokemon = [...team, ...pcBox];

  return allPokemon.find((p: any) => p.id === pokemonId);
}

// 发起交换请求
trade.post('/request', zValidator('json', createTradeRequestSchema), async (c) => {
  const user = c.get('user');
  const { receiverId, pokemonId, requestedType, message, isPublic } = c.req.valid('json');

  // 不能和自己交换
  if (receiverId === user.userId) {
    return c.json({ success: false, error: '不能和自己交换' }, 400);
  }

  // 验证接收者存在
  const receiver = await db.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  // 如果不是公开交换，验证是否是好友
  if (!isPublic) {
    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: user.userId, friendId: receiverId, status: 'accepted' },
          { userId: receiverId, friendId: user.userId, status: 'accepted' }
        ]
      }
    });
    if (!friendship) {
      return c.json({ success: false, error: '只能与好友进行私密交换' }, 403);
    }
  }

  // 获取要交换的宝可梦
  let pokemon: any;
  try {
    pokemon = await getPokemonFromSave(user.userId, pokemonId);
  } catch (e: any) {
    return c.json({ success: false, error: e.message || '读取存档失败' }, 500);
  }
  if (!pokemon) {
    return c.json({ success: false, error: '宝可梦不存在' }, 404);
  }

  // 创建交换请求
  const tradeRequest = await db.tradeRequest.create({
    data: {
      initiatorId: user.userId,
      receiverId,
      offeredPokemon: JSON.stringify({ pokemonId, snapshot: pokemon }),
      requestedType,
      message,
      isPublic
    },
    include: {
      initiator: { select: { username: true } },
      receiver: { select: { username: true } }
    }
  });

  return c.json({
    success: true,
    data: {
      id: tradeRequest.id,
      initiatorId: tradeRequest.initiatorId,
      initiatorUsername: tradeRequest.initiator.username,
      receiverId: tradeRequest.receiverId,
      receiverUsername: tradeRequest.receiver.username,
      offeredPokemon: JSON.parse(tradeRequest.offeredPokemon),
      requestedType: tradeRequest.requestedType,
      status: tradeRequest.status,
      receiverPokemon: null,
      message: tradeRequest.message,
      isPublic: tradeRequest.isPublic,
      createdAt: tradeRequest.createdAt.toISOString()
    }
  });
});

// 获取收到的交换请求
trade.get('/pending', async (c) => {
  const user = c.get('user');

  const requests = await db.tradeRequest.findMany({
    where: {
      receiverId: user.userId,
      status: 'pending'
    },
    include: {
      initiator: { select: { username: true } },
      receiver: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = requests.map(r => ({
    id: r.id,
    initiatorId: r.initiatorId,
    initiatorUsername: r.initiator.username,
    receiverId: r.receiverId,
    receiverUsername: r.receiver.username,
    offeredPokemon: JSON.parse(r.offeredPokemon),
    requestedType: r.requestedType,
    status: r.status,
    receiverPokemon: r.receiverPokemon ? JSON.parse(r.receiverPokemon) : null,
    message: r.message,
    isPublic: r.isPublic,
    createdAt: r.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 获取发出的交换请求
trade.get('/sent', async (c) => {
  const user = c.get('user');

  const requests = await db.tradeRequest.findMany({
    where: {
      initiatorId: user.userId,
      status: { in: ['pending', 'accepted'] }
    },
    include: {
      initiator: { select: { username: true } },
      receiver: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = requests.map(r => ({
    id: r.id,
    initiatorId: r.initiatorId,
    initiatorUsername: r.initiator.username,
    receiverId: r.receiverId,
    receiverUsername: r.receiver.username,
    offeredPokemon: JSON.parse(r.offeredPokemon),
    requestedType: r.requestedType,
    status: r.status,
    receiverPokemon: r.receiverPokemon ? JSON.parse(r.receiverPokemon) : null,
    message: r.message,
    isPublic: r.isPublic,
    createdAt: r.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 获取公开的交换请求（宝可梦中心）
trade.get('/public', async (c) => {
  const user = c.get('user');

  const requests = await db.tradeRequest.findMany({
    where: {
      isPublic: true,
      status: 'pending',
      initiatorId: { not: user.userId }  // 排除自己发起的
    },
    include: {
      initiator: { select: { username: true } },
      receiver: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const result = requests.map(r => ({
    id: r.id,
    initiatorId: r.initiatorId,
    initiatorUsername: r.initiator.username,
    receiverId: r.receiverId,
    receiverUsername: r.receiver.username,
    offeredPokemon: JSON.parse(r.offeredPokemon),
    requestedType: r.requestedType,
    status: r.status,
    receiverPokemon: null,
    message: r.message,
    isPublic: r.isPublic,
    createdAt: r.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 接受交换（选择自己的宝可梦）
trade.post('/:id/accept', zValidator('json', acceptTradeSchema), async (c) => {
  const user = c.get('user');
  const tradeId = c.req.param('id');
  const { pokemonId } = c.req.valid('json');

  const tradeRequest = await db.tradeRequest.findFirst({
    where: {
      id: tradeId,
      receiverId: user.userId,
      status: 'pending'
    }
  });

  if (!tradeRequest) {
    return c.json({ success: false, error: '交换请求不存在或已处理' }, 404);
  }

  // 获取接收者要交换的宝可梦
  let pokemon: any;
  try {
    pokemon = await getPokemonFromSave(user.userId, pokemonId);
  } catch (e: any) {
    return c.json({ success: false, error: e.message || '读取存档失败' }, 500);
  }
  if (!pokemon) {
    return c.json({ success: false, error: '宝可梦不存在' }, 404);
  }

  await db.tradeRequest.update({
    where: { id: tradeId },
    data: {
      status: 'accepted',
      receiverPokemon: JSON.stringify({ pokemonId, snapshot: pokemon })
    }
  });

  return c.json({ success: true, data: { message: '已接受交换，等待对方确认' } });
});

// 确认交换（发起者确认，执行实际交换）
trade.post('/:id/confirm', async (c) => {
  const user = c.get('user');
  const tradeId = c.req.param('id');

  try {
    await db.$transaction(async (tx) => {
      const tradeRequest = await tx.tradeRequest.findUnique({ where: { id: tradeId } });

      if (!tradeRequest) throw new ApiError(404, '交换请求不存在');
      if (tradeRequest.initiatorId !== user.userId) throw new ApiError(403, '只有发起者可以确认交换');
      if (tradeRequest.status !== 'accepted') {
        throw new ApiError(400, `交换状态为 ${tradeRequest.status}，无法确认`);
      }
      if (!tradeRequest.receiverPokemon) throw new ApiError(400, '接收者尚未选择宝可梦');

      // 抢占“确认交换”的执行权（利用 UPDATE 的行锁，避免并发重复结算）
      const claimed = await tx.tradeRequest.updateMany({
        where: { id: tradeId, status: 'accepted' },
        data: { status: 'accepted' }
      });
      if (claimed.count === 0) throw new ApiError(409, '交换已被处理，请刷新后重试');

      let offeredPokemon: { pokemonId: string; snapshot: any };
      let receiverPokemon: { pokemonId: string; snapshot: any };
      try {
        offeredPokemon = JSON.parse(tradeRequest.offeredPokemon);
        receiverPokemon = JSON.parse(tradeRequest.receiverPokemon);
      } catch {
        throw new ApiError(500, '交换数据损坏，无法完成交换');
      }

      const [initiatorSave, receiverSave] = await Promise.all([
        tx.gameSave.findUnique({ where: { userId_mode: { userId: tradeRequest.initiatorId, mode: 'NORMAL' } } }),
        tx.gameSave.findUnique({ where: { userId_mode: { userId: tradeRequest.receiverId, mode: 'NORMAL' } } })
      ]);

      if (!initiatorSave) throw new ApiError(400, '发起者没有 NORMAL 存档，无法完成交换');
      if (!receiverSave) throw new ApiError(400, '接收者没有 NORMAL 存档，无法完成交换');

      const initiatorTeam = parseJsonOrThrow<any[]>(initiatorSave.team, 'GameSave.team');
      const initiatorPcBox = parseJsonOrThrow<any[]>(initiatorSave.pcBox, 'GameSave.pcBox');
      const receiverTeam = parseJsonOrThrow<any[]>(receiverSave.team, 'GameSave.team');
      const receiverPcBox = parseJsonOrThrow<any[]>(receiverSave.pcBox, 'GameSave.pcBox');

      const removed1 = removePokemonById(initiatorTeam, initiatorPcBox, offeredPokemon.pokemonId);
      if (!removed1) {
        throw new ApiError(400, '无法移除发起者的宝可梦（可能已不存在或队伍只剩 1 只）');
      }

      const removed2 = removePokemonById(receiverTeam, receiverPcBox, receiverPokemon.pokemonId);
      if (!removed2) {
        throw new ApiError(400, '无法移除接收者的宝可梦（可能已不存在或队伍只剩 1 只）');
      }

      // 交换完成后将宝可梦放入对方 PC，并生成新 ID（避免跨账号冲突）
      addPokemonToPcBox(receiverPcBox, offeredPokemon.snapshot);
      addPokemonToPcBox(initiatorPcBox, receiverPokemon.snapshot);

      await Promise.all([
        tx.gameSave.update({
          where: { userId_mode: { userId: tradeRequest.initiatorId, mode: 'NORMAL' } },
          data: { team: JSON.stringify(initiatorTeam), pcBox: JSON.stringify(initiatorPcBox) }
        }),
        tx.gameSave.update({
          where: { userId_mode: { userId: tradeRequest.receiverId, mode: 'NORMAL' } },
          data: { team: JSON.stringify(receiverTeam), pcBox: JSON.stringify(receiverPcBox) }
        }),
        tx.tradeRequest.update({ where: { id: tradeId }, data: { status: 'completed' } })
      ]);
    });

    return c.json({ success: true, data: { message: '交换完成！' } });
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : 500;
    return c.json({ success: false, error: e.message || '交换失败' }, status);
  }
});

// 拒绝交换
trade.post('/:id/reject', async (c) => {
  const user = c.get('user');
  const tradeId = c.req.param('id');

  const tradeRequest = await db.tradeRequest.findFirst({
    where: {
      id: tradeId,
      receiverId: user.userId,
      status: 'pending'
    }
  });

  if (!tradeRequest) {
    return c.json({ success: false, error: '交换请求不存在或已处理' }, 404);
  }

  await db.tradeRequest.update({
    where: { id: tradeId },
    data: { status: 'rejected' }
  });

  return c.json({ success: true, data: { message: '已拒绝交换' } });
});

// 取消交换
trade.post('/:id/cancel', async (c) => {
  const user = c.get('user');
  const tradeId = c.req.param('id');

  const tradeRequest = await db.tradeRequest.findFirst({
    where: {
      id: tradeId,
      initiatorId: user.userId,
      status: { in: ['pending', 'accepted'] }
    }
  });

  if (!tradeRequest) {
    return c.json({ success: false, error: '交换请求不存在或无法取消' }, 404);
  }

  await db.tradeRequest.update({
    where: { id: tradeId },
    data: { status: 'cancelled' }
  });

  return c.json({ success: true, data: { message: '已取消交换' } });
});

export default trade;
