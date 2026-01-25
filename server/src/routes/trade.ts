import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createTradeRequestSchema, acceptTradeSchema } from '../../../shared/schemas/social.schema.js';

const trade = new Hono<{ Variables: { user: { userId: string } } }>();

trade.use('/*', authMiddleware);

// 辅助函数：从存档获取宝可梦
async function getPokemonFromSave(userId: string, pokemonId: string, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return null;

  const team = JSON.parse(save.team);
  const pcBox = JSON.parse(save.pcBox);
  const allPokemon = [...team, ...pcBox];

  return allPokemon.find((p: any) => p.id === pokemonId);
}

// 辅助函数：从存档移除宝可梦
async function removePokemonFromSave(userId: string, pokemonId: string, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return false;

  const team = JSON.parse(save.team);
  const pcBox = JSON.parse(save.pcBox);

  const teamIndex = team.findIndex((p: any) => p.id === pokemonId);
  const pcIndex = pcBox.findIndex((p: any) => p.id === pokemonId);

  if (teamIndex !== -1) {
    // 队伍中至少保留1只宝可梦
    if (team.length <= 1) return false;
    team.splice(teamIndex, 1);
  } else if (pcIndex !== -1) {
    pcBox.splice(pcIndex, 1);
  } else {
    return false;
  }

  await db.gameSave.update({
    where: { userId_mode: { userId, mode: gameMode } },
    data: {
      team: JSON.stringify(team),
      pcBox: JSON.stringify(pcBox)
    }
  });

  return true;
}

// 辅助函数：添加宝可梦到存档
async function addPokemonToSave(userId: string, pokemon: any, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return false;

  const pcBox = JSON.parse(save.pcBox);

  // 生成新的 ID 避免冲突
  pokemon.id = crypto.randomUUID();
  pcBox.push(pokemon);

  await db.gameSave.update({
    where: { userId_mode: { userId, mode: gameMode } },
    data: { pcBox: JSON.stringify(pcBox) }
  });

  return true;
}

// 发起交换请求
trade.post('/request', zValidator('json', createTradeRequestSchema), async (c) => {
  const user = c.get('user');
  const { receiverId, pokemonId, requestedType, message, isPublic } = c.req.valid('json');

  // 不能和自己交换
  if (receiverId === user.id) {
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
          { userId: user.id, friendId: receiverId, status: 'accepted' },
          { userId: receiverId, friendId: user.id, status: 'accepted' }
        ]
      }
    });
    if (!friendship) {
      return c.json({ success: false, error: '只能与好友进行私密交换' }, 403);
    }
  }

  // 获取要交换的宝可梦
  const pokemon = await getPokemonFromSave(user.id, pokemonId);
  if (!pokemon) {
    return c.json({ success: false, error: '宝可梦不存在' }, 404);
  }

  // 创建交换请求
  const tradeRequest = await db.tradeRequest.create({
    data: {
      initiatorId: user.id,
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
      receiverId: user.id,
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
      initiatorId: user.id,
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
      initiatorId: { not: user.id }  // 排除自己发起的
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
      receiverId: user.id,
      status: 'pending'
    }
  });

  if (!tradeRequest) {
    return c.json({ success: false, error: '交换请求不存在或已处理' }, 404);
  }

  // 获取接收者要交换的宝可梦
  const pokemon = await getPokemonFromSave(user.id, pokemonId);
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

  const tradeRequest = await db.tradeRequest.findFirst({
    where: {
      id: tradeId,
      initiatorId: user.id,
      status: 'accepted'
    }
  });

  if (!tradeRequest) {
    return c.json({ success: false, error: '交换请求不存在或状态不正确' }, 404);
  }

  const offeredPokemon = JSON.parse(tradeRequest.offeredPokemon);
  const receiverPokemon = JSON.parse(tradeRequest.receiverPokemon!);

  // 执行交换
  // 1. 从发起者处移除宝可梦
  const removed1 = await removePokemonFromSave(tradeRequest.initiatorId, offeredPokemon.pokemonId);
  if (!removed1) {
    return c.json({ success: false, error: '无法移除发起者的宝可梦' }, 400);
  }

  // 2. 从接收者处移除宝可梦
  const removed2 = await removePokemonFromSave(tradeRequest.receiverId, receiverPokemon.pokemonId);
  if (!removed2) {
    // 回滚：把发起者的宝可梦加回去
    await addPokemonToSave(tradeRequest.initiatorId, offeredPokemon.snapshot);
    return c.json({ success: false, error: '无法移除接收者的宝可梦' }, 400);
  }

  // 3. 把发起者的宝可梦给接收者
  await addPokemonToSave(tradeRequest.receiverId, offeredPokemon.snapshot);

  // 4. 把接收者的宝可梦给发起者
  await addPokemonToSave(tradeRequest.initiatorId, receiverPokemon.snapshot);

  // 5. 更新交换状态
  await db.tradeRequest.update({
    where: { id: tradeId },
    data: { status: 'completed' }
  });

  return c.json({ success: true, data: { message: '交换完成！' } });
});

// 拒绝交换
trade.post('/:id/reject', async (c) => {
  const user = c.get('user');
  const tradeId = c.req.param('id');

  const tradeRequest = await db.tradeRequest.findFirst({
    where: {
      id: tradeId,
      receiverId: user.id,
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
      initiatorId: user.id,
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
