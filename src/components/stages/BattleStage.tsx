import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';
import { MOVES, WORLD_MAP } from '@shared/constants';
import { getBackSpriteUrl } from '@shared/utils/sprites';
import { TYPE_TRANSLATIONS, TYPE_COLORS } from '../../constants';
import BattleBackground from '../battle/BattleBackground';
import BattleWeather from '../battle/BattleWeather';
import MoveEffect from '../battle/MoveEffect';
import type { PokemonType, StatusCondition } from '@shared/types';

// 异常状态标签配置
const STATUS_DISPLAY: Record<StatusCondition, { label: string; color: string; bg: string }> = {
  BRN: { label: '灼伤', color: 'text-orange-200', bg: 'bg-orange-600' },
  PSN: { label: '中毒', color: 'text-purple-200', bg: 'bg-purple-600' },
  PAR: { label: '麻痹', color: 'text-yellow-200', bg: 'bg-yellow-600' },
  SLP: { label: '睡眠', color: 'text-slate-200', bg: 'bg-slate-500' },
  FRZ: { label: '冰冻', color: 'text-cyan-200', bg: 'bg-cyan-600' },
  CNF: { label: '混乱', color: 'text-pink-200', bg: 'bg-pink-600' },
};

function StatusBadge({ status }: { status?: StatusCondition }) {
  if (!status) return null;
  const cfg = STATUS_DISPLAY[status];
  return (
    <span className={`${cfg.bg} ${cfg.color} text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none`}>
      {cfg.label}
    </span>
  );
}

