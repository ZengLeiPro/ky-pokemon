import { useEffect, useState, useRef } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';

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

      const isReady =
        !!battleData &&
        battleData.status !== 'pending' &&
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
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-white">{prepareError}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPrepareSeq(s => s + 1)}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            重试
          </button>
          <button
            onClick={() => setView('ROAM')}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
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
    activeBattle.status === 'pending' ||
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
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-white text-lg">等待对方接受对战...</div>
        <div className="text-gray-400 text-sm">对方有2分钟时间接受</div>
        <button
          onClick={handleCancelChallenge}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          取消对战
        </button>
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

  const getHpPercent = (currentHp: number, maxHp: number) => {
    return Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  };

  const getHpColor = (percent: number) => {
    if (percent > 50) return 'bg-green-500';
    if (percent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatStatus = (status?: string) => {
    if (!status) return '';
    const statusMap: Record<string, string> = {
      'BRN': '灼伤',
      'PAR': '麻痹',
      'SLP': '睡眠',
      'PSN': '中毒',
      'FRZ': '冰冻'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveBattle(null);
              setView('ROAM');
            }}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            返回
          </button>
          <span className="font-bold">
            vs {activeBattle.isChallenger
              ? activeBattle.opponentUsername
              : activeBattle.challengerUsername}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">回合 {activeBattle.currentTurn}</span>
          {activeBattle.status === 'finished' && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-yellow-500 text-black text-sm rounded font-bold">
                {activeBattle.winnerId === (activeBattle.isChallenger ? activeBattle.challengerId : activeBattle.opponentId)
                  ? '胜利！'
                  : '失败'}
              </span>
              {activeBattle.finishReason === 'disconnect' && (
                <span className="text-xs text-gray-400">
                  {activeBattle.winnerId === (activeBattle.isChallenger ? activeBattle.challengerId : activeBattle.opponentId)
                    ? '对方掉线'
                    : '你已掉线'}
                </span>
              )}
              {activeBattle.finishReason === 'surrender' && (
                <span className="text-xs text-gray-400">投降</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 对战区域 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-sky-800" />

        {/* 对手区域 */}
        <div className="absolute top-4 right-4 left-4">
          {/* 对手宝可梦信息 */}
          {opponentActivePokemon && (
            <div className="flex justify-between items-start">
              <div className="bg-black/50 p-3 rounded-lg min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{opponentActivePokemon.nickname || opponentActivePokemon.speciesName}</span>
                  <span className="text-xs text-gray-400">Lv.{opponentActivePokemon.level}</span>
                </div>
                <div className="mt-1 text-xs">
                  {opponentActivePokemon.types.join('/')}
                </div>
                {opponentState[opponentActiveIndex]?.status && (
                  <span className="text-xs text-yellow-400">
                    {formatStatus(opponentState[opponentActiveIndex].status)}
                  </span>
                )}
                {/* HP 条 */}
                <div className="mt-2 w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getHpColor(getHpPercent(
                      opponentState[opponentActiveIndex]?.currentHp || 0,
                      opponentState[opponentActiveIndex]?.maxHp || 1
                    ))}`}
                    style={{ width: `${getHpPercent(
                      opponentState[opponentActiveIndex]?.currentHp || 0,
                      opponentState[opponentActiveIndex]?.maxHp || 1
                    )}%` }}
                  />
                </div>
                <div className="text-xs text-right mt-1">
                  {opponentState[opponentActiveIndex]?.currentHp || 0} / {opponentState[opponentActiveIndex]?.maxHp || 0}
                </div>
              </div>

              {/* 对手宝可梦图片（占位） */}
              <div className="w-32 h-32 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">?</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 中心装饰 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 border-4 border-white/20 rounded-full" />
        </div>

        {/* 我方区域 */}
        <div className="absolute bottom-4 right-4 left-4">
          {/* 我方宝可梦图片 */}
          {myActivePokemon && (
            <div className="flex justify-between items-end">
              {/* 我方宝可梦图片（占位） */}
              <div className="w-32 h-32 flex items-center justify-center">
                <div className="w-28 h-28 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-5xl">?</span>
                </div>
              </div>

              {/* 我方宝可梦信息 */}
              <div className="bg-black/50 p-3 rounded-lg min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{myActivePokemon.nickname || myActivePokemon.speciesName}</span>
                  <span className="text-xs text-gray-400">Lv.{myActivePokemon.level}</span>
                </div>
                <div className="mt-1 text-xs">
                  {myActivePokemon.types.join('/')}
                </div>
                {myState[myActiveIndex]?.status && (
                  <span className="text-xs text-yellow-400">
                    {formatStatus(myState[myActiveIndex].status)}
                  </span>
                )}
                {/* HP 条 */}
                <div className="mt-2 w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getHpColor(getHpPercent(
                      myState[myActiveIndex]?.currentHp || 0,
                      myState[myActiveIndex]?.maxHp || 1
                    ))}`}
                    style={{ width: `${getHpPercent(
                      myState[myActiveIndex]?.currentHp || 0,
                      myState[myActiveIndex]?.maxHp || 1
                    )}%` }}
                  />
                </div>
                <div className="text-xs text-right mt-1">
                  {myState[myActiveIndex]?.currentHp || 0} / {myState[myActiveIndex]?.maxHp || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 行动菜单 */}
      <div className="border-t border-gray-700">
        {activeBattle.status === 'finished' ? (
          <div className="p-4 flex flex-col items-center gap-2">
            {activeBattle.finishReason === 'disconnect' && (
              <p className="text-sm text-gray-400">
                {activeBattle.winnerId === (activeBattle.isChallenger ? activeBattle.challengerId : activeBattle.opponentId)
                  ? '对手因掉线超时被判定失败'
                  : '你因掉线超时被判定失败'}
              </p>
            )}
            <button
              onClick={() => {
                setActiveBattle(null);
                setView('ROAM');
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回游戏
            </button>
          </div>
        ) : showSwitchMenu ? (
          /* 换人菜单 */
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">选择要出战的宝可梦</h3>
              <button
                onClick={() => setShowSwitchMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                返回
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {myTeam.map((pokemon, index) => (
                <button
                  key={pokemon.id}
                  onClick={() => handleSwitch(index)}
                  disabled={
                    myState[index]?.currentHp <= 0 ||
                    index === myActiveIndex
                  }
                  className={`p-2 rounded text-left ${
                    myState[index]?.currentHp <= 0
                      ? 'bg-gray-800 opacity-50'
                      : index === myActiveIndex
                      ? 'bg-blue-800'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{pokemon.nickname || pokemon.speciesName}</span>
                    <span className="text-xs text-gray-400">Lv.{pokemon.level}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    HP: {myState[index]?.currentHp || 0}/{myState[index]?.maxHp || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 战斗菜单 */
          <div className="p-4">
            {/* 状态提示 */}
            <div className="mb-2 text-sm text-center">
              {!isMyTurn ? (
                <span className="text-yellow-400">等待对手行动...</span>
              ) : allMovesEmpty ? (
                <span className="text-orange-400">所有招式PP已用尽！请换人或投降</span>
              ) : (
                <span className="text-green-400">选择你的行动！</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 招式按钮 */}
              {myActivePokemon?.moves.slice(0, 4).map((move, index) => (
                <button
                  key={move.move.id}
                  onClick={() => handleMove(index)}
                  disabled={!isMyTurn || move.ppCurrent <= 0}
                  className={`p-3 rounded text-left ${
                    !isMyTurn || move.ppCurrent <= 0
                      ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{move.move.name}</span>
                    <span className={`text-xs ${
                      move.ppCurrent <= 0
                        ? 'text-red-500 font-bold'
                        : move.ppCurrent < move.move.ppMax * 0.25
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      PP {move.ppCurrent}/{move.move.ppMax}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {move.move.type} | {move.move.category}
                  </div>
                </button>
              ))}

              {/* 换人按钮 */}
              <button
                onClick={() => setShowSwitchMenu(true)}
                disabled={!isMyTurn || (!hasAvailableSwitch && !allMovesEmpty)}
                className={`p-3 rounded text-left ${
                  !isMyTurn
                    ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                    : allMovesEmpty && hasAvailableSwitch
                    ? 'bg-orange-700 hover:bg-orange-600 ring-2 ring-orange-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className={`font-medium ${allMovesEmpty && hasAvailableSwitch ? 'text-orange-300' : ''}`}>
                  {allMovesEmpty && hasAvailableSwitch ? '必须换人！' : '换人'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  更换当前宝可梦
                </div>
              </button>

              {/* 投降按钮 */}
              <button
                onClick={handleSurrender}
                disabled={!isMyTurn}
                className={`p-3 rounded text-left ${
                  !isMyTurn
                    ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                    : allMovesEmpty && !hasAvailableSwitch
                    ? 'bg-red-700 hover:bg-red-600 ring-2 ring-red-400'
                    : 'bg-red-900 hover:bg-red-800'
                }`}
              >
                <div className={`font-medium ${allMovesEmpty && !hasAvailableSwitch ? 'text-red-300' : 'text-red-400'}`}>
                  {allMovesEmpty && !hasAvailableSwitch ? '只能投降' : '投降'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
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
