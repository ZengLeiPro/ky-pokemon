// ============================================================
// 玩家角色 SVG 精灵 - 像素风训练师（小智）
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

// Direction 类型定义为: 'up' | 'down' | 'left' | 'right'

/**
 * 获取玩家精灵 SVG。
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
// 帽子
const HAT_RED = '#E53935';
const HAT_WHITE = '#FFFFFF';
const HAT_GREEN = '#43A047';
const HAT_SHADOW = '#B71C1C';

// 皮肤
const SKIN_BASE = '#FFCC99';
const SKIN_SHADOW = '#E6A875';

// 头发
const HAIR_BLACK = '#2C2C2C';

// 眼睛
const EYE_WHITE = '#FFFFFF';
const EYE_PUPIL = '#1A1A1A';

// 上衣（蓝色夹克）
const JACKET_BLUE = '#2196F3';
const JACKET_DARK = '#1565C0';
const JACKET_COLLAR = '#FFFFFF';

// 裤子
const PANTS_BLUE = '#1565C0';
const PANTS_SHADOW = '#0D47A1';

// 鞋子
const SHOES_GREEN = '#66BB6A';
const SHOES_DARK = '#388E3C';
const SHOES_WHITE = '#FFFFFF';

// 手套/手
const GLOVE_GREEN = '#66BB6A';

// 轮廓
const OUTLINE = '#000000';

// === 渲染函数 ===

function renderDown(frame: number, size: number): JSX.Element {
  // 计算行走偏移
  const bodyBob = frame === 0 ? 0 : -0.4;
  const leftLegOffset = frame === 1 ? 0.8 : frame === 2 ? -0.3 : 0;
  const rightLegOffset = frame === 2 ? 0.8 : frame === 1 ? -0.3 : 0;
  const leftArmSwing = frame === 1 ? -0.3 : frame === 2 ? 0.3 : 0;
  const rightArmSwing = frame === 2 ? -0.3 : frame === 1 ? 0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 腿部 - 裤子 */}
      {/* 左腿 */}
      <rect
        x={5.5}
        y={10.5 + bodyBob + leftLegOffset}
        width={2}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <rect
        x={5.7}
        y={11 + bodyBob + leftLegOffset}
        width={0.8}
        height={2}
        fill={PANTS_SHADOW}
      />

      {/* 右腿 */}
      <rect
        x={8.5}
        y={10.5 + bodyBob + rightLegOffset}
        width={2}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <rect
        x={9.5}
        y={11 + bodyBob + rightLegOffset}
        width={0.8}
        height={2}
        fill={PANTS_SHADOW}
      />

      {/* 鞋子 */}
      {/* 左鞋 */}
      <ellipse
        cx={6.5}
        cy={14.3 + bodyBob + leftLegOffset}
        rx={1.2}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={6.5} cy={14.1 + bodyBob + leftLegOffset} rx={0.6} ry={0.3} fill={SHOES_WHITE} />

      {/* 右鞋 */}
      <ellipse
        cx={9.5}
        cy={14.3 + bodyBob + rightLegOffset}
        rx={1.2}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={9.5} cy={14.1 + bodyBob + rightLegOffset} rx={0.6} ry={0.3} fill={SHOES_WHITE} />

      {/* 身体 - 夹克 */}
      <path
        d={`M 6 ${7 + bodyBob} L 5 ${9 + bodyBob} L 5 ${11 + bodyBob} L 10.5 ${11 + bodyBob} L 10.5 ${9 + bodyBob} L 9.5 ${7 + bodyBob} Z`}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 夹克阴影 */}
      <rect x={7.5} y={7.5 + bodyBob} width={2} height={3} fill={JACKET_DARK} opacity={0.3} />

      {/* 衣领 */}
      <path
        d={`M 6.5 ${7 + bodyBob} L 6 ${8 + bodyBob} L 7.5 ${8 + bodyBob} L 8 ${7.5 + bodyBob} L 7.5 ${7.5 + bodyBob} Z`}
        fill={JACKET_COLLAR}
      />
      <path
        d={`M 9 ${7 + bodyBob} L 9.5 ${8 + bodyBob} L 8 ${8 + bodyBob} L 7.5 ${7.5 + bodyBob} L 8 ${7.5 + bodyBob} Z`}
        fill={JACKET_COLLAR}
      />

      {/* 手臂 */}
      {/* 左臂 */}
      <rect
        x={4.5}
        y={8 + bodyBob + leftArmSwing}
        width={1.5}
        height={3}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={5.2} cy={11.2 + bodyBob + leftArmSwing} r={0.8} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 右臂 */}
      <rect
        x={10}
        y={8 + bodyBob + rightArmSwing}
        width={1.5}
        height={3}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={10.8} cy={11.2 + bodyBob + rightArmSwing} r={0.8} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 头部 - 脸 */}
      <ellipse
        cx={8}
        cy={5 + bodyBob}
        rx={2.5}
        ry={2.8}
        fill={SKIN_BASE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 脸部阴影 */}
      <ellipse cx={8} cy={6 + bodyBob} rx={2} ry={1.5} fill={SKIN_SHADOW} opacity={0.2} />

      {/* 头发 */}
      <path
        d={`M 5.5 ${4 + bodyBob} Q 5.5 ${2.5 + bodyBob} 7 ${2.8 + bodyBob} Q 8 ${2.5 + bodyBob} 9 ${2.8 + bodyBob} Q 10.5 ${2.5 + bodyBob} 10.5 ${4 + bodyBob}`}
        fill={HAIR_BLACK}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 刘海 */}
      <path
        d={`M 6.5 ${3.5 + bodyBob} L 6 ${4.5 + bodyBob} L 7 ${4.2 + bodyBob} Z`}
        fill={HAIR_BLACK}
      />
      <path
        d={`M 9.5 ${3.5 + bodyBob} L 10 ${4.5 + bodyBob} L 9 ${4.2 + bodyBob} Z`}
        fill={HAIR_BLACK}
      />

      {/* 帽子 */}
      <ellipse
        cx={8}
        cy={3 + bodyBob}
        rx={3}
        ry={1.5}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 5 ${3 + bodyBob} Q 8 ${1 + bodyBob} 11 ${3 + bodyBob} L 10 ${3.5 + bodyBob} Q 8 ${2 + bodyBob} 6 ${3.5 + bodyBob} Z`}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 帽子前部白色 */}
      <ellipse cx={8} cy={3 + bodyBob} rx={2.5} ry={1} fill={HAT_WHITE} />
      {/* 帽子标志 */}
      <circle cx={8} cy={2.5 + bodyBob} r={0.8} fill={HAT_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={8} cy={2.5 + bodyBob} r={0.5} fill={HAT_GREEN} />
      <path
        d={`M 7.5 ${2.5 + bodyBob} L 8 ${2.2 + bodyBob} L 8.5 ${2.5 + bodyBob} L 8 ${2.8 + bodyBob} Z`}
        fill={HAT_WHITE}
      />

      {/* 眼睛 */}
      <ellipse cx={6.8} cy={5 + bodyBob} rx={0.6} ry={0.7} fill={EYE_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <ellipse cx={9.2} cy={5 + bodyBob} rx={0.6} ry={0.7} fill={EYE_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={6.8} cy={5.2 + bodyBob} r={0.35} fill={EYE_PUPIL} />
      <circle cx={9.2} cy={5.2 + bodyBob} r={0.35} fill={EYE_PUPIL} />

      {/* 眼睛高光 */}
      <circle cx={6.9} cy={4.9 + bodyBob} r={0.15} fill={EYE_WHITE} />
      <circle cx={9.3} cy={4.9 + bodyBob} r={0.15} fill={EYE_WHITE} />

      {/* 嘴巴 */}
      <path
        d={`M 7.2 ${6.2 + bodyBob} Q 8 ${6.5 + bodyBob} 8.8 ${6.2 + bodyBob}`}
        stroke={OUTLINE}
        strokeWidth={0.2}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function renderUp(frame: number, size: number): JSX.Element {
  // 计算行走偏移
  const bodyBob = frame === 0 ? 0 : -0.4;
  const leftLegOffset = frame === 1 ? 0.8 : frame === 2 ? -0.3 : 0;
  const rightLegOffset = frame === 2 ? 0.8 : frame === 1 ? -0.3 : 0;
  const leftArmSwing = frame === 1 ? 0.3 : frame === 2 ? -0.3 : 0;
  const rightArmSwing = frame === 2 ? 0.3 : frame === 1 ? -0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 腿部 - 裤子 */}
      {/* 左腿 */}
      <rect
        x={5.5}
        y={10.5 + bodyBob + leftLegOffset}
        width={2}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />

      {/* 右腿 */}
      <rect
        x={8.5}
        y={10.5 + bodyBob + rightLegOffset}
        width={2}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />

      {/* 鞋子 */}
      {/* 左鞋 */}
      <ellipse
        cx={6.5}
        cy={14.3 + bodyBob + leftLegOffset}
        rx={1.2}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />

      {/* 右鞋 */}
      <ellipse
        cx={9.5}
        cy={14.3 + bodyBob + rightLegOffset}
        rx={1.2}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />

      {/* 身体 - 夹克背面 */}
      <path
        d={`M 6 ${7 + bodyBob} L 5 ${9 + bodyBob} L 5 ${11 + bodyBob} L 10.5 ${11 + bodyBob} L 10.5 ${9 + bodyBob} L 9.5 ${7 + bodyBob} Z`}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 背部阴影 */}
      <rect x={7} y={7.5 + bodyBob} width={2} height={3} fill={JACKET_DARK} opacity={0.3} />

      {/* 手臂 */}
      {/* 左臂 */}
      <rect
        x={4.5}
        y={8 + bodyBob + leftArmSwing}
        width={1.5}
        height={3}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={5.2} cy={11.2 + bodyBob + leftArmSwing} r={0.8} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 右臂 */}
      <rect
        x={10}
        y={8 + bodyBob + rightArmSwing}
        width={1.5}
        height={3}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={10.8} cy={11.2 + bodyBob + rightArmSwing} r={0.8} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 头部 - 后脑勺 */}
      <ellipse
        cx={8}
        cy={5 + bodyBob}
        rx={2.5}
        ry={2.8}
        fill={SKIN_BASE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />

      {/* 头发后部 */}
      <path
        d={`M 5.5 ${4 + bodyBob} Q 5.5 ${2.5 + bodyBob} 7 ${2.8 + bodyBob} Q 8 ${2.5 + bodyBob} 9 ${2.8 + bodyBob} Q 10.5 ${2.5 + bodyBob} 10.5 ${4 + bodyBob}`}
        fill={HAIR_BLACK}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 后脑勺头发细节 */}
      <ellipse cx={8} cy={4.5 + bodyBob} rx={2} ry={1.5} fill={HAIR_BLACK} />

      {/* 帽子背面 */}
      <ellipse
        cx={8}
        cy={3 + bodyBob}
        rx={3}
        ry={1.5}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 5 ${3 + bodyBob} Q 8 ${1 + bodyBob} 11 ${3 + bodyBob} L 10 ${3.5 + bodyBob} Q 8 ${2 + bodyBob} 6 ${3.5 + bodyBob} Z`}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 帽子调节扣 */}
      <rect x={7.3} y={3.5 + bodyBob} width={1.4} height={0.6} fill={HAT_WHITE} stroke={OUTLINE} strokeWidth={0.1} rx={0.2} />
    </svg>
  );
}

