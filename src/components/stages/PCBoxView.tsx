import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const PCBoxView: React.FC = () => {
  const { playerStorage, playerParty, setView, setSelectedPokemon, withdrawPokemon } = useGameStore();

  const handleSelect = (id: string) => {
      setSelectedPokemon(id);
      setView('SUMMARY');
  };

  const handleWithdraw = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      withdrawPokemon(id);
  };

  const handleBack = () => {
      setView('TEAM');
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col">
       <div className="flex items-center gap-4 mb-6">
           <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={24} />
           </button>
           <h2 className="text-xl font-bold text-white tracking-wider">宝可梦盒子</h2>
           <span className="ml-auto text-xs font-mono text-slate-500">
               {playerStorage.length} 存储中
           </span>
       </div>

        {playerStorage.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <div className="w-16 h-16 border-4 border-slate-800 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">PC</span>
                </div>
                <p>盒子是空的</p>
                <p className="text-xs mt-2 text-slate-700">去野外捕捉更多宝可梦吧！</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
                {playerStorage.map((pokemon) => (
                    <div
                     key={pokemon.id}
                     onClick={() => handleSelect(pokemon.id)}
                     className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex gap-3 items-center text-left hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer shadow-lg group"
                    >
                        <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800/50 shadow-inner">
                             <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-10 h-10 object-contain pixelated" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-bold text-base text-slate-100 truncate">{pokemon.nickname || pokemon.speciesName}</span>
                                <span className="text-[10px] font-mono text-cyan-400">Lv.{pokemon.level}</span>
                            </div>
                            <div className="flex gap-1 mb-1 scale-90 origin-left">
                                 {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                            </div>
                        </div>
                        
                        {playerParty.length < 6 ? (
                             <button
                                onClick={(e) => handleWithdraw(e, pokemon.id)}
                                className="bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-800/50 transition-colors z-10"
                             >
                                 取出
                             </button>
                        ) : (
                             <ChevronRight size={18} className="text-slate-700" />
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default PCBoxView;
