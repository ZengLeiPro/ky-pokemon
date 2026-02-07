// ============================================================
// 玩家角色 SVG - 可爱 Q 版训练师 (DS 风格) - 方案 4
// 特点：超大头身比、圆润造型、水汪汪大眼、柔和配色
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

// 柔和暖色调调色板
const C = {
  OL: '#2D1B30',        // 紫褐色轮廓（比纯黑更柔和）
  SKIN: '#FFE0C0',      // 暖肤色
  SKIN_S: '#F0C098',    // 肤色阴影
  HAT: '#EF4444',       // 明亮红
  HAT_D: '#DC2626',     // 帽子暗部
  HAT_W: '#FFFFFF',     // 白色
  HAIR: '#2D1B30',      // 深紫褐发色
  JKT: '#3B82F6',       // 明亮蓝
  JKT_D: '#2563EB',     // 蓝暗部
  JKT_W: '#DBEAFE',     // 浅蓝白
  PANT: '#3F3F46',      // 中性深灰
  SHOE: '#EF4444',      // 红鞋
  EYE_BG: '#1E1028',    // 眼睛深色
  EYE_IRIS: '#4A2810',  // 虹膜棕
  EYE_HI: '#FFFFFF',    // 高光
  BLUSH: '#FCA5A5',     // 粉色腮红
  MOUTH: '#D4845A',     // 嘴巴
};

const OW = 0.45; // 轮廓线宽（略粗更 Q）

