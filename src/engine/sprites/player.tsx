// ============================================================
// 玩家角色 SVG 精灵 - 像素风训练师（类似小智/Red）
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

/**
 * 获取玩家精灵 SVG。
 *
 * @param direction - 面朝方向
 * @param frame - 动画帧（0=静止, 1=左脚, 2=右脚）
 * @param size - 像素大小（等于 tileSize）
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

// 颜色常量
const HAT = '#D83030'; // 红色帽子
const HAT_DARK = '#B02020';
const HAIR = '#301818'; // 深色头发
const SKIN = '#F8C890'; // 肤色
const SKIN_SHADOW = '#E0A868';
const SHIRT = '#3060B8'; // 蓝色上衣
const SHIRT_DARK = '#2048A0';
const PANTS = '#484848'; // 深色裤子
const PANTS_DARK = '#383838';
const SHOES = '#C83030'; // 红色鞋子
const EYE = '#202020';
const WHITE = '#F8F8F8';

/** 向下（正面） */
function renderDown(frame: number, size: number): JSX.Element {
  // 走路时左右脚的偏移
  const leftLegDy = frame === 1 ? 1 : 0;
  const rightLegDy = frame === 2 ? 1 : 0;
  const bodyBob = frame !== 0 ? -0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子 */}
      <rect x="4" y={1 + bodyBob} width="8" height="3" fill={HAT} rx="1" />
      <rect x="3" y={3 + bodyBob} width="10" height="1.5" fill={HAT} rx="0.5" />
      <rect x="4" y={1 + bodyBob} width="3" height="1.5" fill={HAT_DARK} rx="0.5" />
      {/* 帽檐上白色半球标志 */}
      <circle cx="8" cy={3 + bodyBob} r="1" fill={WHITE} />

      {/* 头发（帽子下方两侧） */}
      <rect x="4" y={4 + bodyBob} width="1.5" height="2" fill={HAIR} />
      <rect x="10.5" y={4 + bodyBob} width="1.5" height="2" fill={HAIR} />

      {/* 脸 */}
      <rect x="5" y={4 + bodyBob} width="6" height="4" fill={SKIN} rx="0.5" />
      <rect x="5" y={7 + bodyBob} width="6" height="1" fill={SKIN_SHADOW} rx="0.3" />

      {/* 眼睛 */}
      <rect x="6" y={5.5 + bodyBob} width="1.2" height="1.2" fill={EYE} rx="0.3" />
      <rect x="8.8" y={5.5 + bodyBob} width="1.2" height="1.2" fill={EYE} rx="0.3" />
      {/* 眼睛高光 */}
      <rect x="6.6" y={5.5 + bodyBob} width="0.5" height="0.5" fill={WHITE} rx="0.2" />
      <rect x="9.4" y={5.5 + bodyBob} width="0.5" height="0.5" fill={WHITE} rx="0.2" />

      {/* 上衣 */}
      <rect x="4" y={8 + bodyBob} width="8" height="3.5" fill={SHIRT} rx="0.5" />
      {/* 衣服中线 */}
      <line x1="8" y1={8 + bodyBob} x2="8" y2={11.5 + bodyBob} stroke={SHIRT_DARK} strokeWidth="0.5" />
      {/* 领口 */}
      <rect x="6.5" y={8 + bodyBob} width="3" height="1" fill={SHIRT_DARK} rx="0.3" />

      {/* 手臂 */}
      <rect x="3" y={8.5 + bodyBob} width="1.5" height="3" fill={SHIRT} rx="0.5" />
      <rect x="11.5" y={8.5 + bodyBob} width="1.5" height="3" fill={SHIRT} rx="0.5" />
      {/* 手 */}
      <rect x="3" y={11 + bodyBob} width="1.5" height="1" fill={SKIN} rx="0.3" />
      <rect x="11.5" y={11 + bodyBob} width="1.5" height="1" fill={SKIN} rx="0.3" />

      {/* 裤子 */}
      <rect x="4.5" y={11.5 + bodyBob} width="3" height={2.5 + leftLegDy} fill={PANTS} rx="0.3" />
      <rect x="8.5" y={11.5 + bodyBob} width="3" height={2.5 + rightLegDy} fill={PANTS} rx="0.3" />
      {/* 裤子暗部 */}
      <rect x="5" y={13 + bodyBob} width="2" height={1 + leftLegDy} fill={PANTS_DARK} rx="0.2" />
      <rect x="9" y={13 + bodyBob} width="2" height={1 + rightLegDy} fill={PANTS_DARK} rx="0.2" />

      {/* 鞋子 */}
      <rect x="4" y={14 + leftLegDy} width="3.5" height="2" fill={SHOES} rx="0.5" />
      <rect x="8.5" y={14 + rightLegDy} width="3.5" height="2" fill={SHOES} rx="0.5" />
    </svg>
  );
}

