import { z } from 'zod';

// 搜索用户
export const searchUserSchema = z.object({
  query: z.string().min(1).max(20)
});

// 发送好友请求
export const sendFriendRequestSchema = z.object({
  targetUserId: z.string().uuid()
});

// 处理好友请求
export const handleFriendRequestSchema = z.object({
  requestId: z.string().uuid()
});

// ========== 聊天系统 Schema ==========

// 发送消息
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000)
});

// 获取消息历史
export const getMessagesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().uuid().optional()
});

// ========== 交换系统 Schema ==========

// 创建交换请求
export const createTradeRequestSchema = z.object({
  receiverId: z.string().uuid(),
  pokemonId: z.string().uuid(),
  requestedType: z.string().optional(),
  message: z.string().max(200).optional(),
  isPublic: z.boolean().default(false)
});

// 接受交换
export const acceptTradeSchema = z.object({
  pokemonId: z.string().uuid()
});

// ========== PvP 对战系统 Schema ==========

// 发起对战
export const challengeBattleSchema = z.object({
  opponentId: z.string().uuid()
});

// 提交行动
export const submitActionSchema = z.object({
  type: z.enum(['move', 'switch', 'forfeit']),
  moveIndex: z.number().min(0).max(3).optional(),
  switchToIndex: z.number().min(0).max(5).optional()
});
