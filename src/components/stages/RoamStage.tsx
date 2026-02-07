import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Compass, HardDrive, Crown, Navigation, ShoppingBag, House, Swords, Users } from 'lucide-react';
import { WORLD_MAP, SPECIES_DATA } from '../../constants';

const TOUCH_PAN_Y_STYLE: React.CSSProperties = { touchAction: 'pan-y' };

const RAIN_OVERLAY_STYLE: React.CSSProperties = {
  backgroundImage: 'linear-gradient(to bottom, rgba(200,200,255,0.2) 0%, rgba(200,200,255,0) 100%)',
};

const RAIN_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a0c4ff' fill-opacity='0.4'%3E%3Cpath d='M0 0h1v10H0z' transform='rotate(15 0 0)'/%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: '20px 20px',
};

const HAIL_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: `radial-gradient(circle, #fff 2px, transparent 2.5px)`,
  backgroundSize: '30px 30px',
};

const PARTICLE_BG_STYLE: React.CSSProperties = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

const RoamStage: React.FC = () => {
  const { startBattle, startLegendaryBattle, addLog, addItem, playerLocationId, moveTo, setView, weather, legendaryProgress, badges } = useGameStore();
  const [showLegendary, setShowLegendary] = useState(false);

  const location = WORLD_MAP[playerLocationId];
  if (!location) return <div>Location Error</div>;

  const isTown = location.id.includes('town') || location.id.includes('city');
  const hasGym = !!location.gym;

  // 检查传说宝可梦是否可遭遇
  const legendaryEncounter = location.legendaryEncounter;
  const hasLegendary = !!legendaryEncounter;
  const legendaryStatus = legendaryEncounter ? legendaryProgress[legendaryEncounter.speciesId] : null;
  const legendaryAvailable = hasLegendary && !legendaryStatus?.captured;  // 只有捕获后才消失，击败/逃跑后可再次遭遇
  const legendaryLocked = hasLegendary && legendaryEncounter && badges.length < (legendaryEncounter.minBadges || 0);

  const getWeatherOverlay = () => {
      switch (weather) {
          case 'Rain':
              return (
                  <div className="absolute inset-0 pointer-events-none z-0 opacity-40" style={RAIN_OVERLAY_STYLE}>
                      <div className="absolute inset-0 animate-rain" style={RAIN_PATTERN_STYLE}></div>
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
                       <div className="absolute inset-0 animate-snow opacity-50" style={HAIL_PATTERN_STYLE}></div>
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
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 relative overflow-hidden" style={TOUCH_PAN_Y_STYLE}>
        {/* Dynamic Atmosphere Background based on Location Data */}
        <div className={`absolute inset-0 bg-gradient-to-br ${location.bgGradient} transition-colors duration-1000`}></div>
        
        {getWeatherOverlay()}

        {/* Particle effects placeholder */}
        <div className="absolute inset-0 opacity-10" style={PARTICLE_BG_STYLE}></div>

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
                            setView('POKEMON_CENTER');
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
                            setView('SHOP');
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
                    <span className="text-[10px] font-bold">盒子</span>
                </button>

                <button
                    onClick={() => setView('FRIENDS')}
                    className="bg-purple-600/90 hover:bg-purple-600 active:bg-purple-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <Users size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">好友</span>
                </button>

                <button
                    onClick={() => {
                        if (hasGym) {
                            setView('GYM');
                        } else {
                            addLog("这里没有道馆。", "info");
                        }
                    }}
                    className={`col-span-3 bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white p-3 rounded-2xl shadow-lg border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group ${!hasGym ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                    <Swords size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">宝可梦道馆</span>
                </button>

                {/* 传说宝可梦遭遇按钮 */}
                {hasLegendary && (
                    <button
                        onClick={() => {
                            if (legendaryLocked) {
                                addLog(`需要至少 ${legendaryEncounter?.minBadges || 0} 个道馆徽章才能遭遇传说宝可梦。`, "urgent");
                            } else if (!legendaryAvailable) {
                                const pokemon = legendaryEncounter ? SPECIES_DATA[legendaryEncounter.speciesId] : null;
                                addLog(`${pokemon?.speciesName || '传说宝可梦'} 已经不在这里了...`, "info");
                            } else {
                                setShowLegendary(true);
                            }
                        }}
                        className={`col-span-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white p-3 rounded-2xl shadow-lg border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group animate-pulse ${!legendaryAvailable || legendaryLocked ? 'opacity-50 grayscale cursor-not-allowed animate-none' : ''}`}
                    >
                        <Crown size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold">
                            {legendaryLocked ? `需要 ${legendaryEncounter?.minBadges || 0} 徽章` :
                             !legendaryAvailable ? '传说已离去' : '传说宝可梦'}
                        </span>
                    </button>
                )}
            </div>
        </div>

        {/* Legendary Pokemon Encounter Modal */}
        {showLegendary && legendaryEncounter && legendaryAvailable && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900 border-2 border-purple-500/50 rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Crown size={24} className="text-purple-400" />
                  传说宝可梦
                </h2>
                <button
                  onClick={() => setShowLegendary(false)}
                  className="text-slate-400 hover:text-white text-sm px-3 py-1 bg-slate-800 rounded-lg"
                >
                  关闭
                </button>
              </div>

              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                 <div className="w-20 h-20 bg-gradient-to-br from-purple-700 to-pink-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-400/50 shadow-lg shadow-purple-500/30">
                    <img
                      src={SPECIES_DATA[legendaryEncounter.speciesId]?.spriteUrl}
                      alt={SPECIES_DATA[legendaryEncounter.speciesId]?.speciesName}
                      className="w-16 h-16 object-contain pixelated"
                    />
                 </div>
                 <div>
                     <h3 className="font-bold text-white text-lg">{SPECIES_DATA[legendaryEncounter.speciesId]?.speciesName}</h3>
                     <p className="text-purple-400 text-xs font-mono uppercase tracking-wider">LEGENDARY POKEMON</p>
                     <p className="text-slate-400 text-xs mt-1">Lv.{legendaryEncounter.level}</p>
                 </div>
              </div>

              <div className="mb-4 bg-slate-800/30 p-3 rounded-xl text-slate-300 text-sm leading-relaxed border border-purple-500/20">
                <p className="text-center">
                  你感受到了一股强大的气息...<br/>
                  <span className="text-purple-300 font-bold">传说的宝可梦就在前方！</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    startLegendaryBattle(legendaryEncounter.speciesId, legendaryEncounter.level);
                    setShowLegendary(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
                >
                  <Crown size={18} className="animate-pulse" />
                  与传说对决
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">
                  捕获前可反复挑战
                </p>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default RoamStage;