/** 向上（背面） */
function renderUp(frame: number, size: number): JSX.Element {
  const leftLegDy = frame === 1 ? 1 : 0;
  const rightLegDy = frame === 2 ? 1 : 0;
  const bodyBob = frame !== 0 ? -0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子 */}
      <rect x="4" y={1 + bodyBob} width="8" height="3" fill={HAT} rx="1" />
      <rect x="5" y={0.5 + bodyBob} width="6" height="2" fill={HAT_DARK} rx="0.5" />
      {/* 帽子背面调节带 */}
      <rect x="7" y={3.5 + bodyBob} width="2" height="1" fill={HAT_DARK} rx="0.3" />

      {/* 头发（背面） */}
      <rect x="4" y={3.5 + bodyBob} width="8" height="3" fill={HAIR} rx="0.5" />

      {/* 耳朵（侧面可见） */}
      <rect x="3.5" y={4.5 + bodyBob} width="1" height="1.5" fill={SKIN} rx="0.3" />
      <rect x="11.5" y={4.5 + bodyBob} width="1" height="1.5" fill={SKIN} rx="0.3" />

      {/* 脖子 */}
      <rect x="6.5" y={7 + bodyBob} width="3" height="1.5" fill={SKIN} rx="0.3" />

      {/* 上衣 */}
      <rect x="4" y={8 + bodyBob} width="8" height="3.5" fill={SHIRT} rx="0.5" />
      {/* 背面领口 */}
      <rect x="6" y={8 + bodyBob} width="4" height="1" fill={SHIRT_DARK} rx="0.3" />
      {/* 背包暗示 */}
      <rect x="5" y={9 + bodyBob} width="6" height="2" fill={SHIRT_DARK} rx="0.3" opacity="0.4" />

      {/* 手臂 */}
      <rect x="3" y={8.5 + bodyBob} width="1.5" height="3" fill={SHIRT} rx="0.5" />
      <rect x="11.5" y={8.5 + bodyBob} width="1.5" height="3" fill={SHIRT} rx="0.5" />
      <rect x="3" y={11 + bodyBob} width="1.5" height="1" fill={SKIN} rx="0.3" />
      <rect x="11.5" y={11 + bodyBob} width="1.5" height="1" fill={SKIN} rx="0.3" />

      {/* 裤子 */}
      <rect x="4.5" y={11.5 + bodyBob} width="3" height={2.5 + leftLegDy} fill={PANTS} rx="0.3" />
      <rect x="8.5" y={11.5 + bodyBob} width="3" height={2.5 + rightLegDy} fill={PANTS} rx="0.3" />

      {/* 鞋子 */}
      <rect x="4" y={14 + leftLegDy} width="3.5" height="2" fill={SHOES} rx="0.5" />
      <rect x="8.5" y={14 + rightLegDy} width="3.5" height="2" fill={SHOES} rx="0.5" />
    </svg>
  );
}

