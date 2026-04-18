import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { LogEntry } from '../../types';

/**
 * 火红叶绿风格对战日志面板
 * - 紧贴宝可梦下方显示
 * - 一条一条弹出（间隔 500ms）
 * - 只显示本场对战的新日志（忽略历史记录）
 * - 白底蓝边 + 黑色文字
 */
const BattleLogPanel: React.FC = () => {
  const logs = useGameStore(s => s.logs);
  const [displayed, setDisplayed] = useState<LogEntry[]>([]);
  // 基线：组件首次挂载时 store.logs 的长度，只展示此后新增的日志
  const baselineRef = useRef<number | null>(null);
  // 待显示队列
  const pendingRef = useRef<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 首次挂载：记录基线，丢弃之前的对战日志
  useEffect(() => {
    baselineRef.current = logs.length;
    setDisplayed([]);
    pendingRef.current = [];
    // 组件卸载时清理
    return () => {
      baselineRef.current = null;
      pendingRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听日志变化：把基线之后尚未入队的日志追加到待显示队列
  useEffect(() => {
    if (baselineRef.current === null) return;
    const newLogs = logs.slice(baselineRef.current);
    const already = displayed.length + pendingRef.current.length;
    if (newLogs.length > already) {
      pendingRef.current.push(...newLogs.slice(already));
    }
  }, [logs, displayed.length]);

  // 定时从队列取一条展示，实现「一条一条弹出」
  useEffect(() => {
    const timer = setInterval(() => {
      if (pendingRef.current.length > 0) {
        const next = pendingRef.current.shift()!;
        setDisplayed(prev => [...prev, next].slice(-8));
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // 每次新日志加入后自动滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [displayed]);

  return (
    <div className="relative z-20 mx-2 mb-2 mt-px">
      {/* 火红风格：白底渐变 + 蓝色圆角双层边框 */}
      <div
        ref={scrollRef}
        className="h-24 bg-gradient-to-b from-white to-sky-50 rounded-xl border-[3px] border-blue-700 shadow-lg px-3 pt-4 pb-2 overflow-y-auto ring-2 ring-white ring-inset relative"
      >
        {/* 左上角标题标签 */}
        <div className="absolute -top-2.5 left-3 bg-blue-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wider shadow-md border border-white/40 z-10">
          对战日志
        </div>
        <div className="flex flex-col gap-1 font-mono text-sm">
          {displayed.map((log) => (
            <div
              key={log.id}
              className="flex gap-2 text-black animate-fade-in-up"
            >
              <span className="text-blue-600 text-xs mt-0.5 select-none">▸</span>
              <span className="leading-tight">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleLogPanel;
