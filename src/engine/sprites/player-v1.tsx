// ============================================================
// 玩家角色 SVG - 像素风训练师 (HGSS/BW 风格) - 方案 1
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

/**
 * 获取玩家精灵 SVG（方案 1）。
 * @param direction - 面朝方向
 * @param frame - 动画帧（0=静止, 1=左脚, 2=右脚）
 * @param size - 像素大小（等于 tileSize，运行时为 48）
 */
export function getPlayerSprite(
  direction: Direction,
  frame: number,
  size: number,
): JSX.Element {
  const renderers: Record<Direction, () => JSX.Element> = {
    down: () => renderDown(frame, size),
    up: () => renderUp(frame, size),
    left: () => renderLeft(frame, size),
    right: () => renderRight(frame, size),
  };
  return renderers[direction]();
}

// === 调色板 ===
const C = {
  OUTLINE: '#2c3e50',
  SKIN: '#f5cba7',
  SKIN_SHADOW: '#e0b492',
  HAT_MAIN: '#e74c3c',
  HAT_SHADE: '#c0392b',
  HAT_ACCENT: '#ffffff',
  HAIR: '#2d3436',
  SHIRT: '#3498db',
  SHIRT_ACCENT: '#ecf0f1',
  PANTS: '#34495e',
  SHOES: '#e74c3c',
  BACKPACK: '#f1c40f',
};

const getBobY = (frame: number) => (frame !== 0 ? -0.5 : 0);

/** 正面 (Down) */
function renderDown(frame: number, size: number): JSX.Element {
  const bob = getBobY(frame);
  const leftLegY = frame === 1 ? 1 : 0;
  const rightLegY = frame === 2 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      {/* 阴影 */}
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(0, ${bob})`}>
        {/* 左腿 */}
        <rect x="5.5" y={11 + leftLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="5.5" y={13.5 + leftLegY} width="2" height="1.5" fill={C.SHOES} />

        {/* 右腿 */}
        <rect x="8.5" y={11 + rightLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="8.5" y={13.5 + rightLegY} width="2" height="1.5" fill={C.SHOES} />

        {/* 躯干 */}
        <path
          d="M 5,8 L 11,8 L 11,11.5 Q 11,12.5 10,12.5 L 6,12.5 Q 5,12.5 5,11.5 Z"
          fill={C.SHIRT}
        />
        {/* 领口/拉链 */}
        <rect x="7.5" y="8" width="1" height="4.5" fill={C.SHIRT_ACCENT} />

        {/* 头部 */}
        <g transform="translate(0, -0.5)">
          {/* 脸 */}
          <rect x="4" y="3" width="8" height="6" rx="2" fill={C.SKIN} />

          {/* 鬓角 */}
          <path d="M 3.5,4 L 4.5,4 L 4.5,7 L 3.5,6 Z" fill={C.HAIR} />
          <path d="M 11.5,4 L 12.5,4 L 12.5,6 L 11.5,7 Z" fill={C.HAIR} />

          {/* 眼睛 */}
          <rect x="5.5" y="5.5" width="1" height="1.5" fill={C.HAIR} />
          <rect x="9.5" y="5.5" width="1" height="1.5" fill={C.HAIR} />
          {/* 腮红 */}
          <rect x="4.5" y="6.5" width="1" height="0.5" fill="#e5989b" opacity="0.6" />
          <rect x="10.5" y="6.5" width="1" height="0.5" fill="#e5989b" opacity="0.6" />

          {/* 帽子 */}
          <path d="M 3,4 Q 8,-1 13,4 L 13,5 L 3,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
          <path d="M 3,4.5 Q 8,3.5 13,4.5 L 13,5.5 Q 8,6.5 3,5.5 Z" fill={C.HAT_SHADE} />
          <circle cx="8" cy="3" r="1.2" fill={C.HAT_ACCENT} />
        </g>

        {/* 手臂 */}
        <rect x="3.5" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="11" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="3.5" y="11" width="1.5" height="1" fill={C.SKIN} />
        <rect x="11" y="11" width="1.5" height="1" fill={C.SKIN} />
      </g>
    </svg>
  );
}

/** 背面 (Up) */
function renderUp(frame: number, size: number): JSX.Element {
  const bob = getBobY(frame);
  const leftLegY = frame === 1 ? 1 : 0;
  const rightLegY = frame === 2 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(0, ${bob})`}>
        {/* 腿 */}
        <rect x="5.5" y={11 + leftLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="5.5" y={13.5 + leftLegY} width="2" height="1" fill={C.SHOES} />
        <rect x="8.5" y={11 + rightLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="8.5" y={13.5 + rightLegY} width="2" height="1" fill={C.SHOES} />

        {/* 躯干 */}
        <rect x="5" y="8" width="6" height="4.5" rx="1" fill={C.SHIRT} />

        {/* 背包 */}
        <rect x="5.5" y="8.5" width="5" height="3.5" rx="0.5" fill={C.BACKPACK} stroke={C.OUTLINE} strokeWidth="0.5" />
        <rect x="6" y="9" width="4" height="1.5" fill="rgba(0,0,0,0.1)" />

        {/* 头部 */}
        <g transform="translate(0, -0.5)">
          <path
            d="M 3.5,5 Q 8,8 12.5,5 L 12.5,7 Q 8,9 3.5,7 Z"
            fill={C.HAIR}
          />
          <path d="M 3.5,5 Q 8,-0.5 12.5,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
        </g>

        {/* 手臂 */}
        <rect x="3.5" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="11" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
      </g>
    </svg>
  );
}

