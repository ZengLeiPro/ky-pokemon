import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { MapPin, Coins } from 'lucide-react';
import { WORLD_MAP } from '../constants';

const Header: React.FC = () => {
  const { playerMoney, playerLocationId } = useGameStore();
  
  const locationName = WORLD_MAP[playerLocationId]?.name || '未知区域';

  return (
    <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-5 text-sm text-slate-200 shadow-md relative z-20">
      {/* Location Pill */}
      <div className="flex items-center gap-2 bg-slate-900 py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
        <MapPin size={14} className="text-emerald-500" />
        <span className="font-bold tracking-wide text-slate-300">{locationName}</span>
      </div>
      
      {/* Money Pill */}
      <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
         <Coins size={14} className="text-amber-400" />
         <span className="font-bold text-amber-100 tracking-wider">¥ {playerMoney.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default Header;