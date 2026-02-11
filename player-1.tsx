// ============================================================
// 玩家角色 SVG  - 像素风训练师 (HGSS/BW 风格)
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

// 确保类型兼容，如果项目中没有定义 Direction，请取消下面的注释
// export type Direction = 'up' | 'down' | 'left' | 'right';

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
  // 根据方向选择渲染函数
  const renderers: Record<Direction, () => JSX.Element> = {
    down: () => renderDown(frame, size),
    up: () => renderUp(frame, size),
    left: () => renderLeft(frame, size),
    right: () => renderRight(frame, size), // 右侧通过镜像左侧实现
  };

  return renderers[direction]();
}

// ============================================================
// 🎨 调色板 (Palette)
// ============================================================
const C = {
  OUTLINE: '#2c3e50', // 深色轮廓，增强清晰度
  SKIN: '#f5cba7',    // 皮肤
  SKIN_SHADOW: '#e0b492', // 皮肤阴影
  HAT_MAIN: '#e74c3c', // 帽子红
  HAT_SHADE: '#c0392b', // 帽子暗部
  HAT_ACCENT: '#ffffff', // 帽子白条/标志
  HAIR: '#2d3436',    // 头发黑/深褐
  SHIRT: '#3498db',   // 外套蓝
  SHIRT_ACCENT: '#ecf0f1', // 领口/内衬白
  PANTS: '#34495e',   // 裤子深灰蓝
  SHOES: '#e74c3c',   // 鞋子红
  BACKPACK: '#f1c40f', // 背包黄
};

// ============================================================
// 🛠️ 辅助函数
// ============================================================

/**
 * 计算行走的上下浮动 (Bobbing)
 * 行走帧 (1, 2) 时身体上移 0.5 像素，模拟颠簸感
 */
const getBobY = (frame: number) => (frame !== 0 ? -0.5 : 0);

// ============================================================
// 🖌️ 渲染函数实现
// ============================================================

/**
 * 渲染正面 (Down)
 */
