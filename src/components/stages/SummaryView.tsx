import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import TypeBadge from '../ui/TypeBadge';
import { ArrowLeft, Activity, Sword, Trash2, HardDrive, Pencil, Info, BookOpen, X } from 'lucide-react';
import { TYPE_TRANSLATIONS, TYPE_COLORS } from '../../constants';
import { MOVES, SPECIES_DATA, findSpeciesKeyByPokedexId } from '@shared/constants';

const SummaryView: React.FC = () => {
  const { playerParty, playerStorage, selectedPokemonId, setView, setSelectedPokemon, releasePokemon, depositPokemon, forgetMove, learnMove } = useGameStore();
  const [expandedMove, setExpandedMove] = useState<number | null>(null);
  const [showLearnPanel, setShowLearnPanel] = useState(false);
  const [forgetTargetMoveId, setForgetTargetMoveId] = useState<string | null>(null); // 准备学习的招式ID（需要选择忘记时用）
  const [selectedForgetIndex, setSelectedForgetIndex] = useState<number | null>(null);

  const inParty = playerParty.find(p => p.id === selectedPokemonId);
  const inStorage = playerStorage?.find(p => p.id === selectedPokemonId);
  const pokemon = inParty || inStorage || playerParty[0];

  const isStored = !!inStorage;

  // 计算当前可学但未学的招式
  const learnableMoves = useMemo(() => {
    if (!pokemon) return [];
    const speciesKey = findSpeciesKeyByPokedexId(pokemon.speciesData.pokedexId);
    if (!speciesKey || !SPECIES_DATA[speciesKey]?.learnset) return [];

    const learnset = SPECIES_DATA[speciesKey].learnset!;
    const knownMoveIds = new Set(pokemon.moves.map(m => m.move.id));

    return learnset
      .filter(l => l.level <= pokemon.level && !knownMoveIds.has(l.moveId))
      .map(l => MOVES[l.moveId])
      .filter(m => !!m);
  }, [pokemon]);

  const handleBack = () => {
      setSelectedPokemon(null);
      if (isStored) {
          setView('PC_BOX');
      } else {
          setView('TEAM');
      }
  };

  const handleDeposit = () => {
      if (depositPokemon(pokemon.id)) {
          handleBack();
      }
  };

  const handleRelease = () => {
      if (confirm(`确定要放逐 ${pokemon.speciesName} 吗？\n放逐后将永远无法找回！`)) {
          const success = releasePokemon(pokemon.id);
          if (success) {
              handleBack();
          }
      }
  };

  const handleRename = () => {
    const newName = prompt("请输入新的名字：", pokemon.nickname || pokemon.speciesName);
    if (newName && newName.trim()) {
        (useGameStore.getState() as any).renamePokemon(pokemon.id, newName.trim().slice(0, 12));
    }
  };

  const handleForgetMove = (idx: number) => {
    if (pokemon.moves.length <= 1) {
      alert('至少需要保留一个招式！');
      return;
    }
    if (confirm(`确定要忘记 ${pokemon.moves[idx].move.name} 吗？`)) {
      forgetMove(pokemon.id, idx);
      setExpandedMove(null);
    }
  };

  const handleLearnMove = (moveId: string) => {
    if (pokemon.moves.length < 4) {
      // 直接学习
      learnMove(pokemon.id, moveId);
    } else {
      // 需要选择忘记哪个
      setForgetTargetMoveId(moveId);
      setSelectedForgetIndex(null);
    }
  };

  const handleConfirmLearnWithForget = () => {
    if (forgetTargetMoveId && selectedForgetIndex !== null) {
      learnMove(pokemon.id, forgetTargetMoveId, selectedForgetIndex);
      setForgetTargetMoveId(null);
      setSelectedForgetIndex(null);
      setShowLearnPanel(false);
    }
  };

  const StatRow = ({ label, value, max = 100, color = "bg-blue-500" }: { label: string, value: number, max?: number, color?: string }) => (
      <div className="flex items-center gap-3 text-xs mb-2">
          <span className="w-8 font-bold text-slate-400 uppercase">{label}</span>
          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }}></div>
          </div>
          <span className="w-6 text-right font-mono text-slate-200">{value}</span>
      </div>
  );

  return (
    <div className="h-full bg-slate-900 flex flex-col text-slate-100">
        {/* Navbar */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-slate-950">
            <button onClick={handleBack} className="mr-4 text-slate-400 hover:text-white">
                <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-lg">能力详情</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Header Card */}
            <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center shadow-inner relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/5 rounded-full blur-xl scale-75"></div>
                     <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-20 h-20 object-contain pixelated relative z-10" />
                 </div>
                 <div className="flex-1">
                     <div className="text-xs text-slate-400 font-mono mb-1">No.{String(pokemon.speciesData.pokedexId).padStart(3, '0')}</div>
                     <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">
                            {pokemon.nickname || pokemon.speciesName}
                            {pokemon.nickname && <span className="text-sm text-slate-400 font-normal ml-2">({pokemon.speciesName})</span>}
                        </h2>
                        <button onClick={handleRename} className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                            <Pencil size={14} />
                        </button>
                     </div>
                     <div className="flex gap-2">
                        {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                     </div>
                 </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">等级</div>
                    <div className="text-xl font-mono">Lv.{pokemon.level}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">特性</div>
                    <div className="text-sm font-bold">猛火</div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
                <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm font-bold border-b border-slate-700 pb-2">
                    <Activity size={16} /> 能力值
                </div>
                <StatRow label="HP" value={pokemon.stats.hp} max={pokemon.stats.hp} color="bg-green-500" />
                <StatRow label="攻" value={pokemon.stats.atk} color="bg-red-400" />
                <StatRow label="防" value={pokemon.stats.def} color="bg-yellow-400" />
                <StatRow label="特攻" value={pokemon.stats.spa} color="bg-indigo-400" />
                <StatRow label="特防" value={pokemon.stats.spd} color="bg-purple-400" />
                <StatRow label="速度" value={pokemon.stats.spe} color="bg-cyan-400" />
            </div>

            {/* Moves */}
            <div>
                 <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                        <Sword size={16} /> 招式 ({pokemon.moves.length}/4)
                    </div>
                    {learnableMoves.length > 0 && (
                        <button
                            onClick={() => { setShowLearnPanel(!showLearnPanel); setForgetTargetMoveId(null); }}
                            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <BookOpen size={14} />
                            {showLearnPanel ? '收起' : '学习招式'}
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {pokemon.moves.map((m, idx) => (
                        <div
                            key={idx}
                            onClick={() => setExpandedMove(expandedMove === idx ? null : idx)}
                            className={`bg-slate-800 rounded-lg border transition-all cursor-pointer overflow-hidden ${
                                expandedMove === idx ? 'border-slate-500 ring-1 ring-slate-500' : 'border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            <div className="p-3 flex justify-between items-center relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: TYPE_COLORS[m.move.type] }}></div>

                                <div className="pl-2">
                                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                                        {m.move.name}
                                        {expandedMove === idx && <Info size={12} className="text-slate-500" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{TYPE_TRANSLATIONS[m.move.type]} / {m.move.category}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm text-slate-300">PP {m.ppCurrent}/{m.move.ppMax}</div>
                                    <div className="text-[10px] text-slate-500">威力 {m.move.power || '-'}</div>
                                </div>
                            </div>

                            {expandedMove === idx && (
                                <div className="px-3 pb-3 pt-0 text-xs text-slate-400 border-t border-slate-700/50 bg-slate-800/50">
                                    <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
                                        <div className="bg-slate-900/50 p-1.5 rounded text-center">
                                            <span className="text-[10px] text-slate-500 block">命中</span>
                                            <span className="font-mono text-slate-300">{m.move.accuracy || '-'}</span>
                                        </div>
                                        <div className="bg-slate-900/50 p-1.5 rounded text-center">
                                            <span className="text-[10px] text-slate-500 block">优先度</span>
                                            <span className="font-mono text-slate-300">{m.move.priority || '0'}</span>
                                        </div>
                                    </div>
                                    <p className="leading-relaxed text-slate-300 mb-2">
                                        {m.move.description || "暂无描述"}
                                    </p>
                                    {pokemon.moves.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleForgetMove(idx); }}
                                            className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            忘记这个招式
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {[...Array(4 - pokemon.moves.length)].map((_, i) => (
                         <div key={`empty-${i}`} className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 border-dashed flex justify-center items-center text-slate-600 text-xs">
                             -
                         </div>
                    ))}
                </div>
            </div>

            {/* Learn Move Panel */}
            {showLearnPanel && (
                <div className="bg-slate-800 rounded-xl border border-cyan-800/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                            <BookOpen size={14} /> 可学习的招式
                        </h3>
                        <button onClick={() => { setShowLearnPanel(false); setForgetTargetMoveId(null); }} className="text-slate-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* 选择忘记招式的弹层 */}
                    {forgetTargetMoveId && (() => {
                        const targetMove = MOVES[forgetTargetMoveId];
                        if (!targetMove) return null;
                        return (
                            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                                <p className="text-xs text-yellow-400 mb-2 font-bold">
                                    要学习 {targetMove.name}，必须忘记一个招式：
                                </p>
                                <div className="space-y-1.5 mb-3">
                                    {pokemon.moves.map((m, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedForgetIndex(selectedForgetIndex === idx ? null : idx)}
                                            className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                                                selectedForgetIndex === idx
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[m.move.type] }}></span>
                                                    {m.move.name}
                                                </span>
                                                {selectedForgetIndex === idx && <span className="text-red-400 font-bold">忘记</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleConfirmLearnWithForget}
                                        disabled={selectedForgetIndex === null}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                                            selectedForgetIndex !== null
                                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        确认
                                    </button>
                                    <button
                                        onClick={() => { setForgetTargetMoveId(null); setSelectedForgetIndex(null); }}
                                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {learnableMoves.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">没有可学习的新招式了</p>
                    ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {learnableMoves.map((move) => (
                                <button
                                    key={move.id}
                                    onClick={() => handleLearnMove(move.id)}
                                    disabled={!!forgetTargetMoveId}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                                        forgetTargetMoveId ? 'opacity-40 cursor-not-allowed' : 'hover:border-cyan-600 hover:bg-slate-900'
                                    } border-slate-700 bg-slate-900/50`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[move.type] }}></span>
                                                <span className="text-sm font-bold text-slate-200">{move.name}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 ml-3">
                                                {TYPE_TRANSLATIONS[move.type]} / {move.category}
                                            </div>
                                        </div>
                                        <div className="text-right text-[10px] text-slate-500">
                                            <div>威力 {move.power || '-'}</div>
                                            <div>命中 {move.accuracy || '-'}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex gap-3">
                {!isStored && (
                    <button
                        onClick={handleDeposit}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                    >
                        <HardDrive size={16} />
                        存入盒子
                    </button>
                )}

                <button
                    onClick={handleRelease}
                    className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                >
                    <Trash2 size={16} />
                    放逐
                </button>
            </div>

            <p className="text-[10px] text-slate-600 text-center mt-2 pb-4">
                注意：放逐后无法找回。
            </p>
        </div>
    </div>
  );
};

export default SummaryView;
