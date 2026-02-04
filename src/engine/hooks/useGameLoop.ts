import { useCallback, useEffect, useRef } from 'react';

/**
 * 基于 requestAnimationFrame 的游戏循环 hook。
 *
 * @param callback - 每帧回调，参数为距上一帧的时间差（毫秒）
 * @param autoStart - 是否在挂载时自动启动，默认 true
 * @returns start/stop 控制函数及运行状态
 */
export function useGameLoop(
  callback: (deltaTime: number) => void,
  autoStart = true,
) {
  const callbackRef = useRef(callback);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const runningRef = useRef(false);

  // 始终保持回调引用最新，避免闭包陈旧
  callbackRef.current = callback;

  const loop = useCallback((timestamp: number) => {
    if (!runningRef.current) return;

    // 首帧不计算 deltaTime
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    callbackRef.current(deltaTime);

    rafIdRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = 0;
    rafIdRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // 自动启动与清理
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return stop;
  }, [autoStart, start, stop]);

  return { start, stop, isRunning: runningRef } as const;
}
