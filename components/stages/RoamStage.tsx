import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Compass, Moon, MessageCircle, Navigation } from 'lucide-react';
import { WORLD_MAP, SPECIES_DATA } from '../../constants';

const RoamStage: React.FC = () => {
  const { startBattle, healParty, addLog, playerLocationId, moveTo } = useGameStore();
  
  const location = WORLD_MAP[playerLocationId];
  if (!location) return <div>Location Error</div>;

  const handleExplore = () => {
    const roll = Math.random();
    // Use location specific encounters if available, otherwise fallback (for safety)
    const encounterPool = location.encounters && location.encounters.length > 0 
        ? location.encounters 
        : ['rattata', 'pidgey'];

    if (roll < 0.6) {
      const randomEnemy = encounterPool[Math.floor(Math.random() * encounterPool.length)];
      // Validate species exists
      if (SPECIES_DATA[randomEnemy]) {
          startBattle(randomEnemy);
      } else {
          addLog("草丛里有什么东西跑掉了...", "info");
      }
    } else if (roll < 0.7) {
      addLog("你发现了一个伤药！（功能未实装）", "info");
    } else {
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
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs shrink-0">
                 <button 
                    onClick={healParty}
                    className="bg-indigo-600/90 hover:bg-indigo-600 active:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <Moon size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">原地休息</span>
                </button>

                <button 
                    onClick={() => addLog("附近没有可以互动的NPC。", "info")}
                    className="bg-slate-700/90 hover:bg-slate-700 active:bg-slate-800 text-slate-200 p-4 rounded-2xl shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                    <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">交谈</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default RoamStage;