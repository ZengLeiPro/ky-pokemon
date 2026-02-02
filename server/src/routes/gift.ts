import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendPokemonGiftSchema, sendItemGiftSchema } from '../../../shared/schemas/social.schema.js';

const gift = new Hono<{ Variables: { user: { userId: string } } }>();

gift.use('/*', authMiddleware);

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

// 辅助函数：从存档移除宝可梦（按快照信息匹配）
async function removePokemonBySnapshot(userId: string, snapshot: any, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return false;

  const team = JSON.parse(save.team);
  const pcBox = JSON.parse(save.pcBox);

  const { speciesName, level, nickname } = snapshot;
  let teamIndex = team.findIndex((p: any) =>
    p.speciesName === speciesName && p.level === level && p.nickname === nickname
  );
  let pcIndex = pcBox.findIndex((p: any) =>
    p.speciesName === speciesName && p.level === level && p.nickname === nickname
  );

  if (teamIndex !== -1) {
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
  pokemon.id = crypto.randomUUID();
  pcBox.push(pokemon);

  await db.gameSave.update({
    where: { userId_mode: { userId, mode: gameMode } },
    data: { pcBox: JSON.stringify(pcBox) }
  });

  return true;
}

// 辅助函数：从存档获取物品
async function getItemFromSave(userId: string, itemId: string, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return null;

  const inventory = JSON.parse(save.inventory);
  return inventory.find((item: any) => item.id === itemId);
}

// 辅助函数：减少物品数量
async function removeItemFromSave(userId: string, itemId: string, quantity: number, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return false;

  const inventory = JSON.parse(save.inventory);
  const itemIndex = inventory.findIndex((item: any) => item.id === itemId);

  if (itemIndex === -1) return false;

  const item = inventory[itemIndex];
  if (item.quantity < quantity) return false;

  item.quantity -= quantity;
  if (item.quantity <= 0) {
    inventory.splice(itemIndex, 1);
  }

  await db.gameSave.update({
    where: { userId_mode: { userId, mode: gameMode } },
    data: { inventory: JSON.stringify(inventory) }
  });

  return true;
}

// 辅助函数：添加物品到存档
async function addItemToSave(userId: string, itemId: string, itemName: string, quantity: number, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return false;

  const inventory = JSON.parse(save.inventory);
  const existingItem = inventory.find((item: any) => item.id === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    inventory.push({
      id: itemId,
      name: itemName,
      description: '',
      category: 'MEDICINE',
      quantity
    });
  }

  await db.gameSave.update({
    where: { userId_mode: { userId, mode: gameMode } },
    data: { inventory: JSON.stringify(inventory) }
  });

  return true;
}

// 辅助函数：检查是否为好友
async function areFriends(userId1: string, userId2: string) {
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: userId1, friendId: userId2, status: 'accepted' },
        { userId: userId2, friendId: userId1, status: 'accepted' }
      ]
    }
  });
  return !!friendship;
}

// 发送宝可梦礼物
gift.post('/send-pokemon', zValidator('json', sendPokemonGiftSchema), async (c) => {
  const user = c.get('user');
  const { receiverId, pokemonId, message } = c.req.valid('json');

  if (receiverId === user.userId) {
    return c.json({ success: false, error: '不能给自己赠送' }, 400);
  }

  const receiver = await db.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  if (!await areFriends(user.userId, receiverId)) {
    return c.json({ success: false, error: '只能给好友赠送礼物' }, 403);
  }

  const pokemon = await getPokemonFromSave(user.userId, pokemonId);
  if (!pokemon) {
    return c.json({ success: false, error: '宝可梦不存在' }, 404);
  }

  const giftRequest = await db.giftRequest.create({
    data: {
      senderId: user.userId,
      receiverId,
      giftType: 'pokemon',
      giftPokemon: JSON.stringify({ pokemonId, snapshot: pokemon }),
      message,
      status: 'pending'
    }
  });

  return c.json({
    success: true,
    data: { id: giftRequest.id }
  });
});

// 发送物品礼物
gift.post('/send-item', zValidator('json', sendItemGiftSchema), async (c) => {
  const user = c.get('user');
  const { receiverId, itemId, quantity, message } = c.req.valid('json');

  if (receiverId === user.userId) {
    return c.json({ success: false, error: '不能给自己赠送' }, 400);
  }

  const receiver = await db.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  if (!await areFriends(user.userId, receiverId)) {
    return c.json({ success: false, error: '只能给好友赠送礼物' }, 403);
  }

  const item = await getItemFromSave(user.userId, itemId);
  if (!item) {
    return c.json({ success: false, error: '物品不存在' }, 404);
  }

  if (item.category === 'KEY_ITEMS') {
    return c.json({ success: false, error: '重要物品不能赠送' }, 400);
  }

  if (item.quantity < quantity) {
    return c.json({ success: false, error: '物品数量不足' }, 400);
  }

  const giftRequest = await db.giftRequest.create({
    data: {
      senderId: user.userId,
      receiverId,
      giftType: 'item',
      giftItemId: itemId,
      giftItemQuantity: quantity,
      message,
      status: 'pending'
    }
  });

  return c.json({
    success: true,
    data: { id: giftRequest.id }
  });
});

