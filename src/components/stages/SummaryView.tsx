import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import TypeBadge from '../ui/TypeBadge';
import { ArrowLeft, Activity, Sword, Trash2, HardDrive } from 'lucide-react';
import { TYPE_TRANSLATIONS } from '../../constants';

const SummaryView: React.FC = () => {
  const { playerParty, playerStorage, selectedPokemonId, setView, setSelectedPokemon, releasePokemon, depositPokemon } = useGameStore();
  
  const inParty = playerParty.find(p => p.id === selectedPokemonId);
  const inStorage = playerStorage?.find(p => p.id === selectedPokemonId);
  const pokemon = inParty || inStorage || playerParty[0];
  
  const isStored = !!inStorage;

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
                     <div className="text-xs text-slate-400 font-mono mb-1">No.???</div>
                     <h2 className="text-2xl font-bold mb-2">{pokemon.speciesName}</h2>
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
                 <div className="flex items-center gap-2 mb-3 text-slate-300 text-sm font-bold px-1">
                    <Sword size={16} /> 学会招式
                </div>
                <div className="space-y-2">
                    {pokemon.moves.map((m, idx) => (
                        <div key={idx} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm text-slate-200">{m.move.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{TYPE_TRANSLATIONS[m.move.type]} / {m.move.category}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-sm text-slate-300">PP {m.ppCurrent}/{m.move.ppMax}</div>
                                <div className="text-[10px] text-slate-500">威力 {m.move.power || '-'}</div>
                            </div>
                        </div>
                    ))}
                    {[...Array(4 - pokemon.moves.length)].map((_, i) => (
                         <div key={`empty-${i}`} className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 border-dashed flex justify-center items-center text-slate-600 text-xs">
                             -
                         </div>
                    ))}
                </div>
            </div>

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