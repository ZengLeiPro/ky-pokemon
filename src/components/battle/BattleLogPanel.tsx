import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { LogEntry } from '../../types';

/**
 * 火红叶绿风格对战日志面板
 * - 紧贴宝可梦下方（负 margin 重叠精灵 PNG 底部透明区）
 * - 只显示最新一条消息，打字机逐字效果
 * - 一条打完就停住，等下一条新消息来才重新打
 * - 只处理组件挂载后的新日志（忽略之前的历史）
 */
const BattleLogPanel: React.FC = () => {
  const logs = useGameStore(s => s.logs);
  const [displayText, setDisplayText] = useState('');
  const [currentType, setCurrentType] = useState<LogEntry['type'] | undefined>('info');
  const [isDone, setIsDone] = useState(false);

  // 用 ref 同步最新 logs，避免闭包过期
  const logsRef = useRef(logs);
  useEffect(() => { logsRef.current = logs; }, [logs]);

  // 打字机状态（全部用 ref，避免频繁 re-render）
  const cursorRef = useRef<number>(0);         // 下一条待打印的 logs 索引
  const msgRef = useRef<string>('');            // 当前打字目标字符串
  const posRef = useRef<number>(0);             // 已打字进度
  const settleUntilRef = useRef<number | null>(null); // 打完后的短暂停留结束时间

  useEffect(() => {
    // 基线 = 挂载时 logs 长度，之前的日志全部跳过
    cursorRef.current = logsRef.current.length;
    msgRef.current = '';
    posRef.current = 0;
    settleUntilRef.current = null;
    setDisplayText('');
    setIsDone(false);

    const tick = () => {
      const nowLogs = logsRef.current;

      // 阶段 1：正在打字中
      if (msgRef.current !== '' && posRef.current < msgRef.current.length) {
        posRef.current += 1;
        setDisplayText(msgRef.current.slice(0, posRef.current));
        if (posRef.current >= msgRef.current.length) {
          // 标记打完，进入短暂停留
          settleUntilRef.current = Date.now() + 300;
          setIsDone(true);
        }
        return;
      }

      // 阶段 2：打完停留中
      if (settleUntilRef.current !== null) {
        if (Date.now() >= settleUntilRef.current) {
          // 结束停留，准备打下一条
          cursorRef.current += 1;
          msgRef.current = '';
          posRef.current = 0;
          settleUntilRef.current = null;
        }
        return;
      }

      // 阶段 3：空闲 —— 检查是否有新日志要打
      if (cursorRef.current < nowLogs.length) {
        const entry = nowLogs[cursorRef.current];
        msgRef.current = entry.message;
        posRef.current = 0;
        setCurrentType(entry.type);
        setIsDone(false);
        setDisplayText('');
      }
      // 无新日志：保持显示上一条的完整文本（displayText 不清空）
    };

    const id = window.setInterval(tick, 40);
    return () => window.clearInterval(id);
  }, []);

  const textColor =
    currentType === 'urgent' ? 'text-red-700 font-bold' :
    currentType === 'combat' ? 'text-blue-900' :
    'text-black';

  return (
    <div className="relative z-20 mx-2 mt-px mb-3">
      {/* 火红风格白底蓝边对话框 */}
      <div className="h-20 bg-gradient-to-b from-white to-sky-50 rounded-xl border-[3px] border-blue-700 shadow-lg px-3 pt-5 pb-2 ring-2 ring-white ring-inset relative overflow-hidden">
        {/* 左上角标题标签 */}
        <div className="absolute top-1 left-2 bg-blue-700 px-2 py-0.5 rounded text-[9px] font-bold text-white tracking-wider shadow border border-white/40 z-10">
          对战日志
        </div>
        {/* 当前消息（打字机效果） */}
        <div className={`font-mono text-sm leading-snug ${textColor}`}>
          {displayText && (
            <span className="flex gap-1.5">
              <span className="text-blue-600 text-xs mt-0.5 select-none">▸</span>
              <span>
                {displayText}
                {/* 打字中显示闪烁光标；打完后显示 ▼ 等待提示 */}
                {!isDone && (
                  <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-black/70 animate-pulse" />
                )}
                {isDone && (
                  <span className="inline-block ml-1 text-blue-600 animate-bounce">▼</span>
                )}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleLogPanel;