/** 正面 (Down) */
function renderDown(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? -0.3 : 0;
  const lLeg = frame === 1 ? 0.7 : 0;
  const rLeg = frame === 2 ? 0.7 : 0;
  // 走路时轻微左右摇摆
  const sway = frame === 1 ? -0.2 : frame === 2 ? 0.2 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地面阴影 */}
      <ellipse cx="8" cy="15.5" rx="4" ry="0.8" fill="rgba(0,0,0,0.12)" />

      <g transform={`translate(${sway},${bob})`}>
        {/* === 鞋子 === */}
        <ellipse cx="6" cy={15 + lLeg} rx="1.8" ry="1" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        <ellipse cx="10" cy={15 + rLeg} rx="1.8" ry="1" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />

        {/* === 腿 === */}
        <rect x="5" y="12" width="2" height={3 + lLeg} rx="0.8" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
        <rect x="9" y="12" width="2" height={3 + rLeg} rx="0.8" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />

        {/* === 身体 === */}
        <path
          d="M5,9 Q5,8.5 6,8.5 L10,8.5 Q11,8.5 11,9 L11,12.5 Q11,13 10,13 L6,13 Q5,13 5,12.5 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* T恤内衬 */}
        <path d="M7.2,8.5 L8,9.8 L8.8,8.5" fill={C.JKT_W} />
        {/* 夹克拉链 */}
        <line x1="8" y1="9.8" x2="8" y2="13" stroke={C.JKT_D} strokeWidth="0.35" />
        {/* 夹克下摆分线 */}
        <path d="M5.5,11.5 Q8,12 10.5,11.5" fill="none" stroke={C.JKT_D} strokeWidth="0.3" />

        {/* === 手臂 === */}
        <path
          d="M4.8,9 Q3.5,9 3.2,10 L3,11.5 Q3,12 3.5,12 L4.5,12 Q5,12 5,11.5 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        <path
          d="M11.2,9 Q12.5,9 12.8,10 L13,11.5 Q13,12 12.5,12 L11.5,12 Q11,12 11,11.5 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 手 */}
        <circle cx="3.8" cy="12" r="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
        <circle cx="12.2" cy="12" r="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />

        {/* === 头部 - 超大圆脸 === */}
        <ellipse cx="8" cy="5" rx="4.2" ry="3.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW} />

        {/* 头发刘海（锯齿状） */}
        <path
          d="M4.2,3.5 L5.2,4.8 L6,3.2 L7,4.5 L8,3 L9,4.5 L10,3.2 L10.8,4.8 L11.8,3.5"
          fill={C.HAIR} stroke={C.HAIR} strokeWidth="0.6" strokeLinejoin="round"
        />
        {/* 头发两侧 */}
        <path d="M3.8,3.5 Q3.5,4 3.5,5 L3.8,6.5 Q4,7 4.5,6.5 L4.5,4.5 Z" fill={C.HAIR} />
        <path d="M12.2,3.5 Q12.5,4 12.5,5 L12.2,6.5 Q12,7 11.5,6.5 L11.5,4.5 Z" fill={C.HAIR} />

        {/* === 眼睛 - 大而圆 水汪汪 === */}
        {/* 左眼 */}
        <ellipse cx="6.2" cy="5.5" rx="1" ry="1.2" fill={C.EYE_BG} />
        <ellipse cx="6.2" cy="5.7" rx="0.7" ry="0.8" fill={C.EYE_IRIS} />
        <circle cx="6.5" cy="5" r="0.45" fill={C.EYE_HI} />
        <circle cx="5.9" cy="5.9" r="0.2" fill={C.EYE_HI} opacity="0.7" />
        {/* 右眼 */}
        <ellipse cx="9.8" cy="5.5" rx="1" ry="1.2" fill={C.EYE_BG} />
        <ellipse cx="9.8" cy="5.7" rx="0.7" ry="0.8" fill={C.EYE_IRIS} />
        <circle cx="10.1" cy="5" r="0.45" fill={C.EYE_HI} />
        <circle cx="9.5" cy="5.9" r="0.2" fill={C.EYE_HI} opacity="0.7" />

        {/* 腮红 */}
        <ellipse cx="4.8" cy="6.8" rx="0.8" ry="0.4" fill={C.BLUSH} opacity="0.5" />
        <ellipse cx="11.2" cy="6.8" rx="0.8" ry="0.4" fill={C.BLUSH} opacity="0.5" />

        {/* 嘴巴 - 微笑 */}
        <path d="M7.3,7.3 Q8,7.8 8.7,7.3" fill="none" stroke={C.MOUTH} strokeWidth="0.35" strokeLinecap="round" />

        {/* === 帽子 === */}
        {/* 帽顶 - 圆润 */}
        <path
          d="M3.8,3.5 Q3.2,2 4.5,0.8 Q6,-0.2 8,0 Q10,-0.2 11.5,0.8 Q12.8,2 12.2,3.5 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽子光泽 */}
        <path
          d="M6,1.2 Q8,0.5 10,1.2 Q9,0.8 8,0.8 Q7,0.8 6,1.2 Z"
          fill="rgba(255,255,255,0.25)"
        />
        {/* 帽檐 */}
        <path
          d="M3,3.5 L13,3.5 Q13.5,3.5 13.5,4 Q13.5,4.8 13,4.8 L3,4.8 Q2.5,4.8 2.5,4 Q2.5,3.5 3,3.5 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        <rect x="3" y="4.2" width="10" height="0.6" fill={C.HAT_D} rx="0.2" />

        {/* 精灵球标志 */}
        <circle cx="8" cy="2" r="1.3" fill={C.HAT_W} />
        <line x1="6.7" y1="2" x2="9.3" y2="2" stroke={C.HAT} strokeWidth="0.5" />
        <circle cx="8" cy="2" r="0.4" fill={C.HAT} />
        <circle cx="8" cy="2" r="0.2" fill={C.HAT_W} />
      </g>
    </svg>
  );
}

