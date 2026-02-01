import { useEffect, useState, useRef } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';
import HPBar from '@/components/ui/HPBar';
import TypeBadge from '@/components/ui/TypeBadge';

interface PvPBattleViewProps {
  battleId: string;
}

export function PvPBattleView({ battleId }: PvPBattleViewProps) {
  const {
    activeBattle,
    loadBattleState,
    submitBattleAction,
    surrenderBattle,
    setActiveBattle,
    cancelBattleChallenge
  } = useSocialStore();

  const setView = useGameStore(s => s.setView);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [prepareSeq, setPrepareSeq] = useState(0);
  const [isPreparing, setIsPreparing] = useState(true);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    // 对于发起方等待对手接受的情况，需要更长的等待时间
    const maxAttempts = 120; // 最多等待2分钟（120秒）
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      const result = await loadBattleState(battleId);
      if (cancelled) return;

      if (result.success === false) {
        if (result.status && [401, 403].includes(result.status)) {
          setIsPreparing(false);
          setPrepareError(result.error);
          return;
        }
        // 404 可能是对战被取消，显示特定消息
        if (result.status === 404) {
          setIsPreparing(false);
          setPrepareError('对战已被取消或不存在');
          return;
        }
        // 400：对战尚未开始/数据准备中，继续重试
      }

      const battleData = result.success ? result.battle : null;

      // 检查对战是否被取消
      if (battleData && battleData.status === 'cancelled') {
        setIsPreparing(false);
        setPrepareError('对战已被取消');
        return;
      }

      // 对战已结束 - 显示战斗总结（需要有完整数据）
      if (battleData && battleData.status === 'finished' && battleData.currentState && battleData.opponentTeam) {
        setPrepareError(null);
        setIsPreparing(false);
        setActiveBattle(battleData);
        return;
      }

      const isReady =
        !!battleData &&
        battleData.status === 'active' &&
        !!battleData.currentState &&
        !!battleData.opponentTeam;

      if (isReady && battleData) {
        setPrepareError(null);
        setIsPreparing(false);
        setActiveBattle(battleData);
        return;
      }

      if (attempts >= maxAttempts) {
        setIsPreparing(false);
        setPrepareError('等待超时，对方可能没有响应');
        return;
      }

      timeoutId = window.setTimeout(poll, 1000);
    };

    setIsPreparing(true);
    setPrepareError(null);
    poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setActiveBattle(null);
    };
  }, [battleId, prepareSeq]);

  useEffect(() => {
    if (activeBattle?.currentState && activeBattle.status === 'active') {
      // 更新战斗日志
      // 这里可以添加更详细的日志逻辑
    }
  }, [activeBattle]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog]);

  if (prepareError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-black gap-6 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-white text-lg font-medium">{prepareError}</div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setPrepareSeq(s => s + 1)}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
            >
              重试
            </button>
            <button
              onClick={() => setView('ROAM')}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 对战已被取消（注意：finished 状态需要在主界面中显示战斗总结，不在这里处理）
  if (activeBattle && activeBattle.status === 'cancelled') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-black gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-slate-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-white text-xl font-bold">对战已被取消</div>
          <button
            onClick={() => setView('FRIENDS')}
            className="mt-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (
    !activeBattle ||
    isPreparing ||
    (activeBattle.status !== 'active' && activeBattle.status !== 'finished') ||
    !activeBattle.currentState ||
    !activeBattle.opponentTeam
  ) {
    const handleCancelChallenge = async () => {
      const success = await cancelBattleChallenge(battleId);
      if (success) {
        setView('FRIENDS');
      }
    };

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-black gap-6 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* VS 装饰 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <span className="text-[200px] font-black text-white">VS</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* 精灵球旋转动画 */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          <div className="text-white text-xl font-bold">等待对方接受对战...</div>
          <div className="text-slate-400 text-sm">对方有2分钟时间接受</div>

          {/* 进度提示 */}
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <button
            onClick={handleCancelChallenge}
            className="mt-4 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            取消对战
          </button>
        </div>
      </div>
    );
  }

  const isMyTurn = !activeBattle.myActionSubmitted;
  const myTeam = activeBattle.isChallenger ? activeBattle.challengerTeam : activeBattle.opponentTeam;
  const opponentTeam = activeBattle.isChallenger ? activeBattle.opponentTeam : activeBattle.challengerTeam;
  const myState = activeBattle.isChallenger
    ? activeBattle.currentState.challengerTeamState
    : activeBattle.currentState.opponentTeamState;
  const opponentState = activeBattle.isChallenger
    ? activeBattle.currentState.opponentTeamState
    : activeBattle.currentState.challengerTeamState;
  const myActiveIndex = activeBattle.isChallenger
    ? activeBattle.currentState.challengerActive
    : activeBattle.currentState.opponentActive;
  const opponentActiveIndex = activeBattle.isChallenger
    ? activeBattle.currentState.opponentActive
    : activeBattle.currentState.challengerActive;

  const myActivePokemon = myTeam[myActiveIndex];
  const opponentActivePokemon = opponentTeam[opponentActiveIndex];

  // 检查是否所有招式PP都为0
  const allMovesEmpty = myActivePokemon?.moves.slice(0, 4).every(move => move.ppCurrent <= 0) ?? false;

  // 检查是否还有其他可以换上的宝可梦
  const hasAvailableSwitch = myTeam.some((_, index) =>
    index !== myActiveIndex && myState[index]?.currentHp > 0
  );

  const handleMove = async (moveIndex: number) => {
    if (!isMyTurn) return;
    setSelectedMove(null);
    const success = await submitBattleAction(activeBattle.id, {
      type: 'move',
      moveIndex
    });
    if (success) {
      // 成功提交后会通过轮询更新状态
    }
  };

  const handleSwitch = async (pokemonIndex: number) => {
    if (!isMyTurn) return;
    setShowSwitchMenu(false);
    const success = await submitBattleAction(activeBattle.id, {
      type: 'switch',
      switchToIndex: pokemonIndex
    });
    if (success) {
      // 成功提交后会通过轮询更新状态
    }
  };

  const handleSurrender = async () => {
    if (!confirm('确定要投降吗？')) return;
    const success = await surrenderBattle(activeBattle.id);
    if (success) {
      setView('ROAM');
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return null;
    const statusMap: Record<string, { text: string; color: string }> = {
      'BRN': { text: '灼伤', color: 'bg-orange-500' },
      'PAR': { text: '麻痹', color: 'bg-yellow-500' },
      'SLP': { text: '睡眠', color: 'bg-purple-500' },
      'PSN': { text: '中毒', color: 'bg-violet-500' },
      'FRZ': { text: '冰冻', color: 'bg-cyan-400' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-500' };
  };

  // 获取招式类型的背景色
  const getMoveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Normal: 'from-gray-400 to-gray-500',
      Fire: 'from-orange-500 to-red-600',
      Water: 'from-blue-400 to-blue-600',
      Electric: 'from-yellow-400 to-yellow-500',
      Grass: 'from-green-400 to-green-600',
      Ice: 'from-cyan-300 to-cyan-500',
      Fighting: 'from-red-600 to-red-800',
      Poison: 'from-purple-500 to-purple-700',
      Ground: 'from-amber-600 to-amber-800',
      Flying: 'from-indigo-300 to-indigo-500',
      Psychic: 'from-pink-400 to-pink-600',
      Bug: 'from-lime-500 to-lime-700',
      Rock: 'from-stone-500 to-stone-700',
      Ghost: 'from-purple-600 to-purple-900',
      Dragon: 'from-violet-500 to-violet-700',
      Dark: 'from-gray-700 to-gray-900',
      Steel: 'from-slate-400 to-slate-600',
      Fairy: 'from-pink-300 to-pink-500',
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black z-0 pointer-events-none" />
      <div className="absolute inset-0 opacity-30 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* 平台效果 */}
      <div className="absolute top-[20%] right-[-5%] w-56 h-14 bg-black/30 blur-md rounded-[100%] rotate-[-5deg] z-0" />
      <div className="absolute bottom-[32%] left-[-5%] w-72 h-20 bg-black/40 blur-lg rounded-[100%] rotate-[5deg] z-0" />

      {/* 顶部导航 */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveBattle(null);
              setView('ROAM');
            }}
            className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            返回
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-lg">
              vs {activeBattle.isChallenger
                ? activeBattle.opponentUsername
                : activeBattle.challengerUsername}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-slate-800/80 rounded-lg">
            <span className="text-sm font-mono text-slate-300">回合 <span className="text-cyan-400 font-bold">{activeBattle.currentTurn}</span></span>
          </div>
          {activeBattle.status === 'finished' && (
            <div className="flex items-center gap-2 animate-bounce-slow">
              {(() => {
                const myId = activeBattle.isChallenger ? activeBattle.challengerId : activeBattle.opponentId;
                const isWinner = activeBattle.winnerId === myId;
                const isDraw = activeBattle.winnerId === null;
                return (
                  <>
                    <span className={`px-3 py-1.5 ${
                      isDraw
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : isWinner
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                    } text-sm rounded-lg font-bold shadow-lg`}>
                      {isDraw ? '平局' : isWinner ? '胜利！' : '失败'}
                    </span>
                    {activeBattle.finishReason === 'disconnect' && (
                      <span className="text-xs text-gray-400">
                        {isWinner ? '对方掉线' : '你已掉线'}
                      </span>
                    )}
                    {activeBattle.finishReason === 'surrender' && (
                      <span className="text-xs text-gray-400">投降</span>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 对战区域 */}
      <div className="flex-1 relative z-10 overflow-hidden">
        {/* 对手区域 - 右上 */}
        <div className="absolute top-4 right-4 left-4 flex justify-between items-start animate-fade-in-down">
          {/* 对手宝可梦信息卡片 */}
          {opponentActivePokemon && (
            <>
              <div className="flex-1 mr-4 max-w-[220px]">
                <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border-l-4 border-red-500 shadow-xl">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-white truncate">
                      {opponentActivePokemon.nickname || opponentActivePokemon.speciesName}
                    </h2>
                    <span className="text-xs font-mono text-red-400 ml-2">Lv.{opponentActivePokemon.level}</span>
                  </div>

                  {/* 属性标签 */}
                  <div className="flex gap-1 mb-2">
                    {opponentActivePokemon.types.map((t: string) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>

                  {/* 状态异常 */}
                  {opponentState[opponentActiveIndex]?.status && (
                    <div className="mb-2">
                      {(() => {
                        const status = formatStatus(opponentState[opponentActiveIndex].status);
                        return status ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color} text-white font-medium`}>
                            {status.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* HP条 */}
                  <HPBar
                    current={opponentState[opponentActiveIndex]?.currentHp || 0}
                    max={opponentState[opponentActiveIndex]?.maxHp || 1}
                    showText={false}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {opponentState[opponentActiveIndex]?.currentHp || 0}/{opponentState[opponentActiveIndex]?.maxHp || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 对手宝可梦精灵图 */}
              <div className="w-32 h-32 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-full blur-xl" />
                <img
                  src={opponentActivePokemon.spriteUrl}
                  alt={opponentActivePokemon.speciesName}
                  className="w-full h-full object-contain pixelated drop-shadow-2xl animate-float-slow relative z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </>
          )}
        </div>

        {/* 中心 VS 装饰 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-white/10 rounded-full flex items-center justify-center">
              <span className="text-white/20 font-bold text-xl">VS</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-2 border-white/5 rounded-full animate-ping" />
          </div>
        </div>

        {/* 我方区域 - 左下 */}
        <div className="absolute bottom-4 right-4 left-4 flex justify-between items-end animate-fade-in-up">
          {/* 我方宝可梦精灵图 */}
          {myActivePokemon && (
            <>
              <div className="w-36 h-36 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/10 rounded-full blur-xl" />
                <img
                  src={myActivePokemon.spriteUrl}
                  alt={myActivePokemon.speciesName}
                  className="w-full h-full object-contain pixelated scale-x-[-1] drop-shadow-2xl relative z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* 我方宝可梦信息卡片 */}
              <div className="flex-1 ml-4 flex justify-end">
                <div className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-xl border-r-4 border-cyan-500 shadow-xl max-w-[220px] w-full">
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-white truncate">
                      {myActivePokemon.nickname || myActivePokemon.speciesName}
                    </h2>
                    <span className="text-xs font-mono text-cyan-400 ml-2">Lv.{myActivePokemon.level}</span>
                  </div>

                  {/* 属性标签 */}
                  <div className="flex gap-1 mb-2">
                    {myActivePokemon.types.map((t: string) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>

                  {/* 状态异常 */}
                  {myState[myActiveIndex]?.status && (
                    <div className="mb-2">
                      {(() => {
                        const status = formatStatus(myState[myActiveIndex].status);
                        return status ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color} text-white font-medium`}>
                            {status.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* HP条 */}
                  <HPBar
                    current={myState[myActiveIndex]?.currentHp || 0}
                    max={myState[myActiveIndex]?.maxHp || 1}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 行动菜单 */}
      <div className="relative z-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50">
        {activeBattle.status === 'finished' ? (
          /* 对战结束 - 战斗总结 */
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* 胜负结果 */}
            {(() => {
              const myId = activeBattle.isChallenger ? activeBattle.challengerId : activeBattle.opponentId;
              const opponentId = activeBattle.isChallenger ? activeBattle.opponentId : activeBattle.challengerId;
              const isWinner = activeBattle.winnerId === myId;
              const isDraw = activeBattle.winnerId === null;
              const myUsername = activeBattle.isChallenger ? activeBattle.challengerUsername : activeBattle.opponentUsername;
              const opponentUsername = activeBattle.isChallenger ? activeBattle.opponentUsername : activeBattle.challengerUsername;

              // 统计存活数量
              const myAliveCount = myState.filter(p => p && p.currentHp > 0).length;
              const opponentAliveCount = opponentState.filter(p => p && p.currentHp > 0).length;

              return (
                <div className="space-y-4">
                  {/* 胜负横幅 */}
                  <div className={`text-center py-4 rounded-xl ${
                    isDraw
                      ? 'bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20 border border-purple-500/50'
                      : isWinner
                      ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border border-yellow-500/50'
                      : 'bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50 border border-slate-600/50'
                  }`}>
                    <div className={`text-3xl font-black mb-1 ${isDraw ? 'text-purple-400' : isWinner ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {isDraw ? '平局' : isWinner ? '胜利！' : '失败'}
                    </div>
                    <div className="text-sm text-slate-400">
                      {activeBattle.finishReason === 'surrender' && (isWinner ? '对手投降' : '你已投降')}
                      {activeBattle.finishReason === 'disconnect' && (isWinner ? '对手掉线超时' : '你掉线超时')}
                      {(!activeBattle.finishReason || activeBattle.finishReason === 'normal') && (isDraw ? '双方同归于尽' : '对战结束')}
                    </div>
                  </div>

                  {/* 对战统计 */}
                  <div className="flex justify-center gap-8 py-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{activeBattle.currentTurn}</div>
                      <div className="text-xs text-slate-500">总回合</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{myAliveCount}</div>
                      <div className="text-xs text-slate-500">己方存活</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{opponentAliveCount}</div>
                      <div className="text-xs text-slate-500">对方存活</div>
                    </div>
                  </div>

                  {/* 双方队伍状态 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 我方队伍 */}
                    <div className="bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                        <div className={`w-2 h-2 rounded-full ${isDraw ? 'bg-purple-400' : isWinner ? 'bg-yellow-400' : 'bg-slate-500'}`} />
                        <span className="font-bold text-sm truncate">{myUsername}</span>
                        {isWinner && <span className="text-xs text-yellow-400">胜</span>}
                        {isDraw && <span className="text-xs text-purple-400">平</span>}
                      </div>
                      <div className="space-y-1.5">
                        {myTeam.map((pokemon, index) => {
                          const state = myState[index];
                          const isFainted = !state || state.currentHp <= 0;
                          const hpPercent = state ? Math.round((state.currentHp / state.maxHp) * 100) : 0;

                          return (
                            <div key={pokemon.id} className={`flex items-center gap-2 ${isFainted ? 'opacity-50' : ''}`}>
                              <img
                                src={pokemon.spriteUrl}
                                alt={pokemon.speciesName}
                                className={`w-8 h-8 object-contain pixelated ${isFainted ? 'grayscale' : ''}`}
                                style={{ imageRendering: 'pixelated' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs truncate">{pokemon.nickname || pokemon.speciesName}</div>
                                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${hpPercent}%` }}
                                  />
                                </div>
                              </div>
                              {isFainted && <span className="text-[10px] text-red-400">濒死</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 对方队伍 */}
                    <div className="bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                        <div className={`w-2 h-2 rounded-full ${isDraw ? 'bg-purple-400' : !isWinner ? 'bg-yellow-400' : 'bg-slate-500'}`} />
                        <span className="font-bold text-sm truncate">{opponentUsername}</span>
                        {!isDraw && !isWinner && <span className="text-xs text-yellow-400">胜</span>}
                        {isDraw && <span className="text-xs text-purple-400">平</span>}
                      </div>
                      <div className="space-y-1.5">
                        {opponentTeam.map((pokemon, index) => {
                          const state = opponentState[index];
                          const isFainted = !state || state.currentHp <= 0;
                          const hpPercent = state ? Math.round((state.currentHp / state.maxHp) * 100) : 0;

                          return (
                            <div key={pokemon.id} className={`flex items-center gap-2 ${isFainted ? 'opacity-50' : ''}`}>
                              <img
                                src={pokemon.spriteUrl}
                                alt={pokemon.speciesName}
                                className={`w-8 h-8 object-contain pixelated ${isFainted ? 'grayscale' : ''}`}
                                style={{ imageRendering: 'pixelated' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs truncate">{pokemon.nickname || pokemon.speciesName}</div>
                                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${hpPercent}%` }}
                                  />
                                </div>
                              </div>
                              {isFainted && <span className="text-[10px] text-red-400">濒死</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 返回按钮 */}
                  <button
                    onClick={() => {
                      setActiveBattle(null);
                      setView('ROAM');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-98"
                  >
                    返回游戏
                  </button>
                </div>
              );
            })()}
          </div>
        ) : showSwitchMenu ? (
          /* 换人菜单 */
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">选择要出战的宝可梦</h3>
              <button
                onClick={() => setShowSwitchMenu(false)}
                className="text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-slate-700"
              >
                返回
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {myTeam.map((pokemon, index) => {
                const isFainted = myState[index]?.currentHp <= 0;
                const isActive = index === myActiveIndex;
                const hpPercent = Math.round(((myState[index]?.currentHp || 0) / (myState[index]?.maxHp || 1)) * 100);

                return (
                  <button
                    key={pokemon.id}
                    onClick={() => handleSwitch(index)}
                    disabled={isFainted || isActive}
                    className={`p-3 rounded-xl text-left transition-all ${
                      isFainted
                        ? 'bg-slate-800/50 opacity-50'
                        : isActive
                        ? 'bg-cyan-900/50 border-2 border-cyan-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 active:scale-98'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* 宝可梦小图标 */}
                      <div className="w-10 h-10 flex-shrink-0">
                        <img
                          src={pokemon.spriteUrl}
                          alt={pokemon.speciesName}
                          className={`w-full h-full object-contain pixelated ${isFainted ? 'grayscale opacity-50' : ''}`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{pokemon.nickname || pokemon.speciesName}</span>
                          <span className="text-xs text-slate-400 ml-1">Lv.{pokemon.level}</span>
                        </div>
                        {/* HP 条 */}
                        <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {myState[index]?.currentHp || 0}/{myState[index]?.maxHp || 0}
                          {isActive && <span className="ml-2 text-cyan-400">出战中</span>}
                          {isFainted && <span className="ml-2 text-red-400">濒死</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 战斗菜单 */
          <div className="p-4">
            {/* 状态提示 */}
            <div className="mb-3 text-center">
              {!isMyTurn ? (
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="font-medium">等待对手行动...</span>
                </div>
              ) : allMovesEmpty ? (
                <div className="flex items-center justify-center gap-2 text-orange-400">
                  <span className="font-medium">所有招式PP已用尽！请换人或投降</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-medium">选择你的行动！</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 招式按钮 */}
              {myActivePokemon?.moves.slice(0, 4).map((move, index) => {
                const ppLow = move.ppCurrent < move.move.ppMax * 0.25;
                const ppEmpty = move.ppCurrent <= 0;
                const disabled = !isMyTurn || ppEmpty;

                return (
                  <button
                    key={move.move.id}
                    onClick={() => handleMove(index)}
                    disabled={disabled}
                    className={`p-3 rounded-xl text-left transition-all overflow-hidden relative ${
                      disabled
                        ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-br hover:brightness-110 active:scale-98'
                    } ${!disabled ? getMoveTypeColor(move.move.type) : ''}`}
                  >
                    {/* 招式类型背景装饰 */}
                    {!disabled && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white drop-shadow">{move.move.name}</span>
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          ppEmpty
                            ? 'bg-red-900/80 text-red-300'
                            : ppLow
                            ? 'bg-orange-900/80 text-orange-300'
                            : 'bg-black/30 text-white/80'
                        }`}>
                          {move.ppCurrent}/{move.move.ppMax}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded text-white/90">
                          {move.move.type}
                        </span>
                        <span className="text-[10px] text-white/70">
                          {move.move.category === 'Physical' ? '物理' : move.move.category === 'Special' ? '特殊' : '变化'}
                        </span>
                        {move.move.power > 0 && (
                          <span className="text-[10px] text-white/70">
                            威力 {move.move.power}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* 换人按钮 */}
              <button
                onClick={() => setShowSwitchMenu(true)}
                disabled={!isMyTurn || (!hasAvailableSwitch && !allMovesEmpty)}
                className={`p-3 rounded-xl text-left transition-all ${
                  !isMyTurn
                    ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                    : allMovesEmpty && hasAvailableSwitch
                    ? 'bg-gradient-to-br from-orange-600 to-amber-700 ring-2 ring-orange-400 animate-pulse'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 active:scale-98'
                }`}
              >
                <div className={`font-bold ${allMovesEmpty && hasAvailableSwitch ? 'text-orange-200' : 'text-white'}`}>
                  {allMovesEmpty && hasAvailableSwitch ? '必须换人！' : '换人'}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  更换当前宝可梦
                </div>
              </button>

              {/* 投降按钮 */}
              <button
                onClick={handleSurrender}
                disabled={!isMyTurn}
                className={`p-3 rounded-xl text-left transition-all ${
                  !isMyTurn
                    ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                    : allMovesEmpty && !hasAvailableSwitch
                    ? 'bg-gradient-to-br from-red-600 to-red-800 ring-2 ring-red-400'
                    : 'bg-gradient-to-br from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 active:scale-98'
                }`}
              >
                <div className={`font-bold ${allMovesEmpty && !hasAvailableSwitch ? 'text-red-200' : 'text-red-400'}`}>
                  {allMovesEmpty && !hasAvailableSwitch ? '只能投降' : '投降'}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  放弃这场对战
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
