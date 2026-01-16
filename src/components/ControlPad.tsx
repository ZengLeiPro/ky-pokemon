import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { LogOut, Package, User, ArrowLeft } from 'lucide-react';
import { calculateDamage } from '../lib/mechanics';
import { TYPE_TRANSLATIONS, TYPE_COLORS } from '../constants';
import HPBar from './ui/HPBar';

const ControlPad: React.FC = () => {
  const { view, battle, playerParty, inventory, executeMove, runAway, useItem, throwPokeball, switchPokemon } = useGameStore();
  const [showBag, setShowBag] = useState(false);
  const [showPokemon, setShowPokemon] = useState(false);

  // Roam uses NavigationDock instead
  if (view === 'ROAM') return null;
  // Other views use their own full screen layout
  if (view !== 'BATTLE') return null;

  // Battle Controls
  const activeMon = playerParty[battle.playerActiveIndex];
  const enemyMon = battle.enemy;
  const usableItems = inventory.filter(item => item.category === 'MEDICINE' && item.quantity > 0);
  const pokeballs = inventory.filter(item => item.category === 'POKEBALLS' && item.quantity > 0);

  const isForcedSwitch = battle.phase === 'FORCED_SWITCH';

  const handleUseItemInBattle = (itemId: string) => {
    useItem(itemId, activeMon.id);
    setShowBag(false);
  };

  const handleThrowPokeball = async () => {
    setShowBag(false);
    await throwPokeball();
  };

  const handleSwitchPokemon = (pokemonId: string) => {
    switchPokemon(pokemonId);
    setShowPokemon(false);
  };

  // Show Pokemon selection interface
  if (showPokemon || isForcedSwitch) {
      return (
        <div className="bg-slate-900 p-3 border-t border-slate-800 shadow-2xl z-30 relative h-56 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-200">
                {isForcedSwitch ? '宝可梦倒下，请更换！' : '选择要换上的宝可梦'}
            </h3>
            {!isForcedSwitch && (
                <button
                onClick={() => setShowPokemon(false)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded"
                >
                <ArrowLeft size={12} /> 返回
                </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {playerParty.map((pokemon, idx) => (
                <button
                    key={pokemon.id}
                    onClick={() => handleSwitchPokemon(pokemon.id)}
                    disabled={idx === battle.playerActiveIndex || pokemon.currentHp <= 0}
                    className={`w-full p-2 rounded-lg border flex items-center gap-3 transition-all active:scale-[0.98] ${
                        idx === battle.playerActiveIndex
                            ? 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed'
                            : pokemon.currentHp <= 0
                            ? 'bg-red-900/20 border-red-500/30 opacity-50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                    }`}
                >
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                        <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-8 h-8 object-contain pixelated" style={{imageRendering: 'pixelated'}} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-200">{pokemon.nickname || pokemon.speciesName}</span>
                            <span className="text-xs text-cyan-400">Lv.{pokemon.level}</span>
                        </div>
                        <div className="w-24 mt-1">
                            <HPBar current={pokemon.currentHp} max={pokemon.maxHp} showText={false} />
                        </div>
                    </div>
                    {pokemon.currentHp <= 0 && (
                        <span className="text-xs text-red-400 font-bold">已倒下</span>
                    )}
                </button>
            ))}
          </div>
        </div>
      );
  }

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
        {activeMon.moves.map((m, idx) => {
           let damageInfo = null;
           let effectivenessInfo = "";
           
           if (enemyMon && m.move.category !== 'Status') {
               const { damage, typeEffectiveness } = calculateDamage(activeMon, enemyMon, m.move);
               damageInfo = damage;
               if (typeEffectiveness > 1) effectivenessInfo = "效果绝佳";
               if (typeEffectiveness < 1 && typeEffectiveness > 0) effectivenessInfo = "效果微弱";
               if (typeEffectiveness === 0) effectivenessInfo = "无效";
           }

           return (
           <button
              key={idx}
              onClick={() => executeMove(idx)}
              disabled={m.ppCurrent === 0}
              className="relative bg-slate-800 hover:bg-slate-700 active:bg-slate-950 rounded-xl p-2 flex flex-col justify-between items-start border border-slate-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale overflow-hidden group"
           >
              {/* Type accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: TYPE_COLORS[m.move.type] }}></div>

              <div className="w-full pl-2 flex justify-between items-start">
                  <span className="font-bold text-slate-100 text-sm truncate">{m.move.name}</span>
                  <span className={`${m.ppCurrent < 5 ? 'text-red-400' : 'text-slate-500'} text-[10px] font-mono`}>
                      {m.ppCurrent}/{m.move.ppMax}
                  </span>
              </div>

              <div className="w-full pl-2 mt-1">
                   <div className="text-[10px] text-slate-400 leading-tight line-clamp-2 h-6">
                       {m.move.description}
                   </div>
                   
                   {damageInfo !== null && (
                       <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-700/50">
                           <span className="text-[10px] font-bold text-amber-500">
                               预估: {damageInfo}
                           </span>
                           {effectivenessInfo && (
                               <span className={`text-[9px] font-bold px-1 rounded ${
                                   effectivenessInfo === '效果绝佳' ? 'bg-red-900/40 text-red-300' : 
                                   effectivenessInfo === '无效' ? 'bg-slate-700 text-slate-400' :
                                   'bg-blue-900/40 text-blue-300'
                               }`}>
                                   {effectivenessInfo}
                               </span>
                           )}
                       </div>
                   )}
                   {m.move.category === 'Status' && (
                       <div className="flex items-center mt-1 pt-1 border-t border-slate-700/50">
                            <span className="text-[10px] text-slate-500 italic">变化招式</span>
                       </div>
                   )}
              </div>
           </button>
           );
        })}

        {/* Fill empty move slots */}
        {[...Array(4 - activeMon.moves.length)].map((_, i) => (
           <div key={`empty-${i}`} className="bg-slate-900/50 rounded-xl border border-slate-800 border-dashed flex items-center justify-center text-slate-700 text-xs">
               -
           </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => setShowPokemon(true)}
          className="bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 text-slate-400 hover:text-emerald-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <User size={14} /> 宝可梦
        </button>
        <button
          onClick={() => setShowBag(true)}
          className="bg-slate-800 hover:bg-indigo-900/30 border border-slate-700 text-slate-400 hover:text-indigo-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Package size={14} /> 背包
        </button>
        <button
          onClick={runAway}
          className="col-span-2 bg-slate-800 hover:bg-red-900/30 border border-slate-700 text-slate-400 hover:text-red-300 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={14} /> 逃跑
        </button>
      </div>
    </div>
  );
};

export default ControlPad;