/** 侧面内容（左右共用） */
function renderSideContent(frame: number): JSX.Element {
  const bob = getBobY(frame);

  let lLegX = 0;
  let rLegX = 0;
  let armRot = 0;

  if (frame === 1) {
    lLegX = -1.5;
    rLegX = 1.5;
    armRot = 20;
  } else if (frame === 2) {
    lLegX = 1.5;
    rLegX = -1.5;
    armRot = -20;
  }

  return (
    <>
      <ellipse cx="8" cy="15" rx="4" ry="1.5" fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(0, ${bob})`}>
        {/* 远端腿 */}
        <g transform={`translate(${rLegX}, 0)`}>
          <rect x="7" y="11" width="2.5" height="3" fill="#2c3e50" />
          <rect x="7" y="13.5" width="2.5" height="1.5" fill="#c0392b" />
        </g>

        {/* 近端腿 */}
        <g transform={`translate(${lLegX}, 0)`}>
          <rect x="6.5" y="11" width="2.5" height="3" fill={C.PANTS} />
          <rect x="6.5" y="13.5" width="2.5" height="1.5" fill={C.SHOES} />
        </g>

        {/* 躯干 */}
        <rect x="6" y="8" width="4" height="4.5" rx="1" fill={C.SHIRT} />

        {/* 背包侧面 */}
        <path d="M 10,8.5 L 11.5,9 L 11.5,11.5 L 10,12 Z" fill={C.BACKPACK} />
        <rect x="6.5" y="8" width="0.5" height="4" fill={C.SHIRT_ACCENT} />

        {/* 头部 */}
        <g transform="translate(-1, -0.5)">
          {/* 脸 */}
          <path d="M 5,3 L 10,3 L 10,8 L 9,9 L 5,9 L 4,6 Z" fill={C.SKIN} />

          {/* 眼睛 */}
          <rect x="5" y="5.5" width="1" height="1.5" fill={C.HAIR} />

          {/* 头发 */}
          <path d="M 9,4 L 10.5,4 L 11,8 L 9,8 Z" fill={C.HAIR} />
          <path d="M 4,4 L 5,4 L 4.5,5.5 Z" fill={C.HAIR} />

          {/* 帽子 */}
          <path d="M 4,4 Q 8,-0.5 11,4 L 11,5 L 4,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
          {/* 帽檐 */}
          <path d="M 4,4.5 L 2,5.5 L 4,5.5 Z" fill={C.HAT_SHADE} />
          <circle cx="8" cy="3.5" r="1" fill={C.HAT_ACCENT} />
        </g>

        {/* 手臂（带摆动） */}
        <g transform={`rotate(${armRot}, 8, 8.5)`}>
          <rect x="7" y="8.5" width="2" height="3.5" rx="1" fill={C.SHIRT} stroke={C.OUTLINE} strokeWidth="0.5" />
          <rect x="7" y="11.5" width="2" height="1.5" rx="0.5" fill={C.SKIN} />
        </g>
      </g>
    </>
  );
}

/** 向左 */
function renderLeft(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      {renderSideContent(frame)}
    </svg>
  );
}

/** 向右（镜像左侧） */
function renderRight(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <g transform="scale(-1, 1) translate(-16, 0)">
        {renderSideContent(frame)}
      </g>
    </svg>
  );
}
