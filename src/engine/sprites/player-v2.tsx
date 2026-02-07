// ============================================================
// 玩家角色 SVG - 像素风训练师 (HGSS 风格重制版) - 方案 2
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

/**
 * 获取玩家精灵 SVG（方案 2）。
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

// === 颜色常量 ===
const C = {
  OUTLINE: '#282020',
  SKIN: '#f8d0b0',
  SKIN_SHADOW: '#e0a888',
  HAT_MAIN: '#e63939',
  HAT_VISOR: '#ffffff',
  HAIR: '#3e3131',
  CLOTH_RED: '#d12a2a',
  CLOTH_WHITE: '#f0f0f0',
  PANTS: '#3a5a8f',
  SHOES: '#333333',
  SHADOW: 'rgba(0,0,0,0.2)',
};

const STROKE_WIDTH = 0.6;

/** 正面 (Down) */
function renderDown(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? 0.5 : 0;
  const leftLegOffset = frame === 1 ? 0.5 : 0;
  const rightLegOffset = frame === 2 ? 0.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 阴影 */}
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />

      <g transform={`translate(0, ${bob})`}>
        {/* 腿部 */}
        <path
          d={`M6,12 L6,${14 + leftLegOffset} A1,1 0 0,0 7,${15 + leftLegOffset} L8,${15 + leftLegOffset} L8,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />
        <path
          d={`M8,12 L8,${15 + rightLegOffset} A1,1 0 0,0 9,${15 + rightLegOffset} L10,${14 + rightLegOffset} L10,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />

        {/* 躯干 */}
        <rect x="5.5" y="9" width="5" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />
        <path d="M7,9 L8,11 L9,9" fill={C.CLOTH_WHITE} />
        <line x1="8" y1="11" x2="8" y2="13" stroke={C.OUTLINE} strokeWidth={0.4} />

        {/* 手臂 */}
        <path d="M5.5,9.5 L5,11.5 A1,1 0 0,0 5.5,12.5" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />
        <path d="M10.5,9.5 L11,11.5 A1,1 0 0,1 10.5,12.5" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* 头部 */}
        <path
          d="M5,5 Q5,9 8,9 Q11,9 11,5 L11,4 L5,4 Z"
          fill={C.SKIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />

        {/* 帽子 */}
        <path
          d="M4.5,4 C4.5,1.5 6,0.5 8,0.5 C10,0.5 11.5,1.5 11.5,4 L11.5,5 L4.5,5 Z"
          fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        <path d="M6,4 Q8,3 10,4" fill="none" stroke={C.HAT_VISOR} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M7.5,2.5 L8.5,2.5" fill="none" stroke={C.HAT_VISOR} strokeWidth={1.5} />

        {/* 五官 */}
        <rect x="6.2" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        <rect x="8.8" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        <circle cx="5.8" cy="7" r="0.4" fill="#f0a0a0" opacity="0.6" />
        <circle cx="10.2" cy="7" r="0.4" fill="#f0a0a0" opacity="0.6" />

        {/* 鬓角 */}
        <path d="M4.8,4.5 L4.2,5.5 L4.5,6.5" fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4} />
        <path d="M11.2,4.5 L11.8,5.5 L11.5,6.5" fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4} />
      </g>
    </svg>
  );
}

/** 背面 (Up) */
function renderUp(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? 0.5 : 0;
  const leftLegOffset = frame === 1 ? 0.5 : 0;
  const rightLegOffset = frame === 2 ? 0.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />

      <g transform={`translate(0, ${bob})`}>
        {/* 腿部 */}
        <path
          d={`M6,12 L6,${14 + leftLegOffset} L8,${14 + leftLegOffset} L8,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        <path
          d={`M8,12 L8,${14 + rightLegOffset} L10,${14 + rightLegOffset} L10,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />

        {/* 躯干 */}
        <rect x="5.5" y="9" width="5" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* 背包 */}
        <rect x="6.5" y="9.5" width="3" height="2.5" rx="0.5" fill="#a05050" stroke={C.OUTLINE} strokeWidth={0.4} />

        {/* 头部 */}
        <path
          d="M4.5,4 C4.5,1.5 6,0.5 8,0.5 C10,0.5 11.5,1.5 11.5,4 L11.5,7 L4.5,7 Z"
          fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        <path
          d="M5,7 L5,8 L6,7.5 L7,8.2 L8,7.5 L9,8.2 L10,7.5 L11,8 L11,7"
          fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4}
        />
      </g>
    </svg>
  );
}

/** 侧面内容（左右共用） */
function DrawSideContent({ frame }: { frame: number }) {
  const bob = frame !== 0 ? 0.5 : 0;
  const farLegX = frame === 1 ? 9 : (frame === 2 ? 6 : 7.5);
  const nearLegX = frame === 1 ? 6 : (frame === 2 ? 9 : 7.5);
  const farLegY = frame === 1 ? 14 : 14.5;
  const nearLegY = frame === 2 ? 14 : 14.5;

  return (
    <>
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />
      <g transform={`translate(0, ${bob})`}>
        {/* 远端腿 */}
        <path
          d={`M7.5,11 L${farLegX},13 L${farLegX},${farLegY} L8.5,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />

        {/* 远端手臂 */}
        {frame === 1 && (
          <path d="M8,9.5 Q10,10.5 10.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2} strokeLinecap="round" />
        )}
        {frame === 2 && (
          <path d="M8,9.5 Q6,10.5 6.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2} strokeLinecap="round" />
        )}

        {/* 躯干 */}
        <rect x="6" y="9" width="4" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* 头部 */}
        <g transform="translate(1,0)">
          <path d="M5,4 Q4,6 5,8 L6,8" fill={C.HAIR} />
          <path
            d="M5.5,3.5 L9.5,3.5 L9.5,8 Q9.5,9 7,9 L5.5,8 Z"
            fill={C.SKIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
          />
          <path
            d="M5,4 C5,1.5 6,0.5 8,0.5 C10,0.5 10.5,1.5 10.5,4 L5,4"
            fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
          />
          <path d="M9.5,3.5 L12,4 L9.5,4.5" fill={C.HAT_VISOR} stroke={C.OUTLINE} strokeWidth={0.4} />
          <rect x="9" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        </g>

        {/* 近端腿 */}
        <path
          d={`M7.5,12 L${nearLegX},13 L${nearLegX},${nearLegY} L8.5,11`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />
        <path d={`M${nearLegX - 0.5},${nearLegY} h2 v1 h-2 z`} fill={C.SHOES} />

        {/* 近端手臂 */}
        {frame === 1 ? (
          <path d="M7.5,9.5 Q6,10.5 5.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        ) : frame === 2 ? (
          <path d="M7.5,9.5 Q9,10.5 9.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        ) : (
          <path d="M7.5,9.5 L7.5,12" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        )}
      </g>
    </>
  );
}

/** 向左 */
function renderLeft(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <DrawSideContent frame={frame} />
    </svg>
  );
}

/** 向右（镜像左侧） */
function renderRight(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <g transform="scale(-1, 1) translate(-16, 0)">
        <DrawSideContent frame={frame} />
      </g>
    </svg>
  );
}
