import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Compass, HardDrive, Moon, Navigation, ShoppingBag } from 'lucide-react';
import { WORLD_MAP, SPECIES_DATA } from '../../constants';

const RoamStage: React.FC = () => {
  const { startBattle, healParty, addLog, addItem, playerLocationId, moveTo, buyItem, playerMoney, setView } = useGameStore();
  const [showShop, setShowShop] = useState(false);
  
  const location = WORLD_MAP[playerLocationId];
  if (!location) return <div>Location Error</div>;

  const handleExplore = () => {
    const roll = Math.random();
    // Use location specific encounters if available, otherwise fallback (for safety)
    const encounterPool = location.encounters && location.encounters.length > 0
        ? location.encounters
        : ['rattata', 'pidgey'];

    if (roll < 0.8) {
      // 80% chance to encounter wild Pokemon
      const randomEnemy = encounterPool[Math.floor(Math.random() * encounterPool.length)];
      // Validate species exists
      if (SPECIES_DATA[randomEnemy]) {
          startBattle(randomEnemy);
      } else {
          addLog("草丛里有什么东西跑掉了...", "info");
      }
    } else if (roll < 0.9) {
      // 10% chance to find item
      addItem('potion', 1);
    } else {
      // 10% chance for nothing
      addLog("微风吹过，一切都很平静。", "info");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 relative overflow-hidden">
        {/* Dynamic Atmosphere Background based on Location Data */}
        <div className={`absolute inset-0 bg-gradient-to-br ${location.bgGradient} transition-colors duration-1000`}></div>
        
        {/* Particle effects placeholder */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* Content Container - Scrollable */}
        <div className="z-10 w-full h-full overflow-y-auto flex flex-col items-center p-6 pb-32">
            
            {/* Location Card */}
            <div className="w-full max-w-xs bg-slate-800/60 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-2xl text-center relative overflow-hidden group mb-8 shrink-0 animate-fade-in-down">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-md">{location.name}</h1>
                <p className="text-slate-400 text-xs font-mono tracking-wide uppercase">{location.region} REGION</p>
                <div className="mt-4 text-xs text-slate-300 leading-relaxed font-medium">
                    {location.description}
                </div>
            </div>

            {/* Main Action - Explore */}
            <div className="w-full max-w-xs mb-6 shrink-0">
                <button 
                    onClick={handleExplore}
                    className="w-full group relative overflow-hidden bg-emerald-600 active:bg-emerald-700 text-white p-1 rounded-[2.5rem] shadow-xl transition-all transform active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <div className="bg-slate-900/20 h-28 flex items-center justify-between px-8 rounded-[2.3rem] border border-white/10 relative z-10">
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-bold tracking-wide italic">探索区域</span>
                            <span className="text-emerald-100/70 text-[10px] font-mono mt-1">EXPLORE AREA</span>
                        </div>
                        <Compass size={40} className="text-emerald-100 opacity-80 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.5} />
                    </div>
                </button>
            </div>

            {/* Travel / Connections Section */}
            <div className="w-full max-w-xs mb-6">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <Navigation size={14} className="text-slate-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">前往周边区域</h3>
                </div>
                
                <div className="space-y-2">
                    {location.connections.map(targetId => {
                        const targetLoc = WORLD_MAP[targetId];
                        if (!targetLoc) return null;
                        
                        return (
                            <button
                                key={targetId}
                                onClick={() => moveTo(targetId)}
                                className="w-full bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 p-4 rounded-xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-slate-200">{targetLoc.name}</span>
                                    <span className="text-[10px] text-slate-500">点击前往</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <Navigation size={14} className="text-emerald-500 rotate-90" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs shrink-0">
                 <button 
                    onClick={healParty}
                    className="bg-indigo-600/90 hover:bg-indigo-600 active:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <Moon size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">休息</span>
                </button>

                <button
                    onClick={() => setView('PC')}
                    className="bg-cyan-600/90 hover:bg-cyan-600 active:bg-cyan-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <HardDrive size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">电脑</span>
                </button>

                <button
                    onClick={() => setShowShop(true)}
                    className="bg-amber-600/90 hover:bg-amber-600 active:bg-amber-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">商店</span>
                </button>
            </div>
        </div>

        {/* Shop Modal */}
        {showShop && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag size={24} className="text-amber-500" />
                  道具商店
                </h2>
                <button
                  onClick={() => setShowShop(false)}
                  className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-800 rounded-lg"
                >
                  关闭
                </button>
              </div>

              <div className="mb-4 bg-slate-800/50 p-3 rounded-lg">
                <div className="text-sm text-slate-400">持有金钱</div>
                <div className="text-2xl font-bold text-amber-400">¥{playerMoney}</div>
              </div>

              <div className="space-y-3">
                {/* Potion */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">伤药</h3>
                      <p className="text-xs text-slate-400">恢复宝可梦20点HP</p>
                    </div>
                    <div className="text-lg font-bold text-amber-400">¥300</div>
                  </div>
                  <button
                    onClick={() => buyItem('potion', 300, 1)}
                    className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors"
                  >
                    购买
                  </button>
                </div>

                {/* Pokeball */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">精灵球</h3>
                      <p className="text-xs text-slate-400">用于捕捉野生宝可梦</p>
                    </div>
                    <div className="text-lg font-bold text-amber-400">¥200</div>
                  </div>
                  <button
                    onClick={() => buyItem('pokeball', 200, 1)}
                    className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors"
                  >
                    购买
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default RoamStage;