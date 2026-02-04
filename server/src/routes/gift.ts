import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { zValidator } from '@hono/zod-validator';

import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendItemGiftSchema, sendPokemonGiftSchema } from '../../../shared/schemas/social.schema.js';
import {
  addInventoryItem,
  addPokemonToPcBox,
  InventoryItemSnapshot,
  parseJsonOrThrow,
  removeInventoryItem,
  removePokemonById
} from '../lib/game-save-utils.js';
import { validateUUIDParam } from '../lib/validation.js';

class ApiError extends Error {
  status: ContentfulStatusCode;

  constructor(status: ContentfulStatusCode, message: string) {
    super(message);
    this.status = status;
  }
}

const gift = new Hono<{ Variables: { user: { userId: string } } }>();
gift.use('/*', authMiddleware);

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

function parseInventory(save: { inventory: string }) {
  return parseJsonOrThrow<InventoryItemSnapshot[]>(save.inventory, 'GameSave.inventory');
}

function parseTeamPcBox(save: { team: string; pcBox: string }) {
  return {
    team: parseJsonOrThrow<any[]>(save.team, 'GameSave.team'),
    pcBox: parseJsonOrThrow<any[]>(save.pcBox, 'GameSave.pcBox')
  };
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

  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId: user.userId, mode: 'NORMAL' } }
  });
  if (!save) return c.json({ success: false, error: '你没有 NORMAL 存档' }, 400);

  let team: any[];
  let pcBox: any[];
  try {
    ({ team, pcBox } = parseTeamPcBox(save));
  } catch (e: any) {
    return c.json({ success: false, error: e.message || '读取存档失败' }, 500);
  }

  const allPokemon = [...team, ...pcBox];
  const pokemon = allPokemon.find((p: any) => p.id === pokemonId);
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

  return c.json({ success: true, data: { id: giftRequest.id } });
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

  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId: user.userId, mode: 'NORMAL' } }
  });
  if (!save) return c.json({ success: false, error: '你没有 NORMAL 存档' }, 400);

  let inventory: InventoryItemSnapshot[];
  try {
    inventory = parseInventory(save);
  } catch (e: any) {
    return c.json({ success: false, error: e.message || '读取存档失败' }, 500);
  }

  const item = inventory.find((i) => i.id === itemId);
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
      giftItemName: item.name,
      giftItemDescription: item.description,
      giftItemCategory: item.category,
      message,
      status: 'pending'
    }
  });

  return c.json({ success: true, data: { id: giftRequest.id } });
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

  const result = gifts.map((g) => ({
    id: g.id,
    senderId: g.senderId,
    senderUsername: g.sender.username,
    receiverId: g.receiverId,
    receiverUsername: g.receiver.username,
    giftType: g.giftType,
    giftPokemon: g.giftPokemon ? JSON.parse(g.giftPokemon) : null,
    giftItemId: g.giftItemId,
    giftItemName: g.giftItemName ?? g.giftItemId ?? null,
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

  const result = gifts.map((g) => ({
    id: g.id,
    senderId: g.senderId,
    senderUsername: g.sender.username,
    receiverId: g.receiverId,
    receiverUsername: g.receiver.username,
    giftType: g.giftType,
    giftPokemon: g.giftPokemon ? JSON.parse(g.giftPokemon) : null,
    giftItemId: g.giftItemId,
    giftItemName: g.giftItemName ?? g.giftItemId ?? null,
    giftItemQuantity: g.giftItemQuantity,
    status: g.status,
    message: g.message,
    createdAt: g.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 接受礼物（使用事务保证一致性）
gift.post('/:id/accept', async (c) => {
  const user = c.get('user');
  const giftId = c.req.param('id');
  const invalidId = validateUUIDParam(c, giftId);
  if (invalidId) return invalidId;

  try {
    await db.$transaction(async (tx) => {
      const giftRequest = await tx.giftRequest.findUnique({ where: { id: giftId } });
      if (!giftRequest) throw new ApiError(404, '礼物不存在');
      if (giftRequest.receiverId !== user.userId) throw new ApiError(403, '无权操作此礼物');
      if (giftRequest.status !== 'pending') throw new ApiError(400, '礼物状态无效');

      // 抢占“接受礼物”的执行权（利用 UPDATE 的行锁，避免并发重复领取）
      const claimed = await tx.giftRequest.updateMany({
        where: { id: giftId, receiverId: user.userId, status: 'pending' },
        data: { status: 'pending' }
      });
      if (claimed.count === 0) throw new ApiError(409, '礼物已被处理，请刷新后重试');

      const receiverSave = await tx.gameSave.findUnique({
        where: { userId_mode: { userId: user.userId, mode: 'NORMAL' } }
      });
      if (!receiverSave) throw new ApiError(400, '你没有 NORMAL 存档');

      if (giftRequest.giftType === 'pokemon') {
        if (!giftRequest.giftPokemon) throw new ApiError(500, '礼物数据损坏');
        let giftPokemon: { pokemonId: string; snapshot: any };
        try {
          giftPokemon = JSON.parse(giftRequest.giftPokemon);
        } catch {
          throw new ApiError(500, '礼物数据损坏');
        }

        const senderSave = await tx.gameSave.findUnique({
          where: { userId_mode: { userId: giftRequest.senderId, mode: 'NORMAL' } }
        });
        if (!senderSave) throw new ApiError(400, '发送方没有 NORMAL 存档');

        const senderParsed = parseTeamPcBox(senderSave);
        const receiverParsed = parseTeamPcBox(receiverSave);

        const removed = removePokemonById(senderParsed.team, senderParsed.pcBox, giftPokemon.pokemonId);
        if (!removed) {
          throw new ApiError(400, '发送方宝可梦已不存在或队伍只剩 1 只');
        }

        addPokemonToPcBox(receiverParsed.pcBox, giftPokemon.snapshot);

        await Promise.all([
          tx.gameSave.update({
            where: { userId_mode: { userId: giftRequest.senderId, mode: 'NORMAL' } },
            data: {
              team: JSON.stringify(senderParsed.team),
              pcBox: JSON.stringify(senderParsed.pcBox)
            }
          }),
          tx.gameSave.update({
            where: { userId_mode: { userId: user.userId, mode: 'NORMAL' } },
            data: {
              team: JSON.stringify(receiverParsed.team),
              pcBox: JSON.stringify(receiverParsed.pcBox)
            }
          })
        ]);
      } else if (giftRequest.giftType === 'item') {
        if (!giftRequest.giftItemId || !giftRequest.giftItemQuantity) {
          throw new ApiError(500, '礼物数据损坏');
        }

        const senderSave = await tx.gameSave.findUnique({
          where: { userId_mode: { userId: giftRequest.senderId, mode: 'NORMAL' } }
        });
        if (!senderSave) throw new ApiError(400, '发送方没有 NORMAL 存档');

        const senderInventory = parseInventory(senderSave);
        const receiverInventory = parseInventory(receiverSave);

        const removed = removeInventoryItem(senderInventory, giftRequest.giftItemId, giftRequest.giftItemQuantity);
        if (!removed) {
          throw new ApiError(400, '发送方物品已不存在或数量不足');
        }

        addInventoryItem(
          receiverInventory,
          {
            id: giftRequest.giftItemId,
            name: giftRequest.giftItemName ?? giftRequest.giftItemId,
            description: giftRequest.giftItemDescription ?? '',
            category: giftRequest.giftItemCategory ?? 'MEDICINE'
          },
          giftRequest.giftItemQuantity
        );

        await Promise.all([
          tx.gameSave.update({
            where: { userId_mode: { userId: giftRequest.senderId, mode: 'NORMAL' } },
            data: { inventory: JSON.stringify(senderInventory) }
          }),
          tx.gameSave.update({
            where: { userId_mode: { userId: user.userId, mode: 'NORMAL' } },
            data: { inventory: JSON.stringify(receiverInventory) }
          })
        ]);
      } else {
        throw new ApiError(400, '礼物类型无效');
      }

      await tx.giftRequest.update({
        where: { id: giftId },
        data: { status: 'accepted' }
      });
    });

    return c.json({ success: true });
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : 500;
    return c.json({ success: false, error: e.message || '接受礼物失败' }, status);
  }
});

// 拒绝礼物
gift.post('/:id/reject', async (c) => {
  const user = c.get('user');
  const giftId = c.req.param('id');
  const invalidId = validateUUIDParam(c, giftId);
  if (invalidId) return invalidId;

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
  const invalidId = validateUUIDParam(c, giftId);
  if (invalidId) return invalidId;

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
