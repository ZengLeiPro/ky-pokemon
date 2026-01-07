import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { LogOut, Package } from 'lucide-react';
import { TYPE_TRANSLATIONS, TYPE_COLORS } from '../constants';

const ControlPad: React.FC = () => {
  const { view, battle, playerParty, inventory, executeMove, runAway, useItem, throwPokeball } = useGameStore();
  const [showBag, setShowBag] = useState(false);

  // Roam uses NavigationDock instead
  if (view === 'ROAM') return null;
  // Other views use their own full screen layout
  if (view !== 'BATTLE') return null;
  
  // Battle Controls
  const activeMon = playerParty[battle.playerActiveIndex];
  const usableItems = inventory.filter(item => item.category === 'MEDICINE' && item.quantity > 0);
  const pokeballs = inventory.filter(item => item.category === 'POKEBALLS' && item.quantity > 0);

  const handleUseItemInBattle = (itemId: string) => {
    useItem(itemId, activeMon.id);
    setShowBag(false);
  };

  const handleThrowPokeball = async () => {
    setShowBag(false);
    await throwPokeball();
  };

  if (battle.phase === 'INPUT') {
    // Show bag interface
    if (showBag) {
      return (
        <div className="bg-slate-900 p-3 border-t border-slate-800 shadow-2xl z-30 relative h-56 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200">战斗背包</h3>
            <button
              onClick={() => setShowBag(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded"
            >
              返回
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {/* Pokeballs Section */}
            <div>
              <h4 className="text-xs text-slate-400 font-bold mb-2 px-1">精灵球</h4>
              {pokeballs.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-2">没有精灵球</div>
              ) : (
                pokeballs.map(item => (
                  <button
                    key={item.id}
                    onClick={handleThrowPokeball}
                    className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-950 p-3 rounded-lg border border-slate-700 flex items-center justify-between transition-all active:scale-[0.98] mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white" style={{ borderBottomColor: '#1e293b' }}></div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-200">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-cyan-400">
                      x{item.quantity}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Medicine Section */}
            <div>
              <h4 className="text-xs text-slate-400 font-bold mb-2 px-1">药品</h4>
              {usableItems.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-2">没有可用的药品</div>
              ) : (
                usableItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItemInBattle(item.id)}
                    className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-950 p-3 rounded-lg border border-slate-700 flex items-center justify-between transition-all active:scale-[0.98] mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500/50 border border-red-400"></div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-200">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-cyan-400">
                      x{item.quantity}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // Show moves interface
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

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => setShowBag(true)}
            className="bg-slate-800 hover:bg-indigo-900/30 border border-slate-700 text-slate-400 hover:text-indigo-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Package size={14} /> 背包
          </button>
          <button
            onClick={runAway}
            className="bg-slate-800 hover:bg-red-900/30 border border-slate-700 text-slate-400 hover:text-red-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={14} /> 逃跑
          </button>
        </div>
      </div>
    );
  } 
    
  // Processing State
  return (
    <div className="h-56 bg-slate-900 p-2 flex items-center justify-center border-t border-slate-800 text-slate-500 font-mono text-xs animate-pulse">
        {'>> 等待指令执行...'}
    </div>
  );
};

export default ControlPad;