// 获取收到的待处理礼物
gift.get('/pending', async (c) => {
  const user = c.get('user');

  const gifts = await db.giftRequest.findMany({
    where: {
      receiverId: user.userId,
      status: 'pending'
    },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = gifts.map(g => ({
    id: g.id,
    senderId: g.senderId,
    senderUsername: g.sender.username,
    receiverId: g.receiverId,
    receiverUsername: g.receiver.username,
    giftType: g.giftType,
    giftPokemon: g.giftPokemon ? JSON.parse(g.giftPokemon) : null,
    giftItemId: g.giftItemId,
    giftItemName: g.giftItemId || null,
    giftItemQuantity: g.giftItemQuantity,
    status: g.status,
    message: g.message,
    createdAt: g.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 获取发出的礼物
gift.get('/sent', async (c) => {
  const user = c.get('user');

  const gifts = await db.giftRequest.findMany({
    where: { senderId: user.userId },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = gifts.map(g => ({
    id: g.id,
    senderId: g.senderId,
    senderUsername: g.sender.username,
    receiverId: g.receiverId,
    receiverUsername: g.receiver.username,
    giftType: g.giftType,
    giftPokemon: g.giftPokemon ? JSON.parse(g.giftPokemon) : null,
    giftItemId: g.giftItemId,
    giftItemName: g.giftItemId || null,
    giftItemQuantity: g.giftItemQuantity,
    status: g.status,
    message: g.message,
    createdAt: g.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 接受礼物
gift.post('/:id/accept', async (c) => {
  const user = c.get('user');
  const giftId = c.req.param('id');

  const giftRequest = await db.giftRequest.findUnique({
    where: { id: giftId },
    include: {
      sender: { select: { id: true, username: true } }
    }
  });

  if (!giftRequest) {
    return c.json({ success: false, error: '礼物不存在' }, 404);
  }

  if (giftRequest.receiverId !== user.userId) {
    return c.json({ success: false, error: '无权操作此礼物' }, 403);
  }

  if (giftRequest.status !== 'pending') {
    return c.json({ success: false, error: '礼物状态无效' }, 400);
  }

  if (giftRequest.giftType === 'pokemon') {
    const giftPokemon = JSON.parse(giftRequest.giftPokemon!);

    // 从发送方移除宝可梦
    const removed = await removePokemonBySnapshot(giftRequest.senderId, giftPokemon.snapshot);
    if (!removed) {
      return c.json({ success: false, error: '发送方宝可梦已不存在或队伍只剩1只' }, 400);
    }

    // 添加到接收方
    const added = await addPokemonToSave(user.userId, { ...giftPokemon.snapshot });
    if (!added) {
      // 回滚：把宝可梦加回发送方
      await addPokemonToSave(giftRequest.senderId, { ...giftPokemon.snapshot });
      return c.json({ success: false, error: '无法添加宝可梦到你的存档' }, 500);
    }
  } else if (giftRequest.giftType === 'item') {
    // 从发送方移除物品
    const removed = await removeItemFromSave(
      giftRequest.senderId,
      giftRequest.giftItemId!,
      giftRequest.giftItemQuantity!
    );
    if (!removed) {
      return c.json({ success: false, error: '发送方物品已不存在或数量不足' }, 400);
    }

    // 添加到接收方
    const added = await addItemToSave(
      user.userId,
      giftRequest.giftItemId!,
      giftRequest.giftItemId!, // 用 itemId 作为临时名称
      giftRequest.giftItemQuantity!
    );
    if (!added) {
      // 回滚
      await addItemToSave(
        giftRequest.senderId,
        giftRequest.giftItemId!,
        giftRequest.giftItemId!,
        giftRequest.giftItemQuantity!
      );
      return c.json({ success: false, error: '无法添加物品到你的存档' }, 500);
    }
  }

  // 更新状态
  await db.giftRequest.update({
    where: { id: giftId },
    data: { status: 'accepted' }
  });

  return c.json({ success: true });
});

// 拒绝礼物
gift.post('/:id/reject', async (c) => {
  const user = c.get('user');
  const giftId = c.req.param('id');

  const giftRequest = await db.giftRequest.findUnique({
    where: { id: giftId }
  });

  if (!giftRequest) {
    return c.json({ success: false, error: '礼物不存在' }, 404);
  }

  if (giftRequest.receiverId !== user.userId) {
    return c.json({ success: false, error: '无权操作此礼物' }, 403);
  }

  if (giftRequest.status !== 'pending') {
    return c.json({ success: false, error: '礼物状态无效' }, 400);
  }

  await db.giftRequest.update({
    where: { id: giftId },
    data: { status: 'rejected' }
  });

  return c.json({ success: true });
});

// 取消礼物
gift.post('/:id/cancel', async (c) => {
  const user = c.get('user');
  const giftId = c.req.param('id');

  const giftRequest = await db.giftRequest.findUnique({
    where: { id: giftId }
  });

  if (!giftRequest) {
    return c.json({ success: false, error: '礼物不存在' }, 404);
  }

  if (giftRequest.senderId !== user.userId) {
    return c.json({ success: false, error: '只有发送者可以取消礼物' }, 403);
  }

  if (giftRequest.status !== 'pending') {
    return c.json({ success: false, error: '只能取消待处理的礼物' }, 400);
  }

  await db.giftRequest.update({
    where: { id: giftId },
    data: { status: 'cancelled' }
  });

  return c.json({ success: true });
});

export default gift;
