import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';
import { Star, HardDrive, Info, Zap, Smartphone, Undo2 } from 'lucide-react';
import { config } from '../../config';
import type { Pokemon } from '../../../shared/types/pokemon';

// 本地存储 key
const DEVICE_POKEMON_KEY = 'device_pokemon';

function getDevicePokemon(): Pokemon | null {
  try {
    const data = localStorage.getItem(DEVICE_POKEMON_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function setDevicePokemonStorage(pokemon: Pokemon | null) {
  if (pokemon) {
    localStorage.setItem(DEVICE_POKEMON_KEY, JSON.stringify(pokemon));
  } else {
    localStorage.removeItem(DEVICE_POKEMON_KEY);
  }
}

const TeamGrid: React.FC = () => {
  const store = useGameStore();
  const { playerParty, setView, setSelectedPokemon, battle, setFirstPokemon, addLog } = store;
  const activeIndex = battle?.playerActiveIndex ?? 0;
  const [transferring, setTransferring] = React.useState<string | null>(null);
  const [transferMsg, setTransferMsg] = React.useState('');
  const [devicePkm, setDevicePkm] = React.useState<Pokemon | null>(getDevicePokemon);

  const handleSelect = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedPokemon(id);
      setView('SUMMARY');
  };

  const handleSetFirst = (id: string) => {
      setFirstPokemon(id);
  };

  const handleTransfer = async (e: React.MouseEvent, pokemon: Pokemon) => {
      e.stopPropagation();
      if (playerParty.length <= 1) return;

      const dexId = pokemon.speciesData.pokedexId;
      setTransferring(pokemon.id);
      setTransferMsg('');

      try {
          // 通知游戏服务器（ESP32会来轮询）
          await fetch(`${config.apiUrl}/device/transfer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pokedexId: dexId }),
          });
      } catch {
          // 即使服务器通知失败，本地传送也继续
      }

      // 如果设备上有旧的宝可梦，先放回队伍
      const oldDevice = getDevicePokemon();
      if (oldDevice) {
          // 用 store 的 produce 方式添加回队伍
          useGameStore.setState((state) => ({
              playerParty: [...state.playerParty, oldDevice]
          }));
          addLog(`${oldDevice.nickname || oldDevice.speciesName} 从设备传送回来了！`);
      }

      // 把新的宝可梦存到 localStorage
      setDevicePokemonStorage(pokemon);
      setDevicePkm(pokemon);

      // 从队伍中移除
      useGameStore.setState((state) => ({
          playerParty: state.playerParty.filter(p => p.id !== pokemon.id)
      }));
      addLog(`${pokemon.nickname || pokemon.speciesName} 被传送到了设备上！`);

      // 立即存档
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (userId) {
          // 需要等 state 更新后再保存
          setTimeout(() => useGameStore.getState().saveGame(userId), 100);
      }

      setTransferMsg(`${pokemon.nickname || pokemon.speciesName} 已传送到设备！`);
      setTimeout(() => { setTransferring(null); setTransferMsg(''); }, 3000);
  };

  const handleRecall = async () => {
      const devPkm = getDevicePokemon();
      if (!devPkm) return;
      if (playerParty.length >= 6) {
          setTransferMsg('队伍已满，无法取回！');
          setTimeout(() => setTransferMsg(''), 2000);
          return;
      }

      // 放回队伍
      useGameStore.setState((state) => ({
          playerParty: [...state.playerParty, devPkm]
      }));
      addLog(`${devPkm.nickname || devPkm.speciesName} 从设备传送回来了！`);

      // 清除本地存储
      setDevicePokemonStorage(null);
      setDevicePkm(null);

      // 存档
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (userId) {
          setTimeout(() => useGameStore.getState().saveGame(userId), 100);
      }

      setTransferMsg(`${devPkm.nickname || devPkm.speciesName} 回到了队伍！`);
      setTimeout(() => setTransferMsg(''), 3000);
  };

  return (
    <div className="h-full bg-slate-950 p-4 flex flex-col" style={{ touchAction: 'pan-y' }}>
       <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-white tracking-wider">队伍宝可梦</h2>

           <button
             onClick={() => setView('PC_BOX')}
             className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold transition-colors"
           >
               <HardDrive size={14} /> 盒子
           </button>
       </div>

       {/* 设备上的宝可梦 */}
       {devicePkm && (
           <div className="mb-4 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/30 flex items-center gap-3">
               <Smartphone size={16} className="text-yellow-400 shrink-0" />
               <img src={devicePkm.spriteUrl} className="w-8 h-8 pixelated" />
               <span className="text-yellow-400 text-sm font-bold flex-1">
                   {devicePkm.nickname || devicePkm.speciesName} 在设备上
               </span>
               <button
                   onClick={handleRecall}
                   className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold border border-yellow-500/30"
               >
                   <Undo2 size={12} /> 取回
               </button>
           </div>
       )}

        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
            {playerParty.map((pokemon, idx) => (
                <div
                 key={pokemon.id}
                   onClick={() => handleSetFirst(pokemon.id)}
                   className={`bg-slate-900 p-4 rounded-2xl border flex gap-4 items-center text-left hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg relative cursor-pointer group ${
                       idx === activeIndex ? 'border-emerald-500/50' : 'border-slate-800'
                   }`}
                  >
                        {idx === activeIndex && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                              <Star size={10} fill="currentColor" /> 首发
                          </div>
                      )}
                    <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800/50 shadow-inner shrink-0">
                         <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-12 h-12 object-contain pixelated transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-lg text-slate-100 truncate">{pokemon.nickname || pokemon.speciesName}</span>
                            <span className="text-xs font-mono text-cyan-400">Lv.{pokemon.level}</span>
                        </div>
                        <div className="flex gap-2 mb-2 scale-90 origin-left">
                             {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                        <HPBar current={pokemon.currentHp} max={pokemon.maxHp} />
                    </div>

                    <div className="flex flex-col gap-2 z-20">
                        <button
                            onClick={(e) => handleTransfer(e, pokemon)}
                            disabled={transferring === pokemon.id || playerParty.length <= 1}
                            className={`p-2 rounded-full border transition-colors ${
                                transferring === pokemon.id
                                    ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse'
                                    : playerParty.length <= 1
                                    ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed'
                                    : 'bg-slate-800 hover:bg-yellow-500/20 text-slate-500 hover:text-yellow-400 border-slate-700'
                            }`}
                            title={playerParty.length <= 1 ? "不能传送最后一只" : "传送到设备"}
                        >
                            <Zap size={20} />
                        </button>
                        <button
                            onClick={(e) => handleSelect(e, pokemon.id)}
                            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-cyan-400 border border-slate-700 transition-colors"
                            title="查看详情"
                        >
                            <Info size={20} />
                        </button>
                    </div>
                </div>
            ))}

           {/* Empty Slots */}
           {[...Array(6 - playerParty.length)].map((_, i) => (
               <div key={`empty-${i}`} className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 border-dashed flex items-center justify-center text-slate-700 h-24">
                   <span className="text-sm font-mono">空槽位</span>
               </div>
           ))}
       </div>
       {transferMsg && (
           <div className="mt-2 text-center text-sm font-bold text-yellow-400 animate-pulse">
               {transferMsg}
           </div>
       )}
    </div>
  );
};

export default TeamGrid;
