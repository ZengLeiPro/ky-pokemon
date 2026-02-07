// ============================================================
// 玩家角色 SVG - 经典像素风训练师 (GBA 风格) - 方案 3
// 特点：大头比例、清晰轮廓、明亮大眼、经典红蓝配色
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

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

// 经典 GBA 调色板 - 鲜明饱和的颜色
const C = {
  OL: '#1a1020',        // 深色轮廓
  SKIN: '#FFD8A8',      // 肤色
  SKIN_S: '#E8B878',    // 肤色阴影
  HAT: '#E53935',       // 帽子红
  HAT_D: '#C62828',     // 帽子暗红
  HAT_W: '#FAFAFA',     // 帽子白色标志
  HAIR: '#1C1C2C',      // 深色头发
  JKT: '#1E88E5',       // 夹克蓝
  JKT_D: '#1565C0',     // 夹克暗蓝
  JKT_W: '#E3F2FD',     // 夹克白色装饰
  PANT: '#37474F',      // 裤子深灰蓝
  PANT_D: '#263238',    // 裤子暗部
  SHOE: '#D32F2F',      // 鞋子红
  EYE: '#1a1020',       // 眼睛
  EYE_HI: '#FFFFFF',    // 眼睛高光
  BLUSH: '#F48FB1',     // 腮红
};

const OW = 0.4; // 轮廓线宽

/** 正面 (Down) */
function renderDown(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? -0.4 : 0;
  const lLeg = frame === 1 ? 0.8 : 0;
  const rLeg = frame === 2 ? 0.8 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地面阴影 */}
      <ellipse cx="8" cy="15.5" rx="4.5" ry="1" fill="rgba(0,0,0,0.13)" />

      <g transform={`translate(0,${bob})`}>
        {/* === 鞋子 === */}
        <rect x="4.5" y={14 + lLeg} width="3" height="1.8" rx="0.8" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        <rect x="8.5" y={14 + rLeg} width="3" height="1.8" rx="0.8" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />

        {/* === 裤子 === */}
        <rect x="5" y="11.5" width="2.5" height={3 + lLeg} rx="0.5" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
        <rect x="8.5" y="11.5" width="2.5" height={3 + rLeg} rx="0.5" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />

        {/* === 身体/夹克 === */}
        <path
          d="M4.5,8.5 Q4.5,8 5.5,8 L10.5,8 Q11.5,8 11.5,8.5 L11.5,12 Q11.5,12.5 10.5,12.5 L5.5,12.5 Q4.5,12.5 4.5,12 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 白色领口V字 */}
        <path d="M7,8 L8,9.5 L9,8" fill={C.JKT_W} />
        {/* 拉链线 */}
        <line x1="8" y1="9.5" x2="8" y2="12.5" stroke={C.JKT_D} strokeWidth="0.4" />

        {/* === 手臂 === */}
        <rect x="3" y="8.5" width="1.8" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
        <rect x="11.2" y="8.5" width="1.8" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
        {/* 手 */}
        <rect x="3.2" y="11" width="1.4" height="1.2" rx="0.6" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.8} />
        <rect x="11.4" y="11" width="1.4" height="1.2" rx="0.6" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.8} />

        {/* === 头部 === */}
        {/* 脸 - 大而圆 */}
        <rect x="4.5" y="3.5" width="7" height="5" rx="2" fill={C.SKIN} stroke={C.OL} strokeWidth={OW} />

        {/* 头发鬓角 */}
        <path d="M4.2,4 Q4,4.5 4,6 L5,6 L5,4.2 Z" fill={C.HAIR} />
        <path d="M11.8,4 Q12,4.5 12,6 L11,6 L11,4.2 Z" fill={C.HAIR} />
        {/* 刘海 */}
        <path d="M5.5,3.8 L6.5,4.8 L7,3.5 L8,4.5 L9,3.5 L9.5,4.8 L10.5,3.8" fill={C.HAIR} stroke={C.HAIR} strokeWidth="0.5" strokeLinejoin="round" />

        {/* 眼睛 - 大而明亮 */}
        <ellipse cx="6.3" cy="6" rx="0.8" ry="1" fill={C.EYE} />
        <ellipse cx="9.7" cy="6" rx="0.8" ry="1" fill={C.EYE} />
        {/* 眼睛高光 */}
        <circle cx="6.6" cy="5.5" r="0.4" fill={C.EYE_HI} />
        <circle cx="10" cy="5.5" r="0.4" fill={C.EYE_HI} />
        {/* 小瞳孔反光 */}
        <circle cx="6" cy="6.3" r="0.2" fill={C.EYE_HI} opacity="0.6" />
        <circle cx="9.4" cy="6.3" r="0.2" fill={C.EYE_HI} opacity="0.6" />

        {/* 腮红 */}
        <ellipse cx="5.2" cy="7" rx="0.7" ry="0.4" fill={C.BLUSH} opacity="0.45" />
        <ellipse cx="10.8" cy="7" rx="0.7" ry="0.4" fill={C.BLUSH} opacity="0.45" />

        {/* 嘴巴 */}
        <path d="M7.5,7.5 Q8,7.8 8.5,7.5" fill="none" stroke={C.SKIN_S} strokeWidth="0.3" />

        {/* === 帽子 === */}
        {/* 帽顶 */}
        <path
          d="M4.5,4 Q4,2.5 5,1.2 Q6.5,0 8,0 Q9.5,0 11,1.2 Q12,2.5 11.5,4 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽子暗部 */}
        <path
          d="M5.5,2.5 Q6.5,1.5 8,1.5 Q9.5,1.5 10.5,2.5 L10.5,3.5 L5.5,3.5 Z"
          fill={C.HAT_D} opacity="0.3"
        />
        {/* 帽檐 */}
        <path
          d="M3.5,4 L12.5,4 Q13,4 13,4.5 Q13,5 12.5,5 L3.5,5 Q3,5 3,4.5 Q3,4 3.5,4 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 精灵球标志 */}
        <circle cx="8" cy="2.2" r="1.2" fill={C.HAT_W} />
        <line x1="6.8" y1="2.2" x2="9.2" y2="2.2" stroke={C.HAT} strokeWidth="0.5" />
        <circle cx="8" cy="2.2" r="0.35" fill={C.HAT} />
      </g>
    </svg>
  );
}