/** 向左 */
function renderLeft(frame: number, size: number): JSX.Element {
  const legForward = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  const bodyBob = frame !== 0 ? -0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子 */}
      <rect x="3" y={1 + bodyBob} width="8" height="3" fill={HAT} rx="1" />
      {/* 帽檐朝左 */}
      <rect x="1" y={3 + bodyBob} width="7" height="1.5" fill={HAT} rx="0.5" />
      <rect x="1" y={3 + bodyBob} width="4" height="1.5" fill={HAT_DARK} rx="0.5" />

      {/* 头发 */}
      <rect x="9" y={3.5 + bodyBob} width="2" height="3" fill={HAIR} rx="0.3" />

      {/* 脸（侧面） */}
      <rect x="4" y={4 + bodyBob} width="5.5" height="4" fill={SKIN} rx="0.5" />
      <rect x="4" y={7 + bodyBob} width="5.5" height="1" fill={SKIN_SHADOW} rx="0.3" />

      {/* 眼睛（左侧一只） */}
      <rect x="5" y={5.5 + bodyBob} width="1.2" height="1.2" fill={EYE} rx="0.3" />
      <rect x="5" y={5.5 + bodyBob} width="0.5" height="0.5" fill={WHITE} rx="0.2" />

      {/* 上衣（侧面较窄） */}
      <rect x="5" y={8 + bodyBob} width="6" height="3.5" fill={SHIRT} rx="0.5" />
      <rect x="5" y={8 + bodyBob} width="2" height="1" fill={SHIRT_DARK} rx="0.3" />

      {/* 手臂（朝左伸出） */}
      <rect x="3.5" y={8.5 + bodyBob} width="2" height="2.5" fill={SHIRT} rx="0.5" />
      <rect x="3" y={10.5 + bodyBob} width="1.5" height="1.2" fill={SKIN} rx="0.3" />

      {/* 裤子 */}
      <rect x="5.5" y={11.5 + bodyBob} width="5" height="2.5" fill={PANTS} rx="0.3" />

      {/* 腿和脚（走路动画） */}
      <rect x={5.5 + legForward} y={13.5 + bodyBob} width="2.5" height="2.5" fill={PANTS} rx="0.3" />
      <rect x={8 - legForward * 0.5} y={13.5 + bodyBob} width="2.5" height="2.5" fill={PANTS_DARK} rx="0.3" />
      <rect x={5 + legForward} y={15} width="3" height="1" fill={SHOES} rx="0.5" />
      <rect x={8 - legForward * 0.5} y={15} width="3" height="1" fill={SHOES} rx="0.5" />
    </svg>
  );
}

/** 向右 */
function renderRight(frame: number, size: number): JSX.Element {
  const legForward = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const bodyBob = frame !== 0 ? -0.3 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子 */}
      <rect x="5" y={1 + bodyBob} width="8" height="3" fill={HAT} rx="1" />
      {/* 帽檐朝右 */}
      <rect x="8" y={3 + bodyBob} width="7" height="1.5" fill={HAT} rx="0.5" />
      <rect x="11" y={3 + bodyBob} width="4" height="1.5" fill={HAT_DARK} rx="0.5" />

      {/* 头发 */}
      <rect x="5" y={3.5 + bodyBob} width="2" height="3" fill={HAIR} rx="0.3" />

      {/* 脸（侧面） */}
      <rect x="6.5" y={4 + bodyBob} width="5.5" height="4" fill={SKIN} rx="0.5" />
      <rect x="6.5" y={7 + bodyBob} width="5.5" height="1" fill={SKIN_SHADOW} rx="0.3" />

      {/* 眼睛（右侧一只） */}
      <rect x="9.8" y={5.5 + bodyBob} width="1.2" height="1.2" fill={EYE} rx="0.3" />
      <rect x="10.4" y={5.5 + bodyBob} width="0.5" height="0.5" fill={WHITE} rx="0.2" />

      {/* 上衣（侧面较窄） */}
      <rect x="5" y={8 + bodyBob} width="6" height="3.5" fill={SHIRT} rx="0.5" />
      <rect x="9" y={8 + bodyBob} width="2" height="1" fill={SHIRT_DARK} rx="0.3" />

      {/* 手臂（朝右伸出） */}
      <rect x="10.5" y={8.5 + bodyBob} width="2" height="2.5" fill={SHIRT} rx="0.5" />
      <rect x="11.5" y={10.5 + bodyBob} width="1.5" height="1.2" fill={SKIN} rx="0.3" />

      {/* 裤子 */}
      <rect x="5.5" y={11.5 + bodyBob} width="5" height="2.5" fill={PANTS} rx="0.3" />

      {/* 腿和脚（走路动画） */}
      <rect x={5.5 + legForward * 0.5} y={13.5 + bodyBob} width="2.5" height="2.5" fill={PANTS_DARK} rx="0.3" />
      <rect x={8 + legForward} y={13.5 + bodyBob} width="2.5" height="2.5" fill={PANTS} rx="0.3" />
      <rect x={5 + legForward * 0.5} y={15} width="3" height="1" fill={SHOES} rx="0.5" />
      <rect x={8 + legForward} y={15} width="3" height="1" fill={SHOES} rx="0.5" />
    </svg>
  );
}