function renderDown(frame: number, size: number): JSX.Element {
  const bob = getBobY(frame);
  
  // 腿部偏移：模拟简单的上下踩踏
  // frame 1: 左脚低右脚高, frame 2: 右脚低左脚高
  const leftLegY = frame === 1 ? 1 : 0;
  const rightLegY = frame === 2 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      {/* 阴影 (脚底) */}
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill="rgba(0,0,0,0.2)" />

      {/* === 身体组 (应用上下浮动) === */}
      <g transform={`translate(0, ${bob})`}>
        
        {/* 左腿 */}
        <rect x="5.5" y={11 + leftLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="5.5" y={13.5 + leftLegY} width="2" height="1.5" fill={C.SHOES} />

        {/* 右腿 */}
        <rect x="8.5" y={11 + rightLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="8.5" y={13.5 + rightLegY} width="2" height="1.5" fill={C.SHOES} />

        {/* 躯干 (外套) */}
        {/* 使用 Path 绘制稍有弧度的身体，避免纯方块 */}
        <path 
          d="M 5,8 L 11,8 L 11,11.5 Q 11,12.5 10,12.5 L 6,12.5 Q 5,12.5 5,11.5 Z" 
          fill={C.SHIRT} 
        />
        {/* 领口/拉链细节 */}
        <rect x="7.5" y="8" width="1" height="4.5" fill={C.SHIRT_ACCENT} />

        {/* 头部 (稍微大一点，显得可爱) */}
        <g transform="translate(0, -0.5)">
          {/* 脸部轮廓 */}
          <rect x="4" y="3" width="8" height="6" rx="2" fill={C.SKIN} />
          
          {/* 头发 (鬓角和刘海) */}
          <path d="M 3.5,4 L 4.5,4 L 4.5,7 L 3.5,6 Z" fill={C.HAIR} /> {/* 左鬓角 */}
          <path d="M 11.5,4 L 12.5,4 L 12.5,6 L 11.5,7 Z" fill={C.HAIR} /> {/* 右鬓角 */}

          {/* 五官 */}
          <rect x="5.5" y="5.5" width="1" height="1.5" fill={C.HAIR} /> {/* 左眼 */}
          <rect x="9.5" y="5.5" width="1" height="1.5" fill={C.HAIR} /> {/* 右眼 */}
          {/* 腮红 (可选，增加可爱度) */}
          <rect x="4.5" y="6.5" width="1" height="0.5" fill="#e5989b" opacity="0.6" />
          <rect x="10.5" y="6.5" width="1" height="0.5" fill="#e5989b" opacity="0.6" />

          {/* 帽子 */}
          {/* 帽子主体 - 圆顶 */}
          <path d="M 3,4 Q 8,-1 13,4 L 13,5 L 3,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
          {/* 帽檐 */}
          <path d="M 3,4.5 Q 8,3.5 13,4.5 L 13,5.5 Q 8,6.5 3,5.5 Z" fill={C.HAT_SHADE} />
          {/* 帽子上的白色标志 */}
          <circle cx="8" cy="3" r="1.2" fill={C.HAT_ACCENT} />
        </g>

        {/* 手臂 (简单的放在身侧) */}
        <rect x="3.5" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="11" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="3.5" y="11" width="1.5" height="1" fill={C.SKIN} /> {/* 左手 */}
        <rect x="11" y="11" width="1.5" height="1" fill={C.SKIN} /> {/* 右手 */}
      </g>
    </svg>
  );
}

/**
 * 渲染背面 (Up)
 */
function renderUp(frame: number, size: number): JSX.Element {
  const bob = getBobY(frame);
  
  const leftLegY = frame === 1 ? 1 : 0;
  const rightLegY = frame === 2 ? 1 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(0, ${bob})`}>
        {/* 左腿 */}
        <rect x="5.5" y={11 + leftLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="5.5" y={13.5 + leftLegY} width="2" height="1" fill={C.SHOES} />

        {/* 右腿 */}
        <rect x="8.5" y={11 + rightLegY} width="2" height="3" fill={C.PANTS} />
        <rect x="8.5" y={13.5 + rightLegY} width="2" height="1" fill={C.SHOES} />

        {/* 躯干 */}
        <rect x="5" y="8" width="6" height="4.5" rx="1" fill={C.SHIRT} />

        {/* 背包 (背面视角的重点) */}
        <rect x="5.5" y="8.5" width="5" height="3.5" rx="0.5" fill={C.BACKPACK} stroke={C.OUTLINE} strokeWidth="0.5" />
        <rect x="6" y="9" width="4" height="1.5" fill="rgba(0,0,0,0.1)" /> {/* 背包口袋 */}

        {/* 头部 (背面) */}
        <g transform="translate(0, -0.5)">
          {/* 头发占据大部分 */}
          <path 
            d="M 3.5,5 Q 8,8 12.5,5 L 12.5,7 Q 8,9 3.5,7 Z" 
            fill={C.HAIR} 
          />
          {/* 帽子后脑勺 */}
          <path d="M 3.5,5 Q 8,-0.5 12.5,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
        </g>
        
        {/* 手臂 */}
        <rect x="3.5" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
        <rect x="11" y="8.5" width="1.5" height="3" rx="0.5" fill={C.SHIRT} />
      </g>
    </svg>
  );
}

/**
 * 渲染左侧 (Left)
 * 这是一个复杂的侧面视图，包含摆臂动画
 */
function renderLeft(frame: number, size: number): JSX.Element {
  const bob = getBobY(frame);

  // 步幅计算 (stride)
  // frame 0: 0, frame 1: -1.5 (左腿前), frame 2: 1.5 (左腿后)
  let lLegX = 0;
  let rLegX = 0;
  let armRot = 0; // 手臂旋转角度

  if (frame === 1) {
    lLegX = -1.5; // 左腿向前 (远离玩家)
    rLegX = 1.5;  // 右腿向后 (靠近玩家)
    armRot = 20;  // 左臂向后摆
  } else if (frame === 2) {
    lLegX = 1.5;  // 左腿向后
    rLegX = -1.5; // 右腿向前
    armRot = -20; // 左臂向前摆
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges">
      <ellipse cx="8" cy="15" rx="4" ry="1.5" fill="rgba(0,0,0,0.2)" />

      <g transform={`translate(0, ${bob})`}>
        {/* 右腿 (远端腿，先画) */}
        <g transform={`translate(${rLegX}, 0)`}>
          <rect x="7" y="11" width="2.5" height="3" fill="#2c3e50" /> {/* 深色表示远端 */}
          <rect x="7" y="13.5" width="2.5" height="1.5" fill="#c0392b" />
        </g>

        {/* 左腿 (近端腿) */}
        <g transform={`translate(${lLegX}, 0)`}>
          <rect x="6.5" y="11" width="2.5" height="3" fill={C.PANTS} />
          <rect x="6.5" y="13.5" width="2.5" height="1.5" fill={C.SHOES} />
        </g>

        {/* 躯干 (侧面) */}
        <rect x="6" y="8" width="4" height="4.5" rx="1" fill={C.SHIRT} />
        
        {/* 背包 (侧面可见隆起) */}
        <path d="M 10,8.5 L 11.5,9 L 11.5,11.5 L 10,12 Z" fill={C.BACKPACK} />
        <rect x="6.5" y="8" width="0.5" height="4" fill={C.SHIRT_ACCENT} /> {/* 拉链线 */}

        {/* 头部 (侧面) */}
        <g transform="translate(-1, -0.5)">
          {/* 脸 */}
          <path d="M 5,3 L 10,3 L 10,8 L 9,9 L 5,9 L 4,6 Z" fill={C.SKIN} />
          
          {/* 眼睛 (侧面只画一个) */}
          <rect x="5" y="5.5" width="1" height="1.5" fill={C.HAIR} />
          
          {/* 头发 (后脑勺 + 刘海) */}
          <path d="M 9,4 L 10.5,4 L 11,8 L 9,8 Z" fill={C.HAIR} />
          <path d="M 4,4 L 5,4 L 4.5,5.5 Z" fill={C.HAIR} />

          {/* 帽子 */}
          <path d="M 4,4 Q 8,-0.5 11,4 L 11,5 L 4,5 Z" fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth="0.5" />
          {/* 帽檐 (向前突出的鸭舌) */}
          <path d="M 4,4.5 L 2,5.5 L 4,5.5 Z" fill={C.HAT_SHADE} />
          {/* 帽侧标 */}
          <circle cx="8" cy="3.5" r="1" fill={C.HAT_ACCENT} />
        </g>

        {/* 手臂 (侧面只画近端手臂，带摆动) */}
        {/* 旋转中心点大约在肩部 (8, 8.5) */}
        <g transform={`rotate(${armRot}, 8, 8.5)`}>
          <rect x="7" y="8.5" width="2" height="3.5" rx="1" fill={C.SHIRT} stroke={C.OUTLINE} strokeWidth="0.5" />
          <rect x="7" y="11.5" width="2" height="1.5" rx="0.5" fill={C.SKIN} />
        </g>
      </g>
    </svg>
  );
}

/**
 * 渲染右侧 (Right)
 * 直接镜像左侧，节省代码并保持一致性
 */
function renderRight(frame: number, size: number): JSX.Element {
  return (
    <g transform="scale(-1, 1) translate(-16, 0)">
      {renderLeft(frame, size)}
    </g>
  );
}