const BattleStage: React.FC = () => {
  const { battle, playerParty, setView, confirmNickname, learnPendingMove, dismissVictory, playerLocationId, weather } = useGameStore();
  const playerMon = playerParty[battle.playerActiveIndex];
  const enemyMon = battle.enemy;
  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedForgetIndex, setSelectedForgetIndex] = useState<number | null>(null);

  const location = WORLD_MAP[playerLocationId];
  const battleAnimation = battle.battleAnimation;

  // 被击中时的闪烁效果
  const isEnemyHit = battleAnimation && battleAnimation.isPlayerAttack;
  const isPlayerHit = battleAnimation && !battleAnimation.isPlayerAttack;

  // 胜利画面状态
  const [victoryMsgIndex, setVictoryMsgIndex] = useState(-1);
  const victoryBgmRef = useRef<HTMLAudioElement | null>(null);

  // 战斗 BGM
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio('/audio/battle-wild.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    bgmRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.currentTime = 0;
      bgmRef.current = null;
    };
  }, []);

  // 胜利音乐 & 消息逐条展示
  useEffect(() => {
    if (battle.phase === 'VICTORY' && battle.victoryMessages) {
      // 停止战斗 BGM
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      // 播放胜利音乐
      const audio = new Audio('/audio/victory-wild.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      victoryBgmRef.current = audio;
      // 从第 0 条开始逐条展示
      setVictoryMsgIndex(0);
      return () => {
        audio.pause();
        audio.currentTime = 0;
        victoryBgmRef.current = null;
      };
    }
  }, [battle.phase]);

  // 自动逐条展示胜利消息（每条间隔 1.2 秒）
  useEffect(() => {
    if (battle.phase !== 'VICTORY' || !battle.victoryMessages) return;
    if (victoryMsgIndex < 0) return;
    if (victoryMsgIndex < battle.victoryMessages.length - 1) {
      const timer = setTimeout(() => {
        setVictoryMsgIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [battle.phase, victoryMsgIndex, battle.victoryMessages]);

  if (!playerMon || !enemyMon) return <div className="flex h-full items-center justify-center text-slate-400 animate-pulse">进入战斗中...</div>;

  return (
    <div
      className="flex flex-col h-full bg-slate-900 relative overflow-hidden"
      style={battleAnimation ? { animation: 'battle-shake 0.5s ease-out 0.4s' } : undefined}
    >
        {/* 地点主题背景 */}
        {location ? (
          <BattleBackground location={location} />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black z-0 pointer-events-none" />
            <div className="absolute top-[25%] right-[-10%] w-48 h-12 bg-black/30 blur-md rounded-[100%] rotate-[-5deg]" />
            <div className="absolute bottom-[28%] left-[-10%] w-64 h-16 bg-black/40 blur-lg rounded-[100%] rotate-[5deg]" />
          </>
        )}

        {/* 天气效果层 */}
        <BattleWeather weather={weather} />

        {/* 招式特效层 */}
        {battleAnimation && (
          <MoveEffect
            moveType={battleAnimation.moveType as PokemonType}
            moveId={battleAnimation.moveId}
            isPlayerAttack={battleAnimation.isPlayerAttack}
          />
        )}

        {/* 天气指示器 */}
        {weather !== 'None' && (
          <div className="absolute top-1 right-1 z-40 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-sm text-white/80">
            {weather === 'Rain' && '🌧 下雨'}
            {weather === 'Sunny' && '☀️ 大晴天'}
            {weather === 'Sandstorm' && '🌪 沙暴'}
            {weather === 'Hail' && '🧊 冰雹'}
          </div>
        )}

        {battle.phase === 'NICKNAME' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm">
                    <h3 className="text-xl font-bold text-white mb-2 text-center">恭喜捕获！</h3>
                    <p className="text-slate-400 text-sm text-center mb-6">要给 <span className="text-cyan-400">{enemyMon.speciesName}</span> 取个名字吗？</p>

                    <div className="flex justify-center mb-6">
                         <img src={enemyMon.spriteUrl} alt={enemyMon.speciesName} className="w-24 h-24 object-contain pixelated animate-bounce-slow" />
                    </div>

                    <input
                        type="text"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        placeholder={enemyMon.speciesName}
                        className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none mb-4 text-center font-bold"
                        maxLength={12}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => confirmNickname(nicknameInput.trim() || undefined)}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                        >
                            确定
                        </button>
                        <button
                            onClick={() => confirmNickname()}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                        >
                            不想取名
                        </button>
                    </div>
                </div>
            </div>
        )}

        {battle.phase === 'MOVE_LEARN' && battle.pendingMoveLearn && (() => {
            const pending = battle.pendingMoveLearn;
            const pokemon = playerParty[pending.pokemonIndex];
            const newMove = MOVES[pending.moveId];
            if (!pokemon || !newMove) return null;
            return (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-1 text-center">
                            {pokemon.speciesName} 想学习
                        </h3>
                        <div className="text-center mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: TYPE_COLORS[newMove.type] }}>
                                {newMove.name}
                            </span>
                            <div className="text-xs text-slate-400 mt-1">
                                {TYPE_TRANSLATIONS[newMove.type]} / {newMove.category} / 威力 {newMove.power || '-'} / 命中 {newMove.accuracy || '-'}
                            </div>
                            {newMove.description && (
                                <p className="text-xs text-slate-500 mt-1">{newMove.description}</p>
                            )}
                        </div>

                        <p className="text-sm text-yellow-400 text-center mb-3">
                            但已经学了4个招式了，要忘记一个吗？
                        </p>

                        <div className="space-y-2 mb-4">
                            {pokemon.moves.map((m, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedForgetIndex(selectedForgetIndex === idx ? null : idx)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                                        selectedForgetIndex === idx
                                            ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500'
                                            : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[m.move.type] }}></span>
                                                <span className="font-bold text-sm text-slate-200">{m.move.name}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 ml-4">
                                                {TYPE_TRANSLATIONS[m.move.type]} / {m.move.category} / 威力 {m.move.power || '-'}
                                            </div>
                                        </div>
                                        {selectedForgetIndex === idx && (
                                            <span className="text-xs text-red-400 font-bold">忘记</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (selectedForgetIndex !== null) {
                                        learnPendingMove(selectedForgetIndex);
                                        setSelectedForgetIndex(null);
                                    }
                                }}
                                disabled={selectedForgetIndex === null}
                                className={`flex-1 py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95 ${
                                    selectedForgetIndex !== null
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                学习新招式
                            </button>
                            <button
                                onClick={() => {
                                    learnPendingMove(null);
                                    setSelectedForgetIndex(null);
                                }}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                            >
                                不学了
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()}

        {/* Enemy Info - Top Left */}
        <div className="relative z-10 pt-6 px-4 flex justify-between items-start animate-fade-in-down">
            <div className="flex-1 mr-4">
                <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border-l-4 border-red-500 shadow-lg">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{enemyMon.nickname || enemyMon.speciesName}</h2>
                        <span className="text-xs font-mono text-red-400">Lv.{enemyMon.level}</span>
                    </div>
                    <HPBar current={enemyMon.currentHp} max={enemyMon.maxHp} showText={false} />
                    <div className="flex justify-between items-center mt-1">
                        <StatusBadge status={enemyMon.status} />
                        <span className="text-[10px] font-mono text-slate-400 drop-shadow-md">
                            {enemyMon.currentHp}/{enemyMon.maxHp}
                        </span>
                    </div>
                </div>
            </div>
            {/* 敌方精灵 - 被攻击时闪烁 */}
            <div className="w-28 h-28 flex items-center justify-center relative -mt-2">
                 <img
                   src={enemyMon.spriteUrl}
                   alt={enemyMon.speciesName}
                   className="w-full h-full object-contain pixelated drop-shadow-2xl animate-float-slow"
                   style={{
                     imageRendering: 'pixelated',
                     animation: isEnemyHit
                       ? 'hit-flash 0.5s ease-out 0.4s, float 3s ease-in-out infinite'
                       : undefined,
                   }}
                 />
            </div>
        </div>

        {/* Dynamic Spacer */}
        <div className="flex-grow"></div>

        {/* Player Info - Bottom Right */}
        <div className="relative z-10 pb-6 px-4 flex justify-between items-end animate-fade-in-up">
             {/* 我方精灵 - 被攻击时闪烁 */}
             <div className="w-32 h-32 flex items-center justify-center relative -mb-2 z-10">
                 <img
                   src={getBackSpriteUrl(playerMon.speciesData.pokedexId)}
                   alt={playerMon.speciesName}
                   className="w-full h-full object-contain pixelated drop-shadow-2xl"
                   style={{
                     imageRendering: 'pixelated',
                     animation: isPlayerHit
                       ? 'hit-flash 0.5s ease-out 0.4s'
                       : undefined,
                   }}
                 />
            </div>
            <div className="flex-1 flex flex-col items-end ml-4">
                <div className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border-r-4 border-cyan-500 shadow-lg w-full max-w-[200px]">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{playerMon.nickname || playerMon.speciesName}</h2>
                        <span className="text-xs font-mono text-cyan-400">Lv.{playerMon.level}</span>
                    </div>

                    <div className="mb-2">
                        <HPBar current={playerMon.currentHp} max={playerMon.maxHp} />
                    </div>

                    <div className="flex justify-between items-center">
                         <div className="flex gap-1 scale-90 origin-left">
                            {playerMon.types.map(t => <TypeBadge key={t} type={t} />)}
                            <StatusBadge status={playerMon.status} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            EXP {playerMon.exp}/{playerMon.nextLevelExp}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 胜利结算画面 */}
        {battle.phase === 'VICTORY' && battle.victoryMessages && (
          <div
            className="absolute inset-0 z-50 flex flex-col"
            onClick={() => {
              // 点击加速：跳到最后一条或关闭
              if (victoryMsgIndex < battle.victoryMessages!.length - 1) {
                setVictoryMsgIndex(battle.victoryMessages!.length - 1);
              } else {
                dismissVictory();
              }
            }}
          >
            {/* 半透明黑色遮罩 */}
            <div className="absolute inset-0 bg-black/75" />

            {/* 上方：胜利标题 */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-400 drop-shadow-lg tracking-wider">
                  胜利！
                </div>
              </div>
            </div>

            {/* 下方：消息列表 */}
            <div className="relative z-10 bg-slate-900/95 border-t-2 border-yellow-500/50 p-4 max-h-[45%] overflow-y-auto">
              <div className="space-y-2">
                {battle.victoryMessages.slice(0, victoryMsgIndex + 1).map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm font-bold transition-opacity duration-300 ${
                      i === victoryMsgIndex ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    ▸ {msg}
                  </div>
                ))}
              </div>
              {victoryMsgIndex >= battle.victoryMessages.length - 1 && (
                <div className="mt-4 text-center">
                  <span className="text-xs text-yellow-400/80 animate-pulse">
                    点击继续
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default BattleStage;