/** 背面 (Up) */
function renderUp(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? -0.3 : 0;
  const lLeg = frame === 1 ? 0.7 : 0;
  const rLeg = frame === 2 ? 0.7 : 0;
  const sway = frame === 1 ? -0.2 : frame === 2 ? 0.2 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <ellipse cx="8" cy="15.5" rx="4" ry="0.8" fill="rgba(0,0,0,0.12)" />

      <g transform={`translate(${sway},${bob})`}>
        {/* 鞋子 */}
        <ellipse cx="6" cy={15 + lLeg} rx="1.5" ry="0.8" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        <ellipse cx="10" cy={15 + rLeg} rx="1.5" ry="0.8" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />

        {/* 腿 */}
        <rect x="5" y="12" width="2" height={3 + lLeg} rx="0.8" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
        <rect x="9" y="12" width="2" height={3 + rLeg} rx="0.8" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />

        {/* 身体 */}
        <path
          d="M5,9 Q5,8.5 6,8.5 L10,8.5 Q11,8.5 11,9 L11,12.5 Q11,13 10,13 L6,13 Q5,13 5,12.5 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />

        {/* 背包 */}
        <rect x="5.8" y="9.5" width="4.4" height="3" rx="1.2" fill="#8B5E3C" stroke={C.OL} strokeWidth={OW} />
        <rect x="6.3" y="10" width="3.4" height="1" rx="0.4" fill="#6D4C30" />
        <circle cx="8" cy="11.8" r="0.4" fill="#A0855C" />
        {/* 背包带 */}
        <line x1="6" y1="9" x2="6" y2="9.5" stroke="#8B5E3C" strokeWidth="0.8" />
        <line x1="10" y1="9" x2="10" y2="9.5" stroke="#8B5E3C" strokeWidth="0.8" />

        {/* 手臂 */}
        <rect x="3.2" y="9" width="2" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
        <rect x="10.8" y="9" width="2" height="3" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />

        {/* 头部后方 */}
        <ellipse cx="8" cy="5" rx="4.2" ry="3.8" fill={C.HAIR} stroke={C.OL} strokeWidth={OW} />
        {/* 头发纹理 */}
        <path d="M5,3 Q6,5 5.5,7" fill="none" stroke="#221525" strokeWidth="0.3" opacity="0.4" />
        <path d="M7,2 Q8,4.5 7,7" fill="none" stroke="#221525" strokeWidth="0.3" opacity="0.4" />
        <path d="M11,3 Q10,5 10.5,7" fill="none" stroke="#221525" strokeWidth="0.3" opacity="0.4" />
        {/* 头发翘起 */}
        <path d="M10,2 Q11,1 11.5,2" fill={C.HAIR} stroke={C.OL} strokeWidth="0.3" />

        {/* 帽子 */}
        <path
          d="M3.8,3.5 Q3.2,2 4.5,0.8 Q6,-0.2 8,0 Q10,-0.2 11.5,0.8 Q12.8,2 12.2,3.5 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽子后调节环 */}
        <path d="M7,3.5 Q8,4.5 9,3.5" fill="none" stroke={C.HAT_D} strokeWidth="0.6" />

        {/* 耳朵 */}
        <ellipse cx="3.8" cy="5.2" rx="0.6" ry="0.7" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
        <ellipse cx="12.2" cy="5.2" rx="0.6" ry="0.7" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
      </g>
    </svg>
  );
}

