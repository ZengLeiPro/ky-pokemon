import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { challengeBattleSchema, acceptBattleSchema, submitActionSchema } from '../../../shared/schemas/social.schema.js';
import { processTurn } from '../lib/battle-engine.js';
import { isUserOnline } from '../lib/online-utils.js';

const battle = new Hono<{ Variables: { user: { userId: string } } }>();

battle.use('/*', authMiddleware);

// 辅助函数：从存档获取队伍
async function getTeamFromSave(userId: string, gameMode: string = 'NORMAL') {
  const save = await db.gameSave.findUnique({
    where: { userId_mode: { userId, mode: gameMode } }
  });

  if (!save) return null;

  return JSON.parse(save.team);
}

// 发起对战邀请
battle.post('/challenge', zValidator('json', challengeBattleSchema), async (c) => {
  const user = c.get('user');
  const { opponentId, gameMode } = c.req.valid('json');

  // 作弊模式不能对战
  if (gameMode === 'CHEAT') {
    return c.json({ success: false, error: '作弊模式下无法进行好友对战' }, 403);
  }

  // 不能和自己对战
  if (opponentId === user.userId) {
    return c.json({ success: false, error: '不能和自己对战' }, 400);
  }

  // 验证对手是好友
  const friendship = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: user.userId, friendId: opponentId, status: 'accepted' },
        { userId: opponentId, friendId: user.userId, status: 'accepted' }
      ]
    }
  });

  if (!friendship) {
    return c.json({ success: false, error: '只能与好友对战' }, 403);
  }

  // 检查是否有进行中的对战
  const activeBattle = await db.battle.findFirst({
    where: {
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ],
      status: { in: ['pending', 'active'] }
    }
  });

  if (activeBattle) {
    return c.json({ success: false, error: '你已有进行中的对战' }, 400);
  }

  // 检查对方是否在线
  const opponent = await db.user.findUnique({
    where: { id: opponentId },
    select: { lastSeenAt: true }
  });

  if (!isUserOnline(opponent?.lastSeenAt ?? null)) {
    return c.json({ success: false, error: '对方当前不在线，无法发起对战' }, 400);
  }

  // 获取挑战者队伍
  const team = await getTeamFromSave(user.userId);
  if (!team || team.length === 0) {
    return c.json({ success: false, error: '队伍中没有宝可梦' }, 400);
  }

  // 创建对战
  const newBattle = await db.battle.create({
    data: {
      challengerId: user.userId,
      opponentId,
      challengerTeam: JSON.stringify(team)
    },
    include: {
      challenger: { select: { username: true } },
      opponent: { select: { username: true } }
    }
  });

  return c.json({
    success: true,
    data: {
      id: newBattle.id,
      challengerId: newBattle.challengerId,
      challengerUsername: newBattle.challenger.username,
      opponentId: newBattle.opponentId,
      opponentUsername: newBattle.opponent.username,
      status: newBattle.status,
      createdAt: newBattle.createdAt.toISOString()
    }
  });
});

