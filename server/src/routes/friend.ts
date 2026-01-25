import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  searchUserSchema,
  sendFriendRequestSchema,
  handleFriendRequestSchema
} from '../../../shared/schemas/social.schema.js';

const friend = new Hono<{ Variables: { user: { userId: string } } }>();

// 所有路由都需要认证
friend.use('/*', authMiddleware);

// 搜索用户
friend.get('/search', zValidator('query', searchUserSchema), async (c) => {
  const user = c.get('user');
  const { query } = c.req.valid('query');

  // 搜索用户名包含 query 的用户（排除自己）
  const users = await db.user.findMany({
    where: {
      username: { contains: query, mode: 'insensitive' },
      id: { not: user.userId }
    },
    select: { id: true, username: true },
    take: 20
  });

  // 获取当前用户的好友关系
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId: user.userId },
        { friendId: user.userId }
      ]
    }
  });

  // 标记每个用户的好友状态
  const results = users.map(u => {
    const friendship = friendships.find(
      f => (f.userId === u.id || f.friendId === u.id)
    );
    return {
      id: u.id,
      username: u.username,
      isFriend: friendship?.status === 'accepted',
      hasPendingRequest: friendship?.status === 'pending'
    };
  });

  return c.json({ success: true, data: results });
});

// 发送好友请求
friend.post('/request', zValidator('json', sendFriendRequestSchema), async (c) => {
  const user = c.get('user');
  const { targetUserId } = c.req.valid('json');

  // 不能添加自己
  if (targetUserId === user.userId) {
    return c.json({ success: false, error: '不能添加自己为好友' }, 400);
  }

  // 检查目标用户是否存在
  const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  // 检查是否已有关系
  const existing = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: user.userId, friendId: targetUserId },
        { userId: targetUserId, friendId: user.userId }
      ]
    }
  });

  if (existing) {
    if (existing.status === 'accepted') {
      return c.json({ success: false, error: '已经是好友了' }, 400);
    }
    if (existing.status === 'pending') {
      return c.json({ success: false, error: '已有待处理的好友请求' }, 400);
    }
  }

  // 创建好友请求
  const friendship = await db.friendship.create({
    data: {
      userId: user.userId,
      friendId: targetUserId,
      status: 'pending'
    }
  });

  return c.json({ success: true, data: { id: friendship.id } });
});

// 获取待处理的好友请求（别人发给我的）
friend.get('/pending', async (c) => {
  const user = c.get('user');

  const requests = await db.friendship.findMany({
    where: {
      friendId: user.userId,
      status: 'pending'
    },
    include: {
      user: { select: { id: true, username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = requests.map(r => ({
    id: r.id,
    fromUserId: r.user.id,
    fromUsername: r.user.username,
    createdAt: r.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 接受好友请求
friend.post('/request/:id/accept', async (c) => {
  const user = c.get('user');
  const requestId = c.req.param('id');

  const friendship = await db.friendship.findFirst({
    where: {
      id: requestId,
      friendId: user.userId,
      status: 'pending'
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '请求不存在或已处理' }, 404);
  }

  await db.friendship.update({
    where: { id: requestId },
    data: { status: 'accepted' }
  });

  return c.json({ success: true, data: { message: '已添加好友' } });
});

// 拒绝好友请求
friend.post('/request/:id/reject', async (c) => {
  const user = c.get('user');
  const requestId = c.req.param('id');

  const friendship = await db.friendship.findFirst({
    where: {
      id: requestId,
      friendId: user.userId,
      status: 'pending'
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '请求不存在或已处理' }, 404);
  }

  await db.friendship.update({
    where: { id: requestId },
    data: { status: 'rejected' }
  });

  return c.json({ success: true, data: { message: '已拒绝请求' } });
});

// 获取好友列表
friend.get('/list', async (c) => {
  const user = c.get('user');

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
    },
    orderBy: { updatedAt: 'desc' }
  });

  const friends = friendships.map(f => {
    const friendUser = f.userId === user.userId ? f.friend : f.user;
    return {
      id: f.id,
      odId: friendUser.id,
      username: friendUser.username,
      status: f.status,
      createdAt: f.createdAt.toISOString()
    };
  });

  return c.json({ success: true, data: friends });
});

// 删除好友
friend.delete('/:friendshipId', async (c) => {
  const user = c.get('user');
  const friendshipId = c.req.param('friendshipId');

  const friendship = await db.friendship.findFirst({
    where: {
      id: friendshipId,
      OR: [
        { userId: user.userId },
        { friendId: user.userId }
      ],
      status: 'accepted'
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '好友关系不存在' }, 404);
  }

  await db.friendship.delete({ where: { id: friendshipId } });

  return c.json({ success: true, data: { message: '已删除好友' } });
});

export default friend;
