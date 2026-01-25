import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { challengeBattleSchema, submitActionSchema } from '../../../shared/schemas/social.schema.js';
import { processTurn } from '../lib/battle-engine.js';

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
  const { opponentId } = c.req.valid('json');

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
battle.post('/:id/accept', async (c) => {
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

  await db.battle.update({
    where: { id: battleId },
    data: {
      status: 'active',
      opponentTeam: JSON.stringify(opponentTeam),
      currentState: JSON.stringify(initialState),
      currentTurn: 1
    }
  });

  return c.json({ success: true, data: { message: '对战开始！' } });
});

// 获取当前对战状态（轮询用）
battle.get('/:id/state', async (c) => {
  const user = c.get('user');
  const battleId = c.req.param('id');

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

  const isChallenger = battleRecord.challengerId === user.userId;

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
        : null
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

  // 保存行动
  const actionJson = JSON.stringify({ ...action, timestamp: Date.now() });

  await db.battle.update({
    where: { id: battleId },
    data: isChallenger
      ? { challengerAction: actionJson }
      : { opponentAction: actionJson }
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
          : null
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
      winnerId
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

export default battle;
