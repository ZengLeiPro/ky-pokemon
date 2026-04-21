// ============================================================
// 宝可梦中心多功能电脑界面（火红叶绿风格）
//
// 三个 Tab：
//  1. 宝可梦盒子 - 存放队伍外的宝可梦（复用 PCBoxView 的逻辑，去掉独立 Header）
//  2. 我的排名 - 展示当前玩家的抓捕数量与全服排名
//  3. 排行榜 - Top 10 玩家 + 自己的排名
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Trophy, Award, BoxSelect, ChevronRight } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { config } from '../../config';
import TypeBadge from '../ui/TypeBadge';

type TabId = 'box' | 'rank' | 'leaderboard';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  caughtCount: number;
}

interface MyRankData {
  rank: number | null;
  caughtCount: number;
  totalRankedPlayers: number;
}

const API_URL = config.apiUrl;

const ComputerView: React.FC = () => {
  const { playerStorage, playerParty, setView, setSelectedPokemon, withdrawPokemon } = useGameStore();
  const { currentUser, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('box');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [myRank, setMyRank] = useState<MyRankData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 返回宝可梦中心
  const handleBack = useCallback(() => {
    setView('POKEMON_CENTER');
  }, [setView]);

  // 加载排行榜与我的排名
  const loadRanking = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      const [leaderRes, meRes] = await Promise.all([
        fetch(`${API_URL}/pokedex/leaderboard`, { headers: authHeader }),
        fetch(`${API_URL}/pokedex/me-rank`, { headers: authHeader }),
      ]);
      const leaderJson = await leaderRes.json();
      const meJson = await meRes.json();

      if (leaderJson?.success && leaderJson.data?.leaderboard) {
        setLeaderboard(leaderJson.data.leaderboard);
      } else {
        setError('排行榜加载失败');
      }

      if (meJson?.success && meJson.data) {
        setMyRank(meJson.data);
      }
    } catch (e) {
      setError('网络连接失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 首次进入或切换到排名/排行榜 Tab 时拉取数据
  useEffect(() => {
    if ((activeTab === 'rank' || activeTab === 'leaderboard') && !leaderboard && !loading) {
      loadRanking();
    }
  }, [activeTab, leaderboard, loading, loadRanking]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0c1a3a' }}>
      {/* ========== 顶部：火红风格标题栏 ========== */}
      <div
        className="relative flex items-center gap-3 px-4 py-3 border-b-4"
        style={{
          background: 'linear-gradient(180deg, #d94030 0%, #b12a1e 100%)',
          borderBottomColor: '#7a1a12',
        }}
      >
        <button
          onClick={handleBack}
          className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          aria-label="返回"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h2
            className="text-white text-lg font-black tracking-wider"
            style={{ textShadow: '0 2px 0 rgba(0,0,0,0.35)' }}
          >
            宝可梦电脑
          </h2>
          <div className="text-[11px] text-red-100/80 font-mono">
            BILL'S PC TERMINAL
          </div>
        </div>
        {/* 右上角亮起的绿色状态灯 */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
        </div>
      </div>

      {/* ========== Tab 切换栏 ========== */}
      <div className="flex gap-0 px-3 pt-3 pb-0" style={{ backgroundColor: '#0c1a3a' }}>
        <TabButton
          icon={<BoxSelect size={16} />}
          label="宝可梦盒子"
          active={activeTab === 'box'}
          onClick={() => setActiveTab('box')}
        />
        <TabButton
          icon={<Award size={16} />}
          label="我的排名"
          active={activeTab === 'rank'}
          onClick={() => setActiveTab('rank')}
        />
        <TabButton
          icon={<Trophy size={16} />}
          label="排行榜"
          active={activeTab === 'leaderboard'}
          onClick={() => setActiveTab('leaderboard')}
        />
      </div>

      {/* ========== Tab 内容区 - 带 CRT 显示器内框感 ========== */}
      <div
        className="flex-1 mx-3 mb-3 rounded-2xl p-3 overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#081230',
          border: '2px solid #2a4480',
          boxShadow: 'inset 0 0 20px rgba(100, 160, 255, 0.15)',
        }}
      >
        {activeTab === 'box' && (
          <BoxTab
            playerStorage={playerStorage}
            partyFull={playerParty.length >= 6}
            onSelect={(id) => {
              setSelectedPokemon(id);
              setView('SUMMARY');
            }}
            onWithdraw={(id) => withdrawPokemon(id)}
          />
        )}
        {activeTab === 'rank' && (
          <RankTab
            loading={loading}
            error={error}
            myRank={myRank}
            username={currentUser?.username}
            onRetry={loadRanking}
          />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab
            loading={loading}
            error={error}
            leaderboard={leaderboard}
            currentUserId={currentUser?.id}
            myRank={myRank}
            onRetry={loadRanking}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================
// Tab 按钮
// ============================================================
interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-bold transition-all rounded-t-xl"
    style={{
      backgroundColor: active ? '#081230' : '#1a2a5a',
      color: active ? '#6ba6ff' : '#7a8ab8',
      borderTop: active ? '2px solid #4a7bd0' : '2px solid transparent',
      borderLeft: active ? '2px solid #2a4480' : 'none',
      borderRight: active ? '2px solid #2a4480' : 'none',
      marginBottom: active ? '-2px' : '0',
    }}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    <span className="sm:hidden">{label.length > 3 ? label.slice(0, 3) : label}</span>
  </button>
);

// ============================================================
// Tab 1：宝可梦盒子
// ============================================================
interface BoxTabProps {
  playerStorage: any[];
  partyFull: boolean;
  onSelect: (id: string) => void;
  onWithdraw: (id: string) => void;
}

const BoxTab: React.FC<BoxTabProps> = ({ playerStorage, partyFull, onSelect, onWithdraw }) => {
  if (playerStorage.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
        <div className="w-20 h-20 border-4 border-slate-700 rounded-xl mb-4 flex items-center justify-center bg-slate-900/50">
          <BoxSelect size={32} />
        </div>
        <p className="text-slate-400">盒子是空的</p>
        <p className="text-xs mt-2 text-slate-600">去野外捕捉更多宝可梦吧！</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="text-cyan-300 font-mono">SYSTEM READY</span>
        <span className="text-slate-500 font-mono">{playerStorage.length} 只 / 队伍{partyFull ? '已满' : '可取出'}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 overflow-y-auto pb-2">
        {playerStorage.map((pokemon) => (
          <div
            key={pokemon.id}
            onClick={() => onSelect(pokemon.id)}
            className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50 flex gap-3 items-center hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer shadow"
          >
            <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center border border-cyan-900/30">
              <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-10 h-10 object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-sm text-slate-100 truncate">{pokemon.nickname || pokemon.speciesName}</span>
                <span className="text-[10px] font-mono text-cyan-400">Lv.{pokemon.level}</span>
              </div>
              <div className="flex gap-1 scale-90 origin-left">
                {pokemon.types.map((t: string) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
            {!partyFull ? (
              <button
                onClick={(e) => { e.stopPropagation(); onWithdraw(pokemon.id); }}
                className="bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-xs px-3 py-1.5 rounded-lg border border-emerald-800/50 transition-colors"
              >
                取出
              </button>
            ) : (
              <ChevronRight size={18} className="text-slate-700" />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

// ============================================================
// Tab 2：我的排名
// ============================================================
interface RankTabProps {
  loading: boolean;
  error: string | null;
  myRank: MyRankData | null;
  username: string | undefined;
  onRetry: () => void;
}

const RankTab: React.FC<RankTabProps> = ({ loading, error, myRank, username, onRetry }) => {
  if (loading) return <LoadingHint />;
  if (error) return <ErrorHint message={error} onRetry={onRetry} />;
  if (!myRank) return <LoadingHint />;

  const { rank, caughtCount, totalRankedPlayers } = myRank;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
      <div className="text-center">
        <div className="text-xs text-cyan-400/70 font-mono mb-1">TRAINER</div>
        <div className="text-xl font-bold text-white">{username || '训练家'}</div>
      </div>

      {/* 大号排名显示 */}
      <div
        className="relative rounded-2xl px-8 py-6 text-center border-2"
        style={{
          background: 'linear-gradient(135deg, #1a3d80 0%, #0c1a3a 100%)',
          borderColor: '#4a7bd0',
          boxShadow: '0 0 30px rgba(100, 160, 255, 0.3)',
        }}
      >
        <div className="text-xs text-cyan-300/80 font-mono tracking-wider mb-1">MY RANK</div>
        {rank === null ? (
          <>
            <div className="text-3xl font-black text-slate-400">-</div>
            <div className="text-xs text-slate-500 mt-2">还没抓到宝可梦，先去捕捉吧！</div>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xs text-cyan-300/70 font-mono">第</span>
              <span className="text-6xl font-black text-yellow-300" style={{ textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
                {rank}
              </span>
              <span className="text-xl text-cyan-300/70 font-mono">名</span>
            </div>
            <div className="text-[11px] text-cyan-400/60 font-mono mt-1">
              / 共 {totalRankedPlayers} 位参与
            </div>
          </>
        )}
      </div>

      {/* 抓到数量 */}
      <div
        className="rounded-xl px-6 py-3 text-center border"
        style={{
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          borderColor: 'rgba(251, 191, 36, 0.4)',
        }}
      >
        <div className="text-[11px] text-amber-300/70 font-mono mb-1">CAUGHT</div>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black text-amber-300">{caughtCount}</span>
          <span className="text-sm text-amber-300/70">只宝可梦</span>
        </div>
      </div>

      {rank !== null && rank <= 3 && (
        <div
          className="px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"
          style={{
            background: rank === 1 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                        rank === 2 ? 'linear-gradient(90deg, #cbd5e1, #94a3b8)' :
                                    'linear-gradient(90deg, #d97706, #92400e)',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          <Trophy size={16} />
          {rank === 1 ? '冠军！' : rank === 2 ? '亚军！' : '季军！'}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Tab 3：排行榜 Top 10
// ============================================================
interface LeaderboardTabProps {
  loading: boolean;
  error: string | null;
  leaderboard: LeaderboardEntry[] | null;
  currentUserId: string | undefined;
  myRank: MyRankData | null;
  onRetry: () => void;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ loading, error, leaderboard, currentUserId, myRank, onRetry }) => {
  if (loading) return <LoadingHint />;
  if (error) return <ErrorHint message={error} onRetry={onRetry} />;
  if (!leaderboard) return <LoadingHint />;

  const top10 = leaderboard.slice(0, 10);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 text-[11px]">
        <span className="text-yellow-300 font-mono flex items-center gap-1">
          <Trophy size={12} /> 全服 TOP 10
        </span>
        <span className="text-slate-500 font-mono">按抓到宝可梦数排名</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pb-2">
        {top10.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            还没有人上榜，你会是第一个吗？
          </div>
        ) : top10.map((entry) => {
          const isMe = entry.userId === currentUserId;
          return <RankRow key={entry.userId} entry={entry} isMe={isMe} />;
        })}
      </div>

      {/* 底部：自己的排名（如果不在 Top10 中单独提示） */}
      {myRank && myRank.rank !== null && myRank.rank > 10 && (
        <div
          className="mt-2 px-3 py-2 rounded-lg border flex items-center gap-3 text-sm"
          style={{
            backgroundColor: 'rgba(250, 204, 21, 0.08)',
            borderColor: 'rgba(250, 204, 21, 0.4)',
          }}
        >
          <span className="font-mono text-yellow-300 w-10 text-center font-bold">#{myRank.rank}</span>
          <span className="text-slate-200 font-bold flex-1">你（未进前 10）</span>
          <span className="text-amber-300 font-bold">{myRank.caughtCount} 只</span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 单行排名
// ============================================================
const RankRow: React.FC<{ entry: LeaderboardEntry; isMe: boolean }> = ({ entry, isMe }) => {
  const medalColor =
    entry.rank === 1 ? '#fbbf24' :
    entry.rank === 2 ? '#cbd5e1' :
    entry.rank === 3 ? '#d97706' : null;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all"
      style={{
        backgroundColor: isMe ? 'rgba(100, 200, 255, 0.15)' : 'rgba(15, 30, 60, 0.6)',
        borderColor: isMe ? '#60a5fa' : 'rgba(74, 123, 208, 0.3)',
        boxShadow: isMe ? '0 0 12px rgba(96, 165, 250, 0.4)' : 'none',
      }}
    >
      {/* 排名徽章 */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
        style={{
          backgroundColor: medalColor || 'rgba(74, 123, 208, 0.25)',
          color: medalColor ? '#1a1a1a' : '#93c5fd',
          border: medalColor ? 'none' : '1px solid rgba(74, 123, 208, 0.5)',
          textShadow: medalColor ? '0 1px 1px rgba(255,255,255,0.3)' : 'none',
        }}
      >
        {entry.rank}
      </div>

      {/* 用户名 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={`font-bold truncate ${isMe ? 'text-cyan-100' : 'text-slate-200'}`}>
          {entry.username}
        </span>
        {isMe && (
          <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.5 rounded font-bold">
            你
          </span>
        )}
      </div>

      {/* 数量 */}
      <div className="flex items-baseline gap-0.5 flex-shrink-0">
        <span className="text-amber-300 font-black text-base">{entry.caughtCount}</span>
        <span className="text-amber-400/60 text-[10px]">只</span>
      </div>
    </div>
  );
};

// ============================================================
// 通用：加载中 / 错误提示
// ============================================================
const LoadingHint: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-cyan-300">
    <div className="animate-pulse font-mono text-sm">加载中...</div>
    <div className="text-xs text-cyan-500/60 font-mono">CONNECTING TO SERVER</div>
  </div>
);

const ErrorHint: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
    <div className="text-red-400 text-sm">{message}</div>
    <button
      onClick={onRetry}
      className="px-4 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/50 text-cyan-200 text-sm rounded-lg border border-cyan-800/50 transition-colors"
    >
      重试
    </button>
  </div>
);

export default ComputerView;
