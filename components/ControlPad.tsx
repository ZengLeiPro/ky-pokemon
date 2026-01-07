import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { LogOut } from 'lucide-react';
import { TYPE_TRANSLATIONS, TYPE_COLORS } from '../constants';

const ControlPad: React.FC = () => {
  const { view, battle, playerParty, executeMove, runAway } = useGameStore();

  // Roam uses NavigationDock instead
  if (view === 'ROAM') return null;
  // Other views use their own full screen layout
  if (view !== 'BATTLE') return null;
  
  // Battle Controls
  const activeMon = playerParty[battle.playerActiveIndex];

  if (battle.phase === 'INPUT') {
    return (
      <div className="bg-slate-900 p-2 border-t border-slate-800 shadow-2xl z-30 relative">
        <div className="grid grid-cols-2 gap-2 h-44">
          {activeMon.moves.map((m, idx) => (
             <button
                key={idx}
                onClick={() => executeMove(idx)}
                disabled={m.ppCurrent === 0}
                className="relative bg-slate-800 hover:bg-slate-700 active:bg-slate-950 rounded-xl p-3 flex flex-col justify-between items-start border border-slate-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale overflow-hidden group"
             >
                {/* Type accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: TYPE_COLORS[m.move.type] }}></div>
                
                <span className="font-bold text-slate-100 text-sm pl-2">{m.move.name}</span>
                
                <div className="w-full pl-2">
                     <div className="flex justify-between items-center w-full text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="uppercase tracking-wider">{TYPE_TRANSLATIONS[m.move.type]}</span>
                        <span className={`${m.ppCurrent < 5 ? 'text-red-400' : 'text-slate-400'}`}>
                            PP {m.ppCurrent}/{m.move.ppMax}
                        </span>
                    </div>
                </div>
             </button>
          ))}
          
          {/* Fill empty move slots */}
          {[...Array(4 - activeMon.moves.length)].map((_, i) => (
             <div key={`empty-${i}`} className="bg-slate-900/50 rounded-xl border border-slate-800 border-dashed flex items-center justify-center text-slate-700 text-xs">
                 -
             </div>
          ))}
        </div>

        <button 
        onClick={runAway}
        className="w-full mt-2 bg-slate-800 hover:bg-red-900/30 border border-slate-700 text-slate-400 hover:text-red-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
        <LogOut size={14} /> 逃跑
        </button>
      </div>
    );
  } 
    
  // Processing State
  return (
    <div className="h-56 bg-slate-900 p-2 flex items-center justify-center border-t border-slate-800 text-slate-500 font-mono text-xs animate-pulse">
        >> 等待指令执行...
    </div>
  );
};

export default ControlPad;