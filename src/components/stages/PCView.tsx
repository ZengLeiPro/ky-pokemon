import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { ArrowLeftRight, Box, ChevronLeft, HardDrive } from 'lucide-react';

const PCView: React.FC = () => {
  const { playerParty, pcStorage, depositPokemon, withdrawPokemon, setView } = useGameStore();

  return (
    <div className="h-full bg-slate-950 flex flex-col relative animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <button
          onClick={() => setView('ROAM')}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
            <HardDrive size={20} className="text-cyan-500" />
            <span className="font-bold text-slate-200">宝可梦电脑系统</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900/50 shrink-0 border-b border-slate-800/50">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  当前队伍 ({playerParty.length}/6)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                  {playerParty.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => depositPokemon(idx)}
                        disabled={playerParty.length <= 1}
                        className="bg-slate-800 border border-slate-700 p-2 rounded-xl flex items-center gap-3 hover:bg-slate-700 active:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <img src={p.spriteUrl} alt={p.speciesName} className="w-8 h-8 pixelated" />
                          <div className="flex-1 text-left min-w-0">
                              <div className="text-sm font-bold text-slate-200 truncate">{p.speciesName}</div>
                              <div className="text-[10px] text-slate-500">Lv.{p.level}</div>
                          </div>
                          <ArrowLeftRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  电脑箱子 ({pcStorage.length})
              </h3>

              {pcStorage.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                      <Box size={32} className="mb-2 opacity-50" />
                      <span className="text-sm">箱子是空的</span>
                      <span className="text-xs text-slate-700 mt-1">捕获更多宝可梦来填充这里</span>
                  </div>
              ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {pcStorage.map((p, idx) => (
                          <button
                            key={p.id}
                            onClick={() => withdrawPokemon(idx)}
                            disabled={playerParty.length >= 6}
                            className="aspect-square bg-slate-800/50 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-800 active:scale-95 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />
                               <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                   <ArrowLeftRight size={12} className="text-cyan-400" />
                               </div>
                               <img src={p.spriteUrl} alt={p.speciesName} className="w-12 h-12 pixelated relative z-10" />
                               <span className="text-[10px] font-medium text-slate-400 truncate max-w-full px-1 relative z-10">{p.speciesName}</span>
                               <span className="text-[9px] text-slate-600 relative z-10">Lv.{p.level}</span>
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PCView;
