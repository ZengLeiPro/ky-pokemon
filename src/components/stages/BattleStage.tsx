import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';

const BattleStage: React.FC = () => {
  const { battle, playerParty } = useGameStore();
  const playerMon = playerParty[battle.playerActiveIndex];
  const enemyMon = battle.enemy;

  if (!playerMon || !enemyMon) return <div className="flex h-full items-center justify-center text-slate-400 animate-pulse">进入战斗中...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
        {/* Background Design */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black z-0 pointer-events-none"></div>
        
        {/* Platform Effects (Circles) */}
        <div className="absolute top-[25%] right-[-10%] w-48 h-12 bg-black/30 blur-md rounded-[100%] rotate-[-5deg]"></div>
        <div className="absolute bottom-[28%] left-[-10%] w-64 h-16 bg-black/40 blur-lg rounded-[100%] rotate-[5deg]"></div>

        {/* Enemy Info - Top Left */}
        <div className="relative z-10 pt-6 px-4 flex justify-between items-start animate-fade-in-down">
            <div className="flex-1 mr-4">
                <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border-l-4 border-red-500 shadow-lg">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{enemyMon.speciesName}</h2>
                        <span className="text-xs font-mono text-red-400">Lv.{enemyMon.level}</span>
                    </div>
                    <HPBar current={enemyMon.currentHp} max={enemyMon.maxHp} showText={false} />
                </div>
            </div>
            <div className="w-28 h-28 flex items-center justify-center relative -mt-2">
                 <img src={enemyMon.spriteUrl} alt={enemyMon.speciesName} className="w-full h-full object-contain pixelated drop-shadow-2xl animate-float-slow" style={{imageRendering: 'pixelated'}} />
            </div>
        </div>

        {/* Dynamic Spacer */}
        <div className="flex-grow"></div>

        {/* Player Info - Bottom Right */}
        <div className="relative z-10 pb-6 px-4 flex justify-between items-end animate-fade-in-up">
             <div className="w-32 h-32 flex items-center justify-center relative -mb-2 z-10">
                 <img src={playerMon.spriteUrl} alt={playerMon.speciesName} className="w-full h-full object-contain pixelated scale-x-[-1] drop-shadow-2xl" style={{imageRendering: 'pixelated'}} />
            </div>
            <div className="flex-1 flex flex-col items-end ml-4">
                <div className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border-r-4 border-cyan-500 shadow-lg w-full max-w-[200px]">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{playerMon.speciesName}</h2>
                        <span className="text-xs font-mono text-cyan-400">Lv.{playerMon.level}</span>
                    </div>
                    
                    <div className="mb-2">
                        <HPBar current={playerMon.currentHp} max={playerMon.maxHp} />
                    </div>

                    <div className="flex justify-between items-center">
                         <div className="flex gap-1 scale-90 origin-left">
                            {playerMon.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            EXP {playerMon.exp}/{playerMon.nextLevelExp}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BattleStage;