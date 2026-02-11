// ============================================================
// 玩家角色 SVG - 像素风训练师 (Redesigned)
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

// 调色板常量 - 方便统一调整风格
const C = {
  SKIN: '#FFDFC4',       // 皮肤 - 暖色调
  SKIN_SHADOW: '#E0B080', // 皮肤阴影
  HAIR: '#382820',       // 头发 - 深褐/近黑
  HAT_MAIN: '#E60012',   // 帽子 - 红
  HAT_SHADOW: '#B00000', // 帽子阴影
  HAT_WHITE: '#FFFFFF',  // 帽子前沿/Logo
  JACKET: '#0070B8',     // 外套 - 蓝
  JACKET_SHADOW: '#004080', // 外套阴影
  SHIRT: '#222222',      // 内衬/T恤 - 深色
  PANTS: '#263238',      // 裤子 - 深灰
  SHOES: '#D32F2F',      // 鞋子 - 红
  OUTLINE: '#1A1A1A',    // 轮廓线 - 近黑
  EYE: '#111111',        // 眼睛
  BACKPACK: '#8D6E63',   // 背包 (背面用)
};

/**
 * 获取玩家 SVG。
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

// 通用样式：描边设定，增强像素感
const strokeStyle = {
  stroke: C.OUTLINE,
  strokeWidth: 0.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// --- 渲染函数实现 ---

function renderDown(frame: number, size: number): JSX.Element {
  // 计算身体上下浮动 (Bobbing): 行走帧(1,2)时身体下降 0.5 像素
  const bobY = frame === 0 ? 0 : 0.5;
  
  // 腿部偏移：行走时模拟迈步
  // frame 1: 左脚前(视觉上不动或微动), 右脚后(缩短)
  // frame 2: 右脚前, 左脚后
  const leftLegH = frame === 2 ? 2 : 3;
  const rightLegH = frame === 1 ? 2 : 3;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <g transform={`translate(0, ${bobY})`}>
        {/* === 身体层 === */}
        {/* 左腿 */}
        <rect x="5" y="12" width="2.5" height={leftLegH} fill={C.PANTS} {...strokeStyle} />
        <rect x="5" y={12 + leftLegH - 0.5} width="2.5" height="1" rx="0.5" fill={C.SHOES} />
        
        {/* 右腿 */}
        <rect x="8.5" y="12" width="2.5" height={rightLegH} fill={C.PANTS} {...strokeStyle} />
        <rect x="8.5" y={12 + rightLegH - 0.5} width="2.5" height="1" rx="0.5" fill={C.SHOES} />

        {/* 躯干 (外套) - 使用 Path 画出衣领和开襟细节 */}
        <path 
          d="M 4.5 9 L 4.5 12.5 Q 8 13 11.5 12.5 L 11.5 9 L 10.5 8 L 5.5 8 Z" 
          fill={C.JACKET} 
          {...strokeStyle} 
        />
        {/* 内衬 T恤 */}
        <rect x="7" y="8.5" width="2" height="3" fill={C.SHIRT} />
        {/* 外套领口细节 */}
        <path d="M 5.5 8.5 L 7 11 L 9 11 L 10.5 8.5" fill="none" stroke={C.JACKET_SHADOW} strokeWidth="0.5" />

        {/* 手臂 (自然下垂，稍微向外) */}
        <path d="M 4.5 9 L 3.5 11 L 4 12" fill={C.SKIN} stroke={C.JACKET} strokeWidth="0.5" />
        <path d="M 11.5 9 L 12.5 11 L 12 12" fill={C.SKIN} stroke={C.JACKET} strokeWidth="0.5" />

        {/* === 头部层 (大头 Q版) === */}
        {/* 脸部轮廓 */}
        <path 
          d="M 4 5 L 4 8 Q 4 10 8 10 Q 12 10 12 8 L 12 5 Z" 
          fill={C.SKIN} 
          {...strokeStyle} 
        />
        
        {/* 头发 (刘海) */}
        <path 
          d="M 3.5 5 L 3.5 7 L 4.5 6 L 5.5 7.5 L 7 6 L 8 7 L 9.5 6 L 11 7.5 L 12.5 6 L 12.5 4 Z" 
          fill={C.HAIR} 
          {...strokeStyle} 
        />

        {/* 眼睛 (Q版大眼) */}
        <g fill={C.EYE}>
          <rect x="5.5" y="6.5" width="1.2" height="1.8" rx="0.5" />
          <rect x="9.3" y="6.5" width="1.2" height="1.8" rx="0.5" />
        </g>
        {/* 眼神高光 (让角色更有神) */}
        <g fill="#FFF">
          <circle cx="6.2" cy="6.8" r="0.3" />
          <circle cx="10.0" cy="6.8" r="0.3" />
        </g>
        {/* 腮红 (可爱感) */}
        <g fill="#FFaaaa" opacity="0.6">
          <circle cx="4.8" cy="8.2" r="0.5" />
          <circle cx="11.2" cy="8.2" r="0.5" />
        </g>

        {/* 帽子 */}
        {/* 帽顶 (圆弧) */}
        <path 
          d="M 3 5 Q 3 1.5 8 1.5 Q 13 1.5 13 5 L 12.5 6 L 3.5 6 Z" 
          fill={C.HAT_MAIN} 
          {...strokeStyle} 
        />
        {/* 帽子标志 (白色半圆) */}
        <path d="M 6.5 4.5 A 1.5 1.5 0 0 1 9.5 4.5" fill="none" stroke={C.HAT_WHITE} strokeWidth="1" />
        {/* 帽檐 */}
        <path d="M 3 5 L 13 5 L 13 6 Q 8 7 3 6 Z" fill={C.HAT_SHADOW} opacity="0.3" />
      </g>
    </svg>
  );
}

