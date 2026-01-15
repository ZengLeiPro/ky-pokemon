import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';
import { ChevronRight, Star, HardDrive } from 'lucide-react';

const TeamGrid: React.FC = () => {
  const { playerParty, setView, setSelectedPokemon, battle, setFirstPokemon } = useGameStore();
  const activeIndex = battle?.playerActiveIndex ?? 0;

  const handleSelect = (id: string) => {
      setSelectedPokemon(id);
      setView('SUMMARY');
  };

  const handleSetFirst = (id: string) => {
      setFirstPokemon(id);
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col">
       <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-white tracking-wider">队伍宝可梦</h2>
           
           <button 
             onClick={() => setView('PC_BOX')}
             className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold transition-colors"
           >
               <HardDrive size={14} /> 盒子
           </button>
       </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
            {playerParty.map((pokemon, idx) => (
                <button
                 key={pokemon.id}
                 onClick={(e) => {
                     if (idx === activeIndex) {
                         handleSelect(pokemon.id);
                     } else {
                         e.preventDefault();
                         handleSetFirst(pokemon.id);
                     }
                 }}
                 className={`bg-slate-900 p-4 rounded-2xl border flex gap-4 items-center text-left hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg relative ${
                     idx === activeIndex ? 'border-emerald-500/50' : 'border-slate-800 cursor-pointer'
                 }`}
                >
                      {idx === activeIndex && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                              <Star size={10} fill="currentColor" /> 首发
                          </div>
                      )}
                    <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800/50 shadow-inner">
                         <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-12 h-12 object-contain pixelated transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-lg text-slate-100 truncate">{pokemon.speciesName}</span>
                            <span className="text-xs font-mono text-cyan-400">Lv.{pokemon.level}</span>
                        </div>
                        <div className="flex gap-2 mb-2 scale-90 origin-left">
                             {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                        <HPBar current={pokemon.currentHp} max={pokemon.maxHp} />
                    </div>
                    {idx === activeIndex && (
                        <ChevronRight size={20} className="text-slate-600" />
                    )}
                </button>
            ))}
           
           {/* Empty Slots */}
           {[...Array(6 - playerParty.length)].map((_, i) => (
               <div key={`empty-${i}`} className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 border-dashed flex items-center justify-center text-slate-700 h-24">
                   <span className="text-sm font-mono">空槽位</span>
               </div>
           ))}
       </div>
    </div>
  );
};

export default TeamGrid;