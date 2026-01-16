import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Compass, HardDrive, Moon, Navigation, ShoppingBag, House, Heart, Swords } from 'lucide-react';
import { WORLD_MAP, SPECIES_DATA } from '../../constants';

const RoamStage: React.FC = () => {
  const { startBattle, startGymBattle, healParty, addLog, addItem, playerLocationId, moveTo, buyItem, playerMoney, setView, weather } = useGameStore();
  const [showShop, setShowShop] = useState(false);
  const [showPokeCenter, setShowPokeCenter] = useState(false);
  const [showGym, setShowGym] = useState(false);
  
  const location = WORLD_MAP[playerLocationId];
  if (!location) return <div>Location Error</div>;

  const isTown = location.id.includes('town') || location.id.includes('city');
  const hasGym = !!location.gym;

  const getWeatherOverlay = () => {
      switch (weather) {
          case 'Rain':
              return (
                  <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(200,200,255,0.2) 0%, rgba(200,200,255,0) 100%)' }}>
                      <div className="absolute inset-0 animate-rain" style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a0c4ff' fill-opacity='0.4'%3E%3Cpath d='M0 0h1v10H0z' transform='rotate(15 0 0)'/%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: '20px 20px'
                      }}></div>
                  </div>
              );
          case 'Sunny':
              return (
                  <div className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay bg-gradient-to-br from-yellow-200/20 via-orange-100/10 to-transparent"></div>
              );
          case 'Sandstorm':
              return (
                  <div className="absolute inset-0 pointer-events-none z-0 bg-yellow-900/10 sepia-[.5]">
                      <div className="absolute inset-0 animate-pulse opacity-20 bg-yellow-600/20"></div>
                  </div>
              );
          case 'Hail':
              return (
                  <div className="absolute inset-0 pointer-events-none z-0">
                       <div className="absolute inset-0 animate-snow opacity-50" style={{ 
                          backgroundImage: `radial-gradient(circle, #fff 2px, transparent 2.5px)`,
                          backgroundSize: '30px 30px'
                      }}></div>
                  </div>
              );
          default:
              return null;
      }
  };

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
        
        {getWeatherOverlay()}

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
                    onClick={() => {
                        if (isTown) {
                            setShowPokeCenter(true);
                        } else {
                            addLog("这里没有宝可梦中心。", "info");
                        }
                    }}
                    className={`bg-indigo-600/90 hover:bg-indigo-600 active:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group ${!isTown ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                    <House size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">宝可梦中心</span>
                </button>

                <button
                    onClick={() => {
                        if (isTown) {
                            setShowShop(true);
                        } else {
                            addLog("这里没有商店。", "info");
                        }
                    }}
                    className={`bg-amber-600/90 hover:bg-amber-600 active:bg-amber-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group ${!isTown ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                    <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">商店</span>
                </button>

                <button
                    onClick={() => setView('PC_BOX')}
                    className="bg-cyan-600/90 hover:bg-cyan-600 active:bg-cyan-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <HardDrive size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">电脑</span>
                </button>

                <button
                    onClick={() => {
                        if (hasGym) {
                            setShowGym(true);
                        } else {
                            addLog("这里没有道馆。", "info");
                        }
                    }}
                    className={`col-span-3 bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group ${!hasGym ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                    <Swords size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">宝可梦道馆</span>
                </button>
            </div>
        </div>

        {showGym && location.gym && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Swords size={24} className="text-rose-500" />
                  {location.name}道馆
                </h2>
                <button
                  onClick={() => setShowGym(false)}
                  className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-800 rounded-lg"
                >
                  关闭
                </button>
              </div>

              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                    🥋
                 </div>
                 <div>
                     <h3 className="font-bold text-white text-lg">{location.gym.leaderName}</h3>
                     <p className="text-rose-400 text-xs font-mono uppercase tracking-wider">GYM LEADER</p>
                     <p className="text-slate-400 text-xs mt-1">{location.gym.description}</p>
                 </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (location.gym) {
                        startGymBattle(location.gym);
                        setShowGym(false);
                    }
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                >
                  <Swords size={18} className="animate-pulse" />
                  挑战馆主
                </button>
                <div className="text-center text-xs text-slate-500 mt-2">
                    推荐等级: Lv.{location.gym.level}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pokemon Center Modal */}
        {showPokeCenter && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <House size={24} className="text-indigo-500" />
                  宝可梦中心
                </h2>
                <button
                  onClick={() => setShowPokeCenter(false)}
                  className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-800 rounded-lg"
                >
                  关闭
                </button>
              </div>

              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl text-slate-300 text-sm leading-relaxed">
                欢迎来到宝可梦中心！<br/>
                我们会回复你所有的宝可梦，让它们精神百倍。
              </div>

              <div className="space-y-3">
                 <button
                   onClick={() => {
                     healParty();
                     setShowPokeCenter(false);
                   }}
                   className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                 >
                  <Heart size={18} className="text-pink-300 fill-pink-300 animate-pulse" />
                  治疗宝可梦
                </button>
                <button
                  onClick={() => setShowPokeCenter(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-xl font-bold transition-colors"
                >
                  离开
                </button>
              </div>
            </div>
          </div>
        )}

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