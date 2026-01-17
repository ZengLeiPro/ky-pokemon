import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { MapPin, Coins, RotateCcw } from 'lucide-react';
import { WORLD_MAP } from '../constants';

const Header: React.FC = () => {
  const { playerMoney, playerLocationId, resetGame, setView } = useGameStore();
  
  const locationName = WORLD_MAP[playerLocationId]?.name || '未知区域';

  const handleReset = () => {
    if (window.confirm("确定要重置游戏吗？所有进度（等级、宝可梦、金钱、徽章）将被彻底删除！")) {
      if (window.confirm("最后一次确认：该操作无法撤销！\n您真的要重新开始吗？")) {
        resetGame();
        setView('ROAM');
        window.location.reload();
      }
    }
  };

  return (
    <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-5 text-sm text-slate-200 shadow-md relative z-20">
      {/* Location Pill */}
      <div className="flex items-center gap-2 bg-slate-900 py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
        <MapPin size={14} className="text-emerald-500" />
        <span className="font-bold tracking-wide text-slate-300">{locationName}</span>
      </div>
      
      {/* Action Area */}
      <div className="flex items-center gap-3">
        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="p-1.5 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all active:scale-90"
          title="重置游戏"
        >
          <RotateCcw size={14} />
        </button>

        {/* Money Pill */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
           <Coins size={14} className="text-amber-400" />
           <span className="font-bold text-amber-100 tracking-wider">¥ {playerMoney.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;