/** 背面 (Up) */
function renderUp(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? -0.4 : 0;
  const lLeg = frame === 1 ? 0.8 : 0;
  const rLeg = frame === 2 ? 0.8 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <ellipse cx="8" cy="15.5" rx="4.5" ry="1" fill="rgba(0,0,0,0.13)" />

      <g transform={`translate(0,${bob})`}>
        {/* 鞋子 */}
        <rect x="4.5" y={14 + lLeg} width="3" height="1.5" rx="0.6" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        <rect x="8.5" y={14 + rLeg} width="3" height="1.5" rx="0.6" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />

        {/* 裤子 */}
        <rect x="5" y="11.5" width="2.5" height={3 + lLeg} rx="0.5" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
        <rect x="8.5" y="11.5" width="2.5" height={3 + rLeg} rx="0.5" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />

        {/* 身体 */}
        <path
          d="M4.5,8.5 Q4.5,8 5.5,8 L10.5,8 Q11.5,8 11.5,8.5 L11.5,12 Q11.5,12.5 10.5,12.5 L5.5,12.5 Q4.5,12.5 4.5,12 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 背包 */}
        <rect x="5.5" y="9" width="5" height="3" rx="1" fill="#5D4037" stroke={C.OL} strokeWidth={OW} />
        <rect x="6" y="9.5" width="4" height="1" rx="0.3" fill="#4E342E" />
        {/* 背包扣 */}
        <rect x="7.5" y="11" width="1" height="0.8" rx="0.3" fill="#8D6E63" />

        {/* 手臂 */}
        <rect x="3" y="8.5" width="1.8" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
        <rect x="11.2" y="8.5" width="1.8" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />

        {/* 头部后方 - 头发 */}
        <path
          d="M4.5,4 Q4,2.5 5,1.2 Q6.5,0 8,0 Q9.5,0 11,1.2 Q12,2.5 11.5,4 L11.5,7 Q11,8 8,8 Q5,8 4.5,7 Z"
          fill={C.HAIR} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽子 */}
        <path
          d="M4.5,4 Q4,2.5 5,1.2 Q6.5,0 8,0 Q9.5,0 11,1.2 Q12,2.5 11.5,4 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽子后面的调节带 */}
        <path d="M7,4 L7,5 Q8,5.5 9,5 L9,4" fill={C.HAT_D} />

        {/* 耳朵 */}
        <ellipse cx="4.2" cy="5.5" rx="0.6" ry="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
        <ellipse cx="11.8" cy="5.5" rx="0.6" ry="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
      </g>
    </svg>
  );
}