// 获取收到的对战邀请
battle.get('/pending', async (c) => {
  const user = c.get('user');

  const challenges = await db.battle.findMany({
    where: {
      opponentId: user.userId,
      status: 'pending'
    },
    include: {
      challenger: { select: { username: true } },
      opponent: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = challenges.map(b => ({
    id: b.id,
    challengerId: b.challengerId,
    challengerUsername: b.challenger.username,
    opponentId: b.opponentId,
    opponentUsername: b.opponent.username,
    status: b.status,
    createdAt: b.createdAt.toISOString()
  }));

  return c.json({ success: true, data: result });
});

// 接受对战
battle.post('/:id/accept', zValidator('json', acceptBattleSchema), async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');
  const { gameMode } = c.req.valid('json');

  // 作弊模式不能对战
  if (gameMode === 'CHEAT') {
    return c.json({ success: false, error: '作弊模式下无法进行好友对战' }, 403);
  }

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      opponentId: user.userId,
      status: 'pending'
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战邀请不存在或已处理' }, 404);
  }

  // 获取对手队伍
  const challengerTeam = JSON.parse(battleRecord.challengerTeam);
  const opponentTeam = await getTeamFromSave(user.userId);

  if (!opponentTeam || opponentTeam.length === 0) {
    return c.json({ success: false, error: '队伍中没有宝可梦' }, 400);
  }

  // 创建初始对战状态
  const initialState = {
    challengerActive: 0,
    opponentActive: 0,
    challengerTeamState: challengerTeam.map((p: any) => ({
      currentHp: p.currentHp,
      maxHp: p.maxHp,
      status: p.status,
      ppUsed: p.moves.map(() => 0),
      statChanges: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    })),
    opponentTeamState: opponentTeam.map((p: any) => ({
      currentHp: p.currentHp,
      maxHp: p.maxHp,
      status: p.status,
      ppUsed: p.moves.map(() => 0),
      statChanges: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    })),
    weather: 'None',
    weatherTurns: 0
  };

  await db.$transaction(async (tx) => {
    await tx.battle.update({
      where: { id: battleId },
      data: {
        status: 'active',
        opponentTeam: JSON.stringify(opponentTeam),
        currentState: JSON.stringify(initialState),
        currentTurn: 1,
        challengerLastSeen: new Date(),
        opponentLastSeen: new Date()
      }
    });
  });

  return c.json({ success: true, data: { message: '对战开始！' } });
});

// 获取当前对战状态（轮询用）
battle.get('/:id/state', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');
  const now = new Date();

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ]
    },
    include: {
      challenger: { select: { username: true } },
      opponent: { select: { username: true } },
      turnLogs: {
        orderBy: { turn: 'desc' },
        take: 1
      }
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战不存在' }, 404);
  }

  // 对战尚未开始（等待对手接受）
  if (battleRecord.status === 'pending') {
    return c.json({ success: false, error: '对战尚未开始，请稍候' }, 400);
  }

  // 对战已激活但数据未就绪（防御性检查）
  if (battleRecord.status === 'active' && (!battleRecord.opponentTeam || !battleRecord.currentState)) {
    return c.json({ success: false, error: '对战数据正在准备中' }, 400);
  }

  const isChallenger = battleRecord.challengerId === user.userId;

  // 更新当前用户在对战中的最后活跃时间 + 全局 lastSeenAt
  await db.battle.update({
    where: { id: battleId },
    data: isChallenger
      ? { challengerLastSeen: now }
      : { opponentLastSeen: now }
  });
  await db.user.update({
    where: { id: user.userId },
    data: { lastSeenAt: now }
  });

  // 掉线检测（仅当对战 active 时检查）
  if (battleRecord.status === 'active') {
    const DISCONNECT_TIMEOUT_MS = 60 * 1000;

    const challengerLastSeen = isChallenger ? now : battleRecord.challengerLastSeen;
    const opponentLastSeen = isChallenger ? battleRecord.opponentLastSeen : now;

    const challengerOffline = !challengerLastSeen ||
      (now.getTime() - challengerLastSeen.getTime() > DISCONNECT_TIMEOUT_MS);
    const opponentOffline = !opponentLastSeen ||
      (now.getTime() - opponentLastSeen.getTime() > DISCONNECT_TIMEOUT_MS);

    if (challengerOffline || opponentOffline) {
      let winnerId: string | null = null;

      if (challengerOffline && opponentOffline) {
        const cTime = challengerLastSeen?.getTime() ?? 0;
        const oTime = opponentLastSeen?.getTime() ?? 0;
        winnerId = cTime >= oTime ? battleRecord.challengerId : battleRecord.opponentId;
      } else if (challengerOffline) {
        winnerId = battleRecord.opponentId;
      } else {
        winnerId = battleRecord.challengerId;
      }

      await db.battle.update({
        where: { id: battleId },
        data: {
          status: 'finished',
          winnerId,
          finishReason: 'disconnect'
        }
      });

      const updatedRecord = await db.battle.findUnique({
        where: { id: battleId },
        include: {
          challenger: { select: { username: true } },
          opponent: { select: { username: true } },
          turnLogs: { orderBy: { turn: 'desc' }, take: 1 }
        }
      });

      return c.json({
        success: true,
        data: {
          id: updatedRecord!.id,
          challengerId: updatedRecord!.challengerId,
          challengerUsername: updatedRecord!.challenger.username,
          opponentId: updatedRecord!.opponentId,
          opponentUsername: updatedRecord!.opponent.username,
          status: 'finished',
          challengerTeam: JSON.parse(updatedRecord!.challengerTeam),
          opponentTeam: updatedRecord!.opponentTeam ? JSON.parse(updatedRecord!.opponentTeam) : null,
          currentState: updatedRecord!.currentState ? JSON.parse(updatedRecord!.currentState) : null,
          currentTurn: updatedRecord!.currentTurn,
          myActionSubmitted: false,
          opponentActionSubmitted: false,
          winnerId: updatedRecord!.winnerId,
          isChallenger,
          lastTurnLog: updatedRecord!.turnLogs[0]
            ? JSON.parse(updatedRecord!.turnLogs[0].log)
            : null,
          finishReason: 'disconnect'
        }
      });
    }
  }

  return c.json({
    success: true,
    data: {
      id: battleRecord.id,
      challengerId: battleRecord.challengerId,
      challengerUsername: battleRecord.challenger.username,
      opponentId: battleRecord.opponentId,
      opponentUsername: battleRecord.opponent.username,
      status: battleRecord.status,
      challengerTeam: JSON.parse(battleRecord.challengerTeam),
      opponentTeam: battleRecord.opponentTeam ? JSON.parse(battleRecord.opponentTeam) : null,
      currentState: battleRecord.currentState ? JSON.parse(battleRecord.currentState) : null,
      currentTurn: battleRecord.currentTurn,
      myActionSubmitted: isChallenger
        ? !!battleRecord.challengerAction
        : !!battleRecord.opponentAction,
      opponentActionSubmitted: isChallenger
        ? !!battleRecord.opponentAction
        : !!battleRecord.challengerAction,
      winnerId: battleRecord.winnerId,
      isChallenger,
      lastTurnLog: battleRecord.turnLogs[0]
        ? JSON.parse(battleRecord.turnLogs[0].log)
        : null,
      finishReason: battleRecord.finishReason ?? null
    }
  });
});

