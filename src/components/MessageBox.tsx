import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

const MessageBox: React.FC = () => {
  const { logs, view } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // 对战画面使用火红叶绿风格的白底蓝边对话框
  if (view === 'BATTLE') {
    return (
      <div className="h-32 bg-slate-900 p-2 relative z-20">
        {/* 火红风格：白底 + 双层蓝色圆角边框 */}
        <div className="h-full bg-gradient-to-b from-white to-sky-50 rounded-xl border-[3px] border-blue-700 shadow-lg p-3 pt-4 overflow-y-auto relative ring-2 ring-white ring-inset">
          {/* 左上角标题标签 */}
          <div className="absolute -top-2.5 left-3 bg-blue-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wider shadow-md border border-white/40">
            对战日志
          </div>
          {/* 日志内容 */}
          <div className="flex flex-col gap-1 font-mono text-sm">
            {logs.slice(-20).map((log) => (
              <div
                key={log.id}
                className={`flex gap-2 ${
                  log.type === 'urgent'
                    ? 'text-red-600 font-bold'
                    : log.type === 'combat'
                    ? 'text-blue-900 font-semibold'
                    : 'text-slate-800'
                } animate-fade-in`}
              >
                <span className="text-blue-600 text-xs mt-0.5 select-none">▸</span>
                <span className="leading-tight">{log.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    );
  }

  // 非对战画面保持原有深色风格
  return (
    <div className="h-32 bg-slate-900 border-t border-slate-800 p-4 overflow-y-auto font-mono text-sm shadow-inner relative z-20">
      <div className="flex flex-col gap-2">
        {logs.slice(-20).map((log) => (
          <div
            key={log.id}
            className={`flex gap-2 ${
              log.type === 'urgent'
                ? 'text-red-400 font-bold'
                : log.type === 'combat'
                ? 'text-amber-200'
                : 'text-slate-300'
            } animate-fade-in`}
          >
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
