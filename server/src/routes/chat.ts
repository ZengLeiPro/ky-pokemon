import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendMessageSchema, getMessagesSchema } from '../../../shared/schemas/social.schema.js';
import { validateUUIDParam } from '../lib/validation.js';

const chat = new Hono<{ Variables: { user: { userId: string } } }>();

chat.use('/*', authMiddleware);

const PollQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(100)
});

// 获取与某好友的聊天记录
chat.get('/:friendId/messages', zValidator('query', getMessagesSchema), async (c) => {
  const user = c.get('user');
  const friendId = c.req.param('friendId');
  const invalidId = validateUUIDParam(c, friendId);
  if (invalidId) return invalidId;
  const { limit, before } = c.req.valid('query');

  // 验证是否是好友
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: user.userId, friendId: friendId, status: 'accepted' },
        { userId: friendId, friendId: user.userId, status: 'accepted' }
      ]
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '只能与好友聊天' }, 403);
  }

  // 构建查询条件
  const whereCondition: any = {
    OR: [
      { senderId: user.userId, receiverId: friendId },
      { senderId: friendId, receiverId: user.userId }
    ]
  };

  if (before) {
    const beforeMessage = await db.message.findUnique({ where: { id: before } });
    if (beforeMessage) {
      whereCondition.createdAt = { lt: beforeMessage.createdAt };
    }
  }

  const messages = await db.message.findMany({
    where: whereCondition,
    include: {
      sender: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  // 反转顺序（从旧到新）
  const result = messages.reverse().map(m => ({
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    senderUsername: m.sender.username,
    content: m.content,
    readAt: m.readAt?.toISOString() || null,
    createdAt: m.createdAt.toISOString(),
    isOwn: m.senderId === user.userId
  }));

  return c.json({ success: true, data: result });
});

// 发送消息
chat.post('/:friendId/send', zValidator('json', sendMessageSchema), async (c) => {
  const user = c.get('user');
  const friendId = c.req.param('friendId');
  const invalidId = validateUUIDParam(c, friendId);
  if (invalidId) return invalidId;
  const { content } = c.req.valid('json');

  // 验证是否是好友
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: user.userId, friendId: friendId, status: 'accepted' },
        { userId: friendId, friendId: user.userId, status: 'accepted' }
      ]
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '只能与好友聊天' }, 403);
  }

  const message = await db.message.create({
    data: {
      senderId: user.userId,
      receiverId: friendId,
      content
    },
    include: {
      sender: { select: { username: true } }
    }
  });

  return c.json({
    success: true,
    data: {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      senderUsername: message.sender.username,
      content: message.content,
      readAt: null,
      createdAt: message.createdAt.toISOString(),
      isOwn: true
    }
  });
});

// 获取未读消息数量
chat.get('/unread', async (c) => {
  const user = c.get('user');

  const unreadMessages = await db.message.groupBy({
    by: ['senderId'],
    where: {
      receiverId: user.userId,
      readAt: null
    },
    _count: { _all: true }
  });

  const byUser: Record<string, number> = {};
  let totalUnread = 0;

  unreadMessages.forEach(item => {
    byUser[item.senderId] = item._count._all;
    totalUnread += item._count._all;
  });

  return c.json({ success: true, data: { totalUnread, byUser } });
});

// 标记消息为已读
chat.post('/:friendId/read', async (c) => {
  const user = c.get('user');
  const friendId = c.req.param('friendId');
  const invalidId = validateUUIDParam(c, friendId);
  if (invalidId) return invalidId;

  // 只允许与好友之间的消息标记为已读
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: user.userId, friendId, status: 'accepted' },
        { userId: friendId, friendId: user.userId, status: 'accepted' }
      ]
    }
  });
  if (!friendship) {
    return c.json({ success: false, error: '只能与好友聊天' }, 403);
  }

  await db.message.updateMany({
    where: {
      senderId: friendId,
      receiverId: user.userId,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return c.json({ success: true, data: { message: '已标记为已读' } });
});

// 轮询获取新消息（返回所有未读）
chat.get('/poll', zValidator('query', PollQuerySchema), async (c) => {
  const user = c.get('user');
  const { limit } = c.req.valid('query');

  const messages = await db.message.findMany({
    where: {
      receiverId: user.userId,
      readAt: null
    },
    include: {
      sender: { select: { username: true } }
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  });

  const result = messages.map(m => ({
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    senderUsername: m.sender.username,
    content: m.content,
    readAt: null,
    createdAt: m.createdAt.toISOString(),
    isOwn: false
  }));

  return c.json({ success: true, data: result });
});

// 获取会话列表（所有有过聊天的好友）
chat.get('/conversations', async (c) => {
  const user = c.get('user');

  // 获取所有好友（仅 accepted）
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId: user.userId, status: 'accepted' },
        { friendId: user.userId, status: 'accepted' }
      ]
    },
    include: {
      user: { select: { id: true, username: true } },
      friend: { select: { id: true, username: true } }
    }
  });

  const friends = friendships.map((f) => (f.userId === user.userId ? f.friend : f.user));
  const friendIds = friends.map((f) => f.id);

  // 一次性获取最近消息，减少 N+1 查询
  const take = Math.min(1000, Math.max(friendIds.length * 20, 100));
  const recentMessages = friendIds.length === 0
    ? []
    : await db.message.findMany({
      where: {
        OR: [
          { senderId: user.userId, receiverId: { in: friendIds } },
          { senderId: { in: friendIds }, receiverId: user.userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take
    });

  const lastByFriend = new Map<string, { content: string; time: string }>();
  for (const m of recentMessages) {
    const otherId = m.senderId === user.userId ? m.receiverId : m.senderId;
    if (lastByFriend.has(otherId)) continue;
    lastByFriend.set(otherId, { content: m.content, time: m.createdAt.toISOString() });
    if (lastByFriend.size >= friendIds.length) break;
  }

  const unread = friendIds.length === 0
    ? []
    : await db.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: user.userId,
        readAt: null,
        senderId: { in: friendIds }
      },
      _count: { _all: true }
    });

  const unreadMap = new Map(unread.map((u) => [u.senderId, u._count._all]));

  const conversations = friends.map((f) => {
    const last = lastByFriend.get(f.id);
    return {
      friendUserId: f.id,
      odId: f.id,
      username: f.username,
      lastMessage: last?.content ?? '',
      lastMessageTime: last?.time ?? '',
      unreadCount: unreadMap.get(f.id) ?? 0
    };
  });

  // 按最后消息时间排序
  conversations.sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  return c.json({ success: true, data: conversations });
});

export default chat;