// 提交行动
battle.post('/:id/action', zValidator('json', submitActionSchema), async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');
  const action = c.req.valid('json');

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      status: 'active',
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ]
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战不存在或已结束' }, 404);
  }

  const isChallenger = battleRecord.challengerId === user.userId;

  // 检查是否已提交行动
  if (isChallenger && battleRecord.challengerAction) {
    return c.json({ success: false, error: '你已提交本回合行动' }, 400);
  }
  if (!isChallenger && battleRecord.opponentAction) {
    return c.json({ success: false, error: '你已提交本回合行动' }, 400);
  }

  // 保存行动（同时更新活跃时间）
  const actionJson = JSON.stringify({ ...action, timestamp: Date.now() });
  const now = new Date();

  await db.battle.update({
    where: { id: battleId },
    data: isChallenger
      ? { challengerAction: actionJson, challengerLastSeen: now }
      : { opponentAction: actionJson, opponentLastSeen: now }
  });
  await db.user.update({
    where: { id: user.userId },
    data: { lastSeenAt: now }
  });

  // 检查双方是否都已提交
  const updatedBattle = await db.battle.findUnique({ where: { id: battleId } });

  if (updatedBattle?.challengerAction && updatedBattle?.opponentAction) {
    const challengerTeam = JSON.parse(updatedBattle.challengerTeam);
    const opponentTeam = JSON.parse(updatedBattle.opponentTeam!);
    const currentState = JSON.parse(updatedBattle.currentState!);
    const challengerAction = JSON.parse(updatedBattle.challengerAction);
    const opponentAction = JSON.parse(updatedBattle.opponentAction);

    // 处理回合
    const { newState, result, winnerId } = processTurn(
      currentState,
      challengerTeam,
      opponentTeam,
      challengerAction,
      opponentAction,
      updatedBattle.currentTurn
    );

    // 保存新状态
    await db.battle.update({
      where: { id: battleId },
      data: {
        currentState: JSON.stringify(newState),
        challengerAction: null,
        opponentAction: null,
        currentTurn: { increment: 1 },
        status: winnerId ? 'finished' : 'active',
        winnerId: winnerId === 'challenger' ? updatedBattle.challengerId
          : winnerId === 'opponent' ? updatedBattle.opponentId
          : null,
        finishReason: winnerId ? 'normal' : undefined
      }
    });

    // 保存回合日志
    await db.battleTurnLog.create({
      data: {
        battleId,
        turn: updatedBattle.currentTurn,
        log: JSON.stringify(result)
      }
    });
  }

  return c.json({ success: true, data: { message: '行动已提交' } });
});

