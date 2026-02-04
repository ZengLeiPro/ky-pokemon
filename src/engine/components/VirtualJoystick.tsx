// ============================================================
// 虚拟摇杆组件 - 触屏操控核心
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import type { Direction } from '../types';
import {
  JOYSTICK_SIZE,
  JOYSTICK_KNOB_SIZE,
  JOYSTICK_DEAD_ZONE,
} from '../constants';

interface VirtualJoystickProps {
  /** 方向变化回调，null 表示松开 */
  onDirectionChange: (dir: Direction | null) => void;
  /** A 按钮（交互）回调 */
  onInteract?: () => void;
}

/** 根据偏移量计算方向 */
function getDirectionFromOffset(
  dx: number,
  dy: number,
  radius: number,
): Direction | null {
  const distance = Math.sqrt(dx * dx + dy * dy);
  // 死区判断
  if (distance < radius * JOYSTICK_DEAD_ZONE) {
    return null;
  }

  // 判断主方向（四方向，不支持斜向）
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx > absDy) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

/**
 * 虚拟摇杆组件。
 *
 * 固定在屏幕左下角，包含：
 * - 圆形底座 + 可拖拽的圆形旋钮（左下）
 * - A 按钮（交互按钮，右下）
 *
 * 半透明设计，不遮挡游戏画面。
 */
export function VirtualJoystick({
  onDirectionChange,
  onInteract,
}: VirtualJoystickProps) {
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [aBtnPressed, setABtnPressed] = useState(false);

  const baseRef = useRef<HTMLDivElement>(null);
  const currentDirRef = useRef<Direction | null>(null);

  const radius = JOYSTICK_SIZE / 2;
  const maxOffset = radius - JOYSTICK_KNOB_SIZE / 2;

  /** 计算触摸/鼠标相对于底座中心的偏移 */
  const getOffset = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return { x: 0, y: 0 };

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      // 限制在最大偏移范围内
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxOffset) {
        dx = (dx / distance) * maxOffset;
        dy = (dy / distance) * maxOffset;
      }

      return { x: dx, y: dy };
    },
    [maxOffset],
  );

  /** 更新旋钮位置和方向 */
  const updateDirection = useCallback(
    (clientX: number, clientY: number) => {
      const offset = getOffset(clientX, clientY);
      setKnobOffset(offset);

      const dir = getDirectionFromOffset(offset.x, offset.y, radius);
      if (dir !== currentDirRef.current) {
        currentDirRef.current = dir;
        onDirectionChange(dir);
      }
    },
    [getOffset, radius, onDirectionChange],
  );

  /** 重置摇杆 */
  const resetJoystick = useCallback(() => {
    setKnobOffset({ x: 0, y: 0 });
    setIsActive(false);
    if (currentDirRef.current !== null) {
      currentDirRef.current = null;
      onDirectionChange(null);
    }
  }, [onDirectionChange]);

  // ---- 触摸事件处理 ----

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsActive(true);
      const touch = e.touches[0];
      if (touch) {
        updateDirection(touch.clientX, touch.clientY);
      }
    },
    [updateDirection],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      if (touch) {
        updateDirection(touch.clientX, touch.clientY);
      }
    },
    [updateDirection],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resetJoystick();
    },
    [resetJoystick],
  );

  // ---- 鼠标事件处理（PC 调试用） ----

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsActive(true);
      updateDirection(e.clientX, e.clientY);

      const handleMouseMove = (ev: MouseEvent) => {
        updateDirection(ev.clientX, ev.clientY);
      };
      const handleMouseUp = () => {
        resetJoystick();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [updateDirection, resetJoystick],
  );

  // ---- A 按钮事件 ----

  const handleABtnPress = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setABtnPressed(true);
      onInteract?.();
    },
    [onInteract],
  );

  const handleABtnRelease = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setABtnPressed(false);
    },
    [],
  );

  return (
    <>
      {/* 摇杆 - 左下角 */}
      <div
        className="fixed z-50 select-none"
        style={{
          left: 24,
          bottom: 24,
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          touchAction: 'none',
        }}
      >
        {/* 底座 */}
        <div
          ref={baseRef}
          className="rounded-full"
          style={{
            width: JOYSTICK_SIZE,
            height: JOYSTICK_SIZE,
            backgroundColor: isActive
              ? 'rgba(0, 0, 0, 0.25)'
              : 'rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            position: 'relative',
            transition: 'background-color 0.15s',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {/* 方向指示十字 */}
          <svg
            width={JOYSTICK_SIZE}
            height={JOYSTICK_SIZE}
            viewBox={`0 0 ${JOYSTICK_SIZE} ${JOYSTICK_SIZE}`}
            style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }}
          >
            {/* 上箭头 */}
            <polygon
              points={`${radius},${radius * 0.3} ${radius - 6},${radius * 0.55} ${radius + 6},${radius * 0.55}`}
              fill="white"
            />
            {/* 下箭头 */}
            <polygon
              points={`${radius},${radius * 1.7} ${radius - 6},${radius * 1.45} ${radius + 6},${radius * 1.45}`}
              fill="white"
            />
            {/* 左箭头 */}
            <polygon
              points={`${radius * 0.3},${radius} ${radius * 0.55},${radius - 6} ${radius * 0.55},${radius + 6}`}
              fill="white"
            />
            {/* 右箭头 */}
            <polygon
              points={`${radius * 1.7},${radius} ${radius * 1.45},${radius - 6} ${radius * 1.45},${radius + 6}`}
              fill="white"
            />
          </svg>

          {/* 旋钮 */}
          <div
            className="rounded-full"
            style={{
              width: JOYSTICK_KNOB_SIZE,
              height: JOYSTICK_KNOB_SIZE,
              backgroundColor: isActive
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(255, 255, 255, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              position: 'absolute',
              left: radius - JOYSTICK_KNOB_SIZE / 2 + knobOffset.x,
              top: radius - JOYSTICK_KNOB_SIZE / 2 + knobOffset.y,
              transition: isActive ? 'none' : 'all 0.15s ease-out',
              boxShadow: isActive
                ? '0 0 8px rgba(255,255,255,0.3)'
                : 'none',
            }}
          />
        </div>
      </div>

      {/* A 按钮 - 右下角 */}
      <div
        className="fixed z-50 select-none"
        style={{
          right: 24,
          bottom: 32,
          touchAction: 'none',
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            backgroundColor: aBtnPressed
              ? 'rgba(232, 80, 60, 0.7)'
              : 'rgba(232, 80, 60, 0.45)',
            border: '3px solid rgba(255, 255, 255, 0.35)',
            boxShadow: aBtnPressed
              ? '0 0 12px rgba(232, 80, 60, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)'
              : '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.1s',
            transform: aBtnPressed ? 'scale(0.92)' : 'scale(1)',
            cursor: 'pointer',
          }}
          onTouchStart={handleABtnPress}
          onTouchEnd={handleABtnRelease}
          onMouseDown={handleABtnPress}
          onMouseUp={handleABtnRelease}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 22,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              userSelect: 'none',
              lineHeight: 1,
            }}
          >
            A
          </span>
        </div>
      </div>
    </>
  );
}
