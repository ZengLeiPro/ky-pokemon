import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SPECIES_DATA } from '../../constants';

const StarterSelectionView: React.FC = () => {
  const { selectStarter } = useGameStore();

  const starters = [
    { id: 'bulbasaur', name: '妙蛙种子', color: 'from-emerald-500/20 to-emerald-900/40', borderColor: 'border-emerald-500/50', textColor: 'text-emerald-400' },
    { id: 'charmander', name: '小火龙', color: 'from-orange-500/20 to-orange-900/40', borderColor: 'border-orange-500/50', textColor: 'text-orange-400' },
    { id: 'squirtle', name: '杰尼龟', color: 'from-blue-500/20 to-blue-900/40', borderColor: 'border-blue-500/50', textColor: 'text-blue-400' },
  ];

  return (
    <div className="h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">选择你的伙伴</h1>
        <p className="text-slate-400 text-sm font-medium">这将是你冒险旅程的第一位队友</p>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        {starters.map((s) => {
          const species = SPECIES_DATA[s.id];
          return (
            <button
              key={s.id}
              onClick={() => selectStarter(s.id)}
              className={`bg-gradient-to-br ${s.color} hover:brightness-125 active:scale-95 transition-all p-5 rounded-2xl flex items-center justify-between group shadow-xl border ${s.borderColor}`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest mb-1">STARTER</span>
                <span className={`text-2xl font-black ${s.textColor}`}>{s.name}</span>
                <div className="flex gap-1 mt-2">
                  {species.types?.map(type => (
                    <span key={type} className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 border border-white/5 uppercase">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <img 
                  src={species.spriteUrl} 
                  alt={s.name}
                  className="w-20 h-20 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 p-4 bg-slate-900/50 rounded-xl border border-white/5 max-w-xs text-center">
        <p className="text-[10px] text-slate-500 italic leading-relaxed">
          “去吧！去创造属于你的宝可梦大师传奇！”
        </p>
      </div>
    </div>
  );
};

export default StarterSelectionView;