function renderLeft(frame: number, size: number): JSX.Element {
  // 计算行走偏移
  const bodyBob = frame === 0 ? 0 : -0.4;
  const frontLegOffset = frame === 1 ? 1 : frame === 2 ? -0.5 : 0;
  const backLegOffset = frame === 2 ? 0.8 : frame === 1 ? -0.5 : 0;
  const frontArmSwing = frame === 2 ? -0.5 : frame === 1 ? 0.3 : 0;
  const backArmSwing = frame === 1 ? -0.5 : frame === 2 ? 0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 后腿 */}
      <rect
        x={7.5}
        y={10.5 + bodyBob + backLegOffset}
        width={1.8}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 后鞋 */}
      <ellipse
        cx={8.3}
        cy={14.3 + bodyBob + backLegOffset}
        rx={1.3}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={8} cy={14.1 + bodyBob + backLegOffset} rx={0.5} ry={0.3} fill={SHOES_WHITE} />

      {/* 后臂 */}
      <rect
        x={9}
        y={8 + bodyBob + backArmSwing}
        width={1.3}
        height={2.8}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={9.6} cy={11 + bodyBob + backArmSwing} r={0.7} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 身体 */}
      <ellipse
        cx={7.5}
        cy={9 + bodyBob}
        rx={2}
        ry={2.5}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 身体侧面阴影 */}
      <ellipse cx={8.2} cy={9 + bodyBob} rx={1} ry={2} fill={JACKET_DARK} opacity={0.3} />

      {/* 衣领侧面 */}
      <path
        d={`M 6.5 ${7.5 + bodyBob} L 6 ${8.5 + bodyBob} L 7.5 ${8.5 + bodyBob} L 7.5 ${7.5 + bodyBob} Z`}
        fill={JACKET_COLLAR}
      />

      {/* 前腿 */}
      <rect
        x={6}
        y={10.5 + bodyBob + frontLegOffset}
        width={1.8}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <rect x={6.2} y={11 + bodyBob + frontLegOffset} width={0.8} height={2} fill={PANTS_SHADOW} />

      {/* 前鞋 */}
      <ellipse
        cx={6.8}
        cy={14.3 + bodyBob + frontLegOffset}
        rx={1.3}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={6.5} cy={14.1 + bodyBob + frontLegOffset} rx={0.5} ry={0.3} fill={SHOES_WHITE} />

      {/* 前臂 */}
      <rect
        x={5}
        y={8 + bodyBob + frontArmSwing}
        width={1.3}
        height={2.8}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={5.6} cy={11 + bodyBob + frontArmSwing} r={0.7} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 头部 */}
      <ellipse
        cx={7.5}
        cy={5 + bodyBob}
        rx={2.3}
        ry={2.6}
        fill={SKIN_BASE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 脸部阴影 */}
      <path d={`M 8.5 ${3.5 + bodyBob} Q 9 ${5 + bodyBob} 8.5 ${6.5 + bodyBob}`} fill={SKIN_SHADOW} opacity={0.2} />

      {/* 头发侧面 */}
      <path
        d={`M 5.5 ${4 + bodyBob} Q 5.2 ${3 + bodyBob} 6.5 ${3 + bodyBob} L 7 ${3.5 + bodyBob} Q 6 ${3.8 + bodyBob} 5.8 ${4.5 + bodyBob} Z`}
        fill={HAIR_BLACK}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 6.5 ${3.8 + bodyBob} L 6 ${5 + bodyBob} L 6.5 ${4.5 + bodyBob} Z`}
        fill={HAIR_BLACK}
      />

      {/* 帽子侧面 */}
      <ellipse
        cx={7}
        cy={3 + bodyBob}
        rx={2.5}
        ry={1.5}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 4.5 ${3 + bodyBob} Q 7 ${1.2 + bodyBob} 9 ${2.5 + bodyBob} L 8.5 ${3 + bodyBob} Q 7 ${2 + bodyBob} 5 ${3.2 + bodyBob} Z`}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 帽檐 */}
      <ellipse cx={5.5} cy={4 + bodyBob} rx={1.5} ry={0.6} fill={HAT_RED} stroke={OUTLINE} strokeWidth={0.2} />
      <ellipse cx={5.5} cy={3.8 + bodyBob} rx={1.2} ry={0.4} fill={HAT_WHITE} />

      {/* 帽子标志侧面 */}
      <circle cx={6.5} cy={2.8 + bodyBob} r={0.6} fill={HAT_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={6.5} cy={2.8 + bodyBob} r={0.4} fill={HAT_GREEN} />

      {/* 眼睛（侧面只看到一只） */}
      <ellipse cx={6.5} cy={5 + bodyBob} rx={0.7} ry={0.8} fill={EYE_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={6.3} cy={5.2 + bodyBob} r={0.35} fill={EYE_PUPIL} />
      <circle cx={6.4} cy={4.9 + bodyBob} r={0.15} fill={EYE_WHITE} />

      {/* 鼻子 */}
      <circle cx={5.5} cy={5.5 + bodyBob} r={0.3} fill={SKIN_SHADOW} />

      {/* 嘴巴 */}
      <path
        d={`M 5.5 ${6 + bodyBob} Q 6 ${6.3 + bodyBob} 6.5 ${6.2 + bodyBob}`}
        stroke={OUTLINE}
        strokeWidth={0.2}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function renderRight(frame: number, size: number): JSX.Element {
  // 计算行走偏移（与left相反）
  const bodyBob = frame === 0 ? 0 : -0.4;
  const frontLegOffset = frame === 2 ? 1 : frame === 1 ? -0.5 : 0;
  const backLegOffset = frame === 1 ? 0.8 : frame === 2 ? -0.5 : 0;
  const frontArmSwing = frame === 1 ? -0.5 : frame === 2 ? 0.3 : 0;
  const backArmSwing = frame === 2 ? -0.5 : frame === 1 ? 0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 后腿 */}
      <rect
        x={6.7}
        y={10.5 + bodyBob + backLegOffset}
        width={1.8}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 后鞋 */}
      <ellipse
        cx={7.7}
        cy={14.3 + bodyBob + backLegOffset}
        rx={1.3}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={8} cy={14.1 + bodyBob + backLegOffset} rx={0.5} ry={0.3} fill={SHOES_WHITE} />

      {/* 后臂 */}
      <rect
        x={5.7}
        y={8 + bodyBob + backArmSwing}
        width={1.3}
        height={2.8}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={6.4} cy={11 + bodyBob + backArmSwing} r={0.7} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 身体 */}
      <ellipse
        cx={8.5}
        cy={9 + bodyBob}
        rx={2}
        ry={2.5}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 身体侧面阴影 */}
      <ellipse cx={7.8} cy={9 + bodyBob} rx={1} ry={2} fill={JACKET_DARK} opacity={0.3} />

      {/* 衣领侧面 */}
      <path
        d={`M 9.5 ${7.5 + bodyBob} L 10 ${8.5 + bodyBob} L 8.5 ${8.5 + bodyBob} L 8.5 ${7.5 + bodyBob} Z`}
        fill={JACKET_COLLAR}
      />

      {/* 前腿 */}
      <rect
        x={8.2}
        y={10.5 + bodyBob + frontLegOffset}
        width={1.8}
        height={3.5}
        fill={PANTS_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <rect x={9} y={11 + bodyBob + frontLegOffset} width={0.8} height={2} fill={PANTS_SHADOW} />

      {/* 前鞋 */}
      <ellipse
        cx={9.2}
        cy={14.3 + bodyBob + frontLegOffset}
        rx={1.3}
        ry={0.8}
        fill={SHOES_GREEN}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <ellipse cx={9.5} cy={14.1 + bodyBob + frontLegOffset} rx={0.5} ry={0.3} fill={SHOES_WHITE} />

      {/* 前臂 */}
      <rect
        x={9.7}
        y={8 + bodyBob + frontArmSwing}
        width={1.3}
        height={2.8}
        fill={JACKET_BLUE}
        stroke={OUTLINE}
        strokeWidth={0.2}
        rx={0.3}
      />
      <circle cx={10.4} cy={11 + bodyBob + frontArmSwing} r={0.7} fill={GLOVE_GREEN} stroke={OUTLINE} strokeWidth={0.2} />

      {/* 头部 */}
      <ellipse
        cx={8.5}
        cy={5 + bodyBob}
        rx={2.3}
        ry={2.6}
        fill={SKIN_BASE}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 脸部阴影 */}
      <path d={`M 7.5 ${3.5 + bodyBob} Q 7 ${5 + bodyBob} 7.5 ${6.5 + bodyBob}`} fill={SKIN_SHADOW} opacity={0.2} />

      {/* 头发侧面 */}
      <path
        d={`M 10.5 ${4 + bodyBob} Q 10.8 ${3 + bodyBob} 9.5 ${3 + bodyBob} L 9 ${3.5 + bodyBob} Q 10 ${3.8 + bodyBob} 10.2 ${4.5 + bodyBob} Z`}
        fill={HAIR_BLACK}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 9.5 ${3.8 + bodyBob} L 10 ${5 + bodyBob} L 9.5 ${4.5 + bodyBob} Z`}
        fill={HAIR_BLACK}
      />

      {/* 帽子侧面 */}
      <ellipse
        cx={9}
        cy={3 + bodyBob}
        rx={2.5}
        ry={1.5}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      <path
        d={`M 11.5 ${3 + bodyBob} Q 9 ${1.2 + bodyBob} 7 ${2.5 + bodyBob} L 7.5 ${3 + bodyBob} Q 9 ${2 + bodyBob} 11 ${3.2 + bodyBob} Z`}
        fill={HAT_RED}
        stroke={OUTLINE}
        strokeWidth={0.2}
      />
      {/* 帽檐 */}
      <ellipse cx={10.5} cy={4 + bodyBob} rx={1.5} ry={0.6} fill={HAT_RED} stroke={OUTLINE} strokeWidth={0.2} />
      <ellipse cx={10.5} cy={3.8 + bodyBob} rx={1.2} ry={0.4} fill={HAT_WHITE} />

      {/* 帽子标志侧面 */}
      <circle cx={9.5} cy={2.8 + bodyBob} r={0.6} fill={HAT_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={9.5} cy={2.8 + bodyBob} r={0.4} fill={HAT_GREEN} />

      {/* 眼睛（侧面只看到一只） */}
      <ellipse cx={9.5} cy={5 + bodyBob} rx={0.7} ry={0.8} fill={EYE_WHITE} stroke={OUTLINE} strokeWidth={0.15} />
      <circle cx={9.7} cy={5.2 + bodyBob} r={0.35} fill={EYE_PUPIL} />
      <circle cx={9.6} cy={4.9 + bodyBob} r={0.15} fill={EYE_WHITE} />

      {/* 鼻子 */}
      <circle cx={10.5} cy={5.5 + bodyBob} r={0.3} fill={SKIN_SHADOW} />

      {/* 嘴巴 */}
      <path
        d={`M 10.5 ${6 + bodyBob} Q 10 ${6.3 + bodyBob} 9.5 ${6.2 + bodyBob}`}
        stroke={OUTLINE}
        strokeWidth={0.2}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