function renderUp(frame: number, size: number): JSX.Element {
  const bobY = frame === 0 ? 0 : 0.5;
  // 简单的腿部切换
  const leftLegH = frame === 1 ? 2 : 3;
  const rightLegH = frame === 2 ? 2 : 3;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <g transform={`translate(0, ${bobY})`}>
        {/* 腿 */}
        <rect x="5" y="12" width="2.5" height={leftLegH} fill={C.PANTS} {...strokeStyle} />
        <rect x="8.5" y="12" width="2.5" height={rightLegH} fill={C.PANTS} {...strokeStyle} />
        
        {/* 躯干 (背部) */}
        <rect x="4.5" y="8" width="7" height="4.5" rx="1" fill={C.JACKET} {...strokeStyle} />
        
        {/* 背包 */}
        <rect x="5.5" y="8.5" width="5" height="3.5" rx="0.5" fill={C.BACKPACK} stroke="#5D4037" strokeWidth="0.4" />
        {/* 背包带 */}
        <path d="M 5.5 8.5 L 4.5 9" stroke="#5D4037" strokeWidth="0.5" />
        <path d="M 10.5 8.5 L 11.5 9" stroke="#5D4037" strokeWidth="0.5" />

        {/* 头部 (后脑勺) */}
        <path 
          d="M 3.5 5 Q 3.5 1.5 8 1.5 Q 12.5 1.5 12.5 5 L 12.5 8 Q 12.5 9.5 8 9.5 Q 3.5 9.5 3.5 8 Z" 
          fill={C.HAIR} 
          {...strokeStyle} 
        />
        {/* 帽子反戴的效果/或仅仅是帽子顶部 */}
        <path 
          d="M 3 5 Q 3 1.5 8 1.5 Q 13 1.5 13 5 L 13 6 Q 8 5.5 3 6 Z" 
          fill={C.HAT_MAIN} 
          {...strokeStyle} 
        />
      </g>
    </svg>
  );
}