/** 侧面共用内容 */
function renderSideContent(frame: number): JSX.Element {
  const bob = frame !== 0 ? -0.3 : 0;
  const frontLeg = frame === 1 ? -1.2 : frame === 2 ? 1.2 : 0;
  const backLeg = frame === 1 ? 0.8 : frame === 2 ? -0.8 : 0;
  const armSwing = frame === 1 ? 18 : frame === 2 ? -18 : 0;

  return (
    <>
      <ellipse cx="8" cy="15.5" rx="3.5" ry="0.8" fill="rgba(0,0,0,0.12)" />

      <g transform={`translate(0,${bob})`}>
        {/* === 远端腿 === */}
        <g transform={`translate(${backLeg * 0.5},0)`}>
          <rect x="7.5" y="12" width="2" height="3.5" rx="0.8" fill="#333" stroke={C.OL} strokeWidth={OW} />
          <ellipse cx="8.5" cy="15.2" rx="1.3" ry="0.8" fill="#CC3333" stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 远端手臂 === */}
        <g transform={`rotate(${-armSwing}, 9, 9)`}>
          <rect x="8.5" y="9" width="1.8" height="3" rx="0.8" fill={C.JKT_D} stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 身体 === */}
        <path
          d="M5.5,9 Q5.5,8.5 6.5,8.5 L10,8.5 Q10.5,8.5 10.5,9 L10.5,12.5 Q10.5,13 10,13 L6.5,13 Q5.5,13 5.5,12.5 Z"
          fill={C.JKT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 白色竖纹 */}
        <rect x="6" y="8.5" width="0.5" height="4.5" fill={C.JKT_W} opacity="0.6" />
        {/* 背包侧面 */}
        <path d="M10.5,9.5 Q11.5,10 11.5,11 L11.5,12 L10.5,12.5" fill="#8B5E3C" stroke={C.OL} strokeWidth={OW * 0.7} />

        {/* === 头部 - 超大圆形 === */}
        <ellipse cx="7.5" cy="5" rx="4" ry="3.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW} />

        {/* 耳朵 */}
        <ellipse cx="11" cy="5" rx="0.7" ry="0.8" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
        {/* 内耳 */}
        <ellipse cx="11" cy="5" rx="0.35" ry="0.45" fill={C.SKIN_S} />

        {/* 头发后部 */}
        <path d="M10,3 Q11.5,3.5 11.8,5.5 L11.5,7.5 Q11,8 10.5,7 L10.5,4 Z" fill={C.HAIR} />
        {/* 头发翘 */}
        <path d="M11,3 Q12,2 12.5,3" fill={C.HAIR} stroke={C.OL} strokeWidth="0.3" />

        {/* 刘海 */}
        <path
          d="M4,4 L5.5,5 L6.5,3.5 L7.5,5 L8.5,3.5 L9.5,4.5 L10.5,3"
          fill={C.HAIR} stroke={C.HAIR} strokeWidth="0.5" strokeLinejoin="round"
        />

        {/* 眼睛 - 侧面大眼 */}
        <ellipse cx="6" cy="5.3" rx="1" ry="1.2" fill={C.EYE_BG} />
        <ellipse cx="5.8" cy="5.5" rx="0.65" ry="0.8" fill={C.EYE_IRIS} />
        <circle cx="6.2" cy="4.8" r="0.4" fill={C.EYE_HI} />
        <circle cx="5.6" cy="5.7" r="0.18" fill={C.EYE_HI} opacity="0.6" />

        {/* 腮红 */}
        <ellipse cx="4.5" cy="6.5" rx="0.7" ry="0.35" fill={C.BLUSH} opacity="0.45" />

        {/* 嘴巴 */}
        <path d="M6.5,7 Q7,7.4 7.5,7" fill="none" stroke={C.MOUTH} strokeWidth="0.3" strokeLinecap="round" />

        {/* 鼻子小点 */}
        <circle cx="5" cy="6" r="0.15" fill={C.SKIN_S} />

        {/* === 帽子 === */}
        <path
          d="M3.8,3.5 Q3,2 4.2,0.8 Q5.5,-0.2 7.5,0 Q9.5,0.2 10.5,1.2 Q11.5,2.5 11,3.5 Z"
          fill={C.HAT} stroke={C.OL} strokeWidth={OW}
        />
        {/* 帽檐 */}
        <path
          d="M3.8,3.5 L1.8,4.5 Q1.5,4.8 2,5 L4,4.8"
          fill={C.HAT_D} stroke={C.OL} strokeWidth={OW}
        />
        {/* 精灵球标志 */}
        <circle cx="7.5" cy="1.8" r="1" fill={C.HAT_W} />
        <line x1="6.5" y1="1.8" x2="8.5" y2="1.8" stroke={C.HAT} strokeWidth="0.4" />
        <circle cx="7.5" cy="1.8" r="0.3" fill={C.HAT} />

        {/* === 近端腿 === */}
        <g transform={`translate(${frontLeg * 0.5},0)`}>
          <rect x="6" y="12" width="2.2" height="3.5" rx="0.8" fill={C.PANT} stroke={C.OL} strokeWidth={OW} />
          <ellipse cx="7.1" cy="15.2" rx="1.5" ry="0.8" fill={C.SHOE} stroke={C.OL} strokeWidth={OW} />
        </g>

        {/* === 近端手臂 === */}
        <g transform={`rotate(${armSwing}, 7, 9)`}>
          <rect x="5.5" y="9" width="2" height="3.2" rx="0.8" fill={C.JKT} stroke={C.OL} strokeWidth={OW} />
          <circle cx="6.5" cy="12" r="0.7" fill={C.SKIN} stroke={C.OL} strokeWidth={OW * 0.7} />
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
