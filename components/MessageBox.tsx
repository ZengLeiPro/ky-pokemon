import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

const MessageBox: React.FC = () => {
  const { logs, view } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Adjust height/position based on view
  const containerClass = view === 'BATTLE' 
    ? "h-32 bg-black/80 backdrop-blur border-t-2 border-slate-700"
    : "h-32 bg-slate-900 border-t border-slate-800";

  return (
    <div className={`${containerClass} p-4 overflow-y-auto font-mono text-sm shadow-inner relative z-20`}>
      <div className="flex flex-col gap-2">
        {logs.slice(-20).map((log, i) => (
          <div key={log.id} className={`flex gap-2 ${log.type === 'urgent' ? 'text-red-400 font-bold' : log.type === 'combat' ? 'text-amber-200' : 'text-slate-300'} animate-fade-in`}>
             <span className="opacity-30 text-[10px] mt-0.5 select-none">{'>'}</span>
             <span className="leading-tight">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageBox;