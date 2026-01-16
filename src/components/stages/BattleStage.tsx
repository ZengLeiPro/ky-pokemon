import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import HPBar from '../ui/HPBar';
import TypeBadge from '../ui/TypeBadge';

const BattleStage: React.FC = () => {
  const { battle, playerParty, confirmNickname } = useGameStore();
  const playerMon = playerParty[battle.playerActiveIndex];
  const enemyMon = battle.enemy;
  const [nicknameInput, setNicknameInput] = useState('');

  if (!playerMon || !enemyMon) return <div className="flex h-full items-center justify-center text-slate-400 animate-pulse">进入战斗中...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
        {/* Background Design */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black z-0 pointer-events-none"></div>
        
        {/* Platform Effects (Circles) */}
        <div className="absolute top-[25%] right-[-10%] w-48 h-12 bg-black/30 blur-md rounded-[100%] rotate-[-5deg]"></div>
        <div className="absolute bottom-[28%] left-[-10%] w-64 h-16 bg-black/40 blur-lg rounded-[100%] rotate-[5deg]"></div>

        {battle.phase === 'NICKNAME' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm">
                    <h3 className="text-xl font-bold text-white mb-2 text-center">恭喜捕获！</h3>
                    <p className="text-slate-400 text-sm text-center mb-6">要给 <span className="text-cyan-400">{enemyMon.speciesName}</span> 取个名字吗？</p>
                    
                    <div className="flex justify-center mb-6">
                         <img src={enemyMon.spriteUrl} alt={enemyMon.speciesName} className="w-24 h-24 object-contain pixelated animate-bounce-slow" />
                    </div>

                    <input
                        type="text"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        placeholder={enemyMon.speciesName}
                        className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none mb-4 text-center font-bold"
                        maxLength={12}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => confirmNickname(nicknameInput.trim() || undefined)}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                        >
                            确定
                        </button>
                        <button
                            onClick={() => confirmNickname()}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95"
                        >
                            不想取名
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Enemy Info - Top Left */}
        <div className="relative z-10 pt-6 px-4 flex justify-between items-start animate-fade-in-down">
            <div className="flex-1 mr-4">
                <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border-l-4 border-red-500 shadow-lg">
                    <div className="flex justify-between items-baseline mb-1">
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{enemyMon.nickname || enemyMon.speciesName}</h2>
                        <span className="text-xs font-mono text-red-400">Lv.{enemyMon.level}</span>
                    </div>
                    <HPBar current={enemyMon.currentHp} max={enemyMon.maxHp} showText={false} />
                    <div className="flex justify-end mt-1">
                        <span className="text-[10px] font-mono text-slate-400 drop-shadow-md">
                            {enemyMon.currentHp}/{enemyMon.maxHp}
                        </span>
                    </div>
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
                        <h2 className="text-lg font-bold text-white drop-shadow-md">{playerMon.nickname || playerMon.speciesName}</h2>
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