function renderLeft(frame: number, size: number): JSX.Element {
  // 侧面行走动画逻辑
  const bobY = frame === 0 ? 0 : 0.5;
  
  // 腿部摆动坐标 (X轴摆动)
  // frame 0: 并拢
  // frame 1: 左脚前(视觉左侧), 右脚后
  // frame 2: 右脚前, 左脚后
  let legL_X = 6.5, legR_X = 6.5;
  let legL_Y = 12, legR_Y = 12;
  
  if (frame === 1) { // 迈出左腿
    legL_X = 4.5; legL_Y = 11.5; // 前
    legR_X = 8.5; // 后
  } else if (frame === 2) { // 迈出右腿
    legL_X = 8.5; // 后
    legR_X = 4.5; legR_Y = 11.5; // 前
  }

  // 手臂摆动 (与腿相反)
  let armAngle = 0;
  if (frame === 1) armAngle = 20;
  if (frame === 2) armAngle = -20;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <g transform={`translate(0, ${bobY})`}>
        {/* 右腿 (内侧/后侧腿) */}
        <path 
          d={`M ${legR_X} 11 L ${legR_X} ${legR_Y+3} L ${legR_X+2} ${legR_Y+3} L ${legR_X+2} 11`} 
          fill={C.PANTS} 
          {...strokeStyle} 
        />
        
        {/* 左腿 (外侧/前侧腿) */}
        <path 
          d={`M ${legL_X} 11 L ${legL_X} ${legL_Y+3} L ${legL_X+2} ${legL_Y+3} L ${legL_X+2} 11`} 
          fill={C.PANTS} 
          {...strokeStyle} 
        />
        {/* 鞋子 */}
        <rect x={legL_X} y={legL_Y+2.5} width="2.5" height="1" fill={C.SHOES} />

        {/* 躯干 (侧面) */}
        <rect x="5.5" y="8" width="5" height="4" rx="0.5" fill={C.JACKET} {...strokeStyle} />
        
        {/* 头部 (侧面轮廓) */}
        <g transform="translate(1, 0)"> 
           {/* 脸 */}
           <path d="M 4 4 L 4 8 Q 4 10 9 10 L 9 5 Z" fill={C.SKIN} {...strokeStyle} />
           {/* 鼻子突起 */}
           <path d="M 3.5 7 L 4 7 L 4 8" fill={C.SKIN} stroke="none" /> 
           
           {/* 头发 */}
           <path d="M 5 4 L 5 6 L 4 7 L 5 7.5 L 9 9 L 10 9 L 10 4 Z" fill={C.HAIR} {...strokeStyle} />
           
           {/* 眼睛 (侧面只画一个) */}
           <rect x="4.2" y="6.5" width="1" height="1.8" fill={C.EYE} />
           
           {/* 帽子 */}
           <path 
             d="M 4 5 Q 4 1.5 9 1.5 L 10 1.5 L 10 6 L 2 6 Q 3 5.5 4 5" 
             fill={C.HAT_MAIN} 
             {...strokeStyle} 
           />
           <path d="M 2 6 L 5 6" stroke={C.HAT_WHITE} strokeWidth="1" /> {/* 帽檐白线 */}
        </g>

        {/* 手臂 (根据步态摆动) */}
        <g transform={`rotate(${armAngle}, 8, 9)`}>
           <rect x="6.5" y="8.5" width="2.5" height="3.5" rx="1" fill={C.JACKET} {...strokeStyle} />
           <circle cx="7.75" cy="12" r="1" fill={C.SKIN} />
        </g>
      </g>
    </svg>
  );
}

function renderRight(frame: number, size: number): JSX.Element {
  // 复用 Left 的逻辑，通过 SVG transform 镜像翻转
  // translate(16, 0) scale(-1, 1) 是标准的水平翻转技巧
  return (
    <g transform="translate(16, 0) scale(-1, 1)">
      {renderLeft(frame, size)}
    </g>
  );
}