/** 侧面共用内容 */
function renderSideContent(frame: number): JSX.Element {
  const bob = frame !== 0 ? -0.4 : 0;
  // 腿部动画
  const frontLeg = frame === 1 ? -1.2 : frame === 2 ? 1.2 : 0;
  const backLeg = frame === 1 ? 0.8 : frame === 2 ? -0.8 : 0;
  // 手臂摆动
  const armSwing = frame === 1 ? 15 : frame === 2 ? -15 : 0;

  return (
    <>
      <ellipse cx="8" cy="15.5" rx="4" ry="1" fill="rgba(0,0,0,0.13)" />

      <g transform={`translate(0,${bob})`}>
        {/* === 远端腿（较暗） === */}
        <g transform={`translate(${backLeg * 0.5},0)`}>
          <rect x="7" y="11.5" width="2.5" height="3.5" rx="0.5" fill={C.PANT_D} stroke={C.OL} strokeWidth={OW} />
          <rect x="7" y="14.2" width="2.5" height="1.5" rx="0.6" fill="#B71C1C" stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 近端腿 === */}
        <g transform={`translate(${frontLeg * 0.5},0)`}>
          <rect x="6.5" y="11.5" width="2.5" height="3.5" rx="0.5" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
          <rect x="6.5" y="14.2" width="2.8" height="1.5" rx="0.6" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 身体 === */}
        <path
          d="M5.5,8.5 Q5.5,8 6.5,8 L10,8 Q10.5,8 10.5,8.5 L10.5,12 Q10.5,12.5 10,12.5 L6.5,12.5 Q5.5,12.5 5.5,12 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 领口 */}
        <rect x="5.5" y="8" width="1.5" height="1" rx="0.3" fill={C.JKT_W} />
        {/* 背包侧面 */}
        <path d="M10.5,9 L11.5,9.5 L11.5,11.5 L10.5,12" fill="#5D4037" stroke={C.OL} strokeWidth={OW * 0.7} />

        {/* === 远端手臂 === */}
        <g transform={`rotate(${-armSwing}, 9, 8.5)`}>
          <rect x="8.5" y="8.5" width="1.8" height="3" rx="0.8" fill={C.JKT_D} stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 头部 === */}
        {/* 脸 */}
        <path
          d="M4.5,3.5 L10,3.5 Q11,3.5 11,4.5 L11,7 Q11,8.5 8,8.5 Q5,8.5 4,7 L4,4.5 Q4,3.5 4.5,3.5 Z"
          fill={C.SKIN} stroke={C.OL} strokeWidth={OW}
        />
        {/* 耳朵 */}
        <ellipse cx="11" cy="5.5" rx="0.7" ry="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />

        {/* 头发后部 */}
        <path d="M10,3.5 L11,4 L11.2,7 L10.5,7.5 L10,6 Z" fill={C.HAIR} />

        {/* 眼睛 */}
        <ellipse cx="6.5" cy="5.8" rx="0.7" ry="1" fill={C.EYE} />
        <circle cx="6.8" cy="5.3" r="0.35" fill={C.EYE_HI} />
        <circle cx="6.2" cy="6.1" r="0.15" fill={C.EYE_HI} opacity="0.6" />

        {/* 腮红 */}
        <ellipse cx="5" cy="7" rx="0.6" ry="0.35" fill={C.BLUSH} opacity="0.4" />

        {/* 嘴巴 */}
        <path d="M7,7.2 Q7.3,7.5 7.6,7.2" fill="none" stroke={C.SKIN_S} strokeWidth="0.3" />

        {/* 帽子 */}
        <path
          d="M4,4 Q3.5,2 5,0.8 Q6.5,-0.2 8,0 Q10,0.3 11,1.5 Q11.5,3 11,4 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽檐（朝左） */}
        <path
          d="M4,4 L2,4.8 Q1.5,5 2,5.2 L4.5,5"
          fill={C.HAT_D} stroke={C.OL} strokeWidth={OW}
        />
        {/* 精灵球标志 */}
        <circle cx="7.5" cy="2" r="1" fill={C.HAT_W} />
        <line x1="6.5" y1="2" x2="8.5" y2="2" stroke={C.HAT} strokeWidth="0.4" />
        <circle cx="7.5" cy="2" r="0.3" fill={C.HAT} />

        {/* === 近端手臂 === */}
        <g transform={`rotate(${armSwing}, 7, 8.5)`}>
          <rect x="5.5" y="8.5" width="2" height="3.2" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
          <ellipse cx="6.5" cy="11.5" rx="0.7" ry="0.6" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
        </g>
      </g>
    </>
  );
}

/** 向左 */
function renderLeft(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {renderSideContent(frame)}
    </svg>
  );
}

/** 向右（镜像左侧） */
function renderRight(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <g transform="scale(-1, 1) translate(-16, 0)">
        {renderSideContent(frame)}
      </g>
    </svg>
  );
}
