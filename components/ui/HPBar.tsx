import React from 'react';

interface HPBarProps {
  current: number;
  max: number;
  showText?: boolean;
}

const HPBar: React.FC<HPBarProps> = ({ current, max, showText = true }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  let colorClass = 'bg-green-500';
  if (percentage < 50) colorClass = 'bg-yellow-500';
  if (percentage < 20) colorClass = 'bg-red-600';

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-1 rounded">HP</span>
      </div>
      <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden border border-slate-600">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="text-right text-xs mt-1 font-mono text-slate-300">
          {current}/{max}
        </div>
      )}
    </div>
  );
};

export default HPBar;