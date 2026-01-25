import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendMessageSchema, getMessagesSchema } from '../../../shared/schemas/social.schema.js';

const chat = new Hono<{ Variables: { user: { userId: string } } }>();

chat.use('/*', authMiddleware);

// 获取与某好友的聊天记录
chat.get('/:friendId/messages', zValidator('query', getMessagesSchema), async (c) => {
  const user = c.get('user');
  const friendId = c.req.param('friendId');
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
    _count: true
  });

  const byUser: Record<string, number> = {};
  let totalUnread = 0;

  unreadMessages.forEach(item => {
    byUser[item.senderId] = item._count;
    totalUnread += item._count;
  });

  return c.json({ success: true, data: { totalUnread, byUser } });
});

// 标记消息为已读
chat.post('/:friendId/read', async (c) => {
  const user = c.get('user');
  const friendId = c.req.param('friendId');

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
chat.get('/poll', async (c) => {
  const user = c.get('user');

  const messages = await db.message.findMany({
    where: {
      receiverId: user.userId,
      readAt: null
    },
    include: {
      sender: { select: { username: true } }
    },
    orderBy: { createdAt: 'asc' }
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

  // 获取所有好友
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

  const conversations = await Promise.all(
    friendships.map(async f => {
      const friendUser = f.userId === user.userId ? f.friend : f.user;

      // 获取最后一条消息
      const lastMessage = await db.message.findFirst({
        where: {
          OR: [
            { senderId: user.userId, receiverId: friendUser.id },
            { senderId: friendUser.id, receiverId: user.userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      // 获取未读数量
      const unreadCount = await db.message.count({
        where: {
          senderId: friendUser.id,
          receiverId: user.userId,
          readAt: null
        }
      });

      return {
        odId: friendUser.id,
        username: friendUser.username,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt.toISOString() || '',
        unreadCount
      };
    })
  );

  // 按最后消息时间排序
  conversations.sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  return c.json({ success: true, data: conversations });
});

export default chat;
