import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction } from '../types';
import { INTERACTION_KEY } from '../constants';

/** 方向键映射 */
const DIRECTION_KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

/** 交互键集合 */
const INTERACT_KEYS = new Set([
  INTERACTION_KEY,
  INTERACTION_KEY.toUpperCase(),
  'Enter',
  ' ', // Space
]);

interface UseKeyboardResult {
  /** 当前按下的方向，无则为 null */
  pressedDirection: Direction | null;
  /** 交互键是否刚被按下（单次触发） */
  interactPressed: boolean;
  /** 手动重置交互按下状态 */
  resetInteract: () => void;
}

/**
 * 键盘输入 hook。
 *
 * 方向键支持多键同时按下：使用栈结构，始终取最后按下的方向。
 * 交互键为单次触发模式：按下一次后 interactPressed 变为 true，
 * 需要消费方调用 resetInteract() 或自动在下一帧重置。
 */
export function useKeyboard(): UseKeyboardResult {
  // 方向键栈：记录按下顺序，栈顶为当前生效方向
  const directionStackRef = useRef<Direction[]>([]);
  const [pressedDirection, setPressedDirection] = useState<Direction | null>(null);
  const [interactPressed, setInteractPressed] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const direction = DIRECTION_KEY_MAP[e.key];
    if (direction) {
      e.preventDefault();
      const stack = directionStackRef.current;
      // 避免重复入栈（长按时 keydown 会重复触发）
      if (!stack.includes(direction)) {
        stack.push(direction);
      }
      setPressedDirection(direction);
      return;
    }

    if (INTERACT_KEYS.has(e.key)) {
      e.preventDefault();
      setInteractPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const direction = DIRECTION_KEY_MAP[e.key];
    if (direction) {
      e.preventDefault();
      const stack = directionStackRef.current;
      // 从栈中移除该方向
      const idx = stack.indexOf(direction);
      if (idx !== -1) {
        stack.splice(idx, 1);
      }
      // 栈顶方向或 null
      setPressedDirection(stack.length > 0 ? stack[stack.length - 1] : null);
    }
  }, []);

  const resetInteract = useCallback(() => {
    setInteractPressed(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 页面失焦时清空方向栈，防止「幽灵按键」
  useEffect(() => {
    const handleBlur = () => {
      directionStackRef.current = [];
      setPressedDirection(null);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  return { pressedDirection, interactPressed, resetInteract };
}