// 投降
battle.post('/:id/surrender', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      status: 'active',
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ]
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战不存在或已结束' }, 404);
  }

  const isChallenger = battleRecord.challengerId === user.userId;
  const winnerId = isChallenger ? battleRecord.opponentId : battleRecord.challengerId;

  await db.battle.update({
    where: { id: battleId },
    data: {
      status: 'finished',
      winnerId,
      finishReason: 'surrender'
    }
  });

  return c.json({ success: true, data: { message: '你已投降' } });
});

// 拒绝对战
battle.post('/:id/reject', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      opponentId: user.userId,
      status: 'pending'
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战邀请不存在或已处理' }, 404);
  }

  await db.battle.update({
    where: { id: battleId },
    data: { status: 'cancelled' }
  });

  return c.json({ success: true, data: { message: '已拒绝对战' } });
});

// 获取进行中的对战
battle.get('/active', async (c) => {
  const user = c.get('user');

  const activeBattle = await db.battle.findFirst({
    where: {
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ],
      status: 'active'
    },
    include: {
      challenger: { select: { username: true } },
      opponent: { select: { username: true } }
    }
  });

  if (!activeBattle) {
    return c.json({ success: true, data: null });
  }

  return c.json({
    success: true,
    data: {
      id: activeBattle.id,
      challengerId: activeBattle.challengerId,
      challengerUsername: activeBattle.challenger.username,
      opponentId: activeBattle.opponentId,
      opponentUsername: activeBattle.opponent.username,
      status: activeBattle.status
    }
  });
});

// 取消对战邀请（发起者取消 pending 状态的对战）
battle.post('/:id/cancel', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');

  const battleRecord = await db.battle.findFirst({
    where: {
      id: battleId,
      challengerId: user.userId,
      status: 'pending'
    }
  });

  if (!battleRecord) {
    return c.json({ success: false, error: '对战邀请不存在或无法取消' }, 404);
  }

  await db.battle.update({
    where: { id: battleId },
    data: { status: 'cancelled' }
  });

  return c.json({ success: true, data: { message: '已取消对战' } });
});

// 获取我的卡住的对战（pending 或 active）
battle.get('/my-stuck', async (c) => {
  const user = c.get('user');

  const stuckBattle = await db.battle.findFirst({
    where: {
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ],
      status: { in: ['pending', 'active'] }
    },
    include: {
      challenger: { select: { username: true } },
      opponent: { select: { username: true } }
    }
  });

  if (!stuckBattle) {
    return c.json({ success: true, data: null });
  }

  const isChallenger = stuckBattle.challengerId === user.userId;

  return c.json({
    success: true,
    data: {
      id: stuckBattle.id,
      challengerId: stuckBattle.challengerId,
      challengerUsername: stuckBattle.challenger.username,
      opponentId: stuckBattle.opponentId,
      opponentUsername: stuckBattle.opponent.username,
      status: stuckBattle.status,
      isChallenger,
      createdAt: stuckBattle.createdAt.toISOString()
    }
  });
});

// 清理卡住的对战（强制取消任何 pending/active 对战）
battle.post('/cleanup-stuck', async (c) => {
  const user = c.get('user');

  const stuckBattle = await db.battle.findFirst({
    where: {
      OR: [
        { challengerId: user.userId },
        { opponentId: user.userId }
      ],
      status: { in: ['pending', 'active'] }
    }
  });

  if (!stuckBattle) {
    return c.json({ success: false, error: '没有卡住的对战' }, 404);
  }

  await db.battle.update({
    where: { id: stuckBattle.id },
    data: { status: 'cancelled' }
  });

  return c.json({ success: true, data: { message: '已清理卡住的对战' } });
});

export default battle;
