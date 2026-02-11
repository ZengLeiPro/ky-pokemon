// ============================================================
// 玩家角色 SVG  - 像素风训练师 (HGSS 风格重制版)
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

// Direction 类型定义为: 'up' | 'down' | 'left' | 'right'

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

// === 颜色常量 ===
const C = {
  OUTLINE: '#282020',    // 深褐色轮廓，比纯黑更柔和
  SKIN: '#f8d0b0',       // 皮肤高光
  SKIN_SHADOW: '#e0a888',// 皮肤阴影
  HAT_MAIN: '#e63939',   // 经典的宝可梦红
  HAT_VISOR: '#ffffff',  // 帽子前沿
  HAIR: '#3e3131',       // 深褐色头发
  CLOTH_RED: '#d12a2a',  // 衣服红色部分
  CLOTH_WHITE: '#f0f0f0',// 衣服白色部分
  PANTS: '#3a5a8f',      // 牛仔蓝
  SHOES: '#333333',      // 深色鞋子
  SHADOW: 'rgba(0,0,0,0.2)', // 角色脚下的投影
};

// === 辅助常量 ===
const STROKE_WIDTH = 0.6; // 描边宽度，模拟像素勾线

// === 渲染函数 ===

function renderDown(frame: number, size: number): JSX.Element {
  // 身体起伏: 行走时身体下沉 0.5 像素
  const bob = frame !== 0 ? 0.5 : 0;
  
  // 腿部偏移计算
  const leftLegOffset = frame === 1 ? 0.5 : 0;
  const rightLegOffset = frame === 2 ? 0.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      {/* 阴影 */}
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />

      <g transform={`translate(0, ${bob})`}>
        {/* === 腿部 === */}
        {/* 左腿 */}
        <path
          d={`M6,12 L6,${14 + leftLegOffset} A1,1 0 0,0 7,${15 + leftLegOffset} L8,${15 + leftLegOffset} L8,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />
        {/* 右腿 */}
        <path
          d={`M8,12 L8,${15 + rightLegOffset} A1,1 0 0,0 9,${15 + rightLegOffset} L10,${14 + rightLegOffset} L10,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />

        {/* === 身体 (躯干) === */}
        {/* 夹克主体 */}
        <rect x="5.5" y="9" width="5" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />
        {/* 内部白衬衫 (V领效果) */}
        <path d="M7,9 L8,11 L9,9" fill={C.CLOTH_WHITE} />
        <line x1="8" y1="11" x2="8" y2="13" stroke={C.OUTLINE} strokeWidth={0.4} />

        {/* === 手臂 (自然下垂) === */}
        <path d="M5.5,9.5 L5,11.5 A1,1 0 0,0 5.5,12.5" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />
        <path d="M10.5,9.5 L11,11.5 A1,1 0 0,1 10.5,12.5" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* === 头部 (大头风格) === */}
        {/* 脸型 */}
        <path
          d="M5,5 Q5,9 8,9 Q11,9 11,5 L11,4 L5,4 Z"
          fill={C.SKIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        
        {/* 帽子 (鸭舌帽) */}
        <path
          d="M4.5,4 C4.5,1.5 6,0.5 8,0.5 C10,0.5 11.5,1.5 11.5,4 L11.5,5 L4.5,5 Z"
          fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        {/* 帽檐 (白色装饰) */}
        <path d="M6,4 Q8,3 10,4" fill="none" stroke={C.HAT_VISOR} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M7.5,2.5 L8.5,2.5" fill="none" stroke={C.HAT_VISOR} strokeWidth={1.5} />

        {/* 五官 */}
        {/* 眼睛 */}
        <rect x="6.2" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        <rect x="8.8" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        {/* 腮红/红晕 (可爱感) */}
        <circle cx="5.8" cy="7" r="0.4" fill="#f0a0a0" opacity="0.6" />
        <circle cx="10.2" cy="7" r="0.4" fill="#f0a0a0" opacity="0.6" />
        
        {/* 鬓角头发 */}
        <path d="M4.8,4.5 L4.2,5.5 L4.5,6.5" fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4} />
        <path d="M11.2,4.5 L11.8,5.5 L11.5,6.5" fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4} />
      </g>
    </svg>
  );
}

function renderUp(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? 0.5 : 0;
  const leftLegOffset = frame === 1 ? 0.5 : 0;
  const rightLegOffset = frame === 2 ? 0.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />

      <g transform={`translate(0, ${bob})`}>
        {/* === 腿部 (后视) === */}
        <path
          d={`M6,12 L6,${14 + leftLegOffset} L8,${14 + leftLegOffset} L8,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        <path
          d={`M8,12 L8,${14 + rightLegOffset} L10,${14 + rightLegOffset} L10,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />

        {/* === 身体 (后背) === */}
        <rect x="5.5" y="9" width="5" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />
        
        {/* 背包细节 */}
        <rect x="6.5" y="9.5" width="3" height="2.5" rx="0.5" fill="#a05050" stroke={C.OUTLINE} strokeWidth={0.4} />

        {/* === 头部 (后脑勺) === */}
        {/* 帽子后部 */}
        <path
          d="M4.5,4 C4.5,1.5 6,0.5 8,0.5 C10,0.5 11.5,1.5 11.5,4 L11.5,7 L4.5,7 Z"
          fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
        />
        {/* 露出的后发 */}
        <path
          d="M5,7 L5,8 L6,7.5 L7,8.2 L8,7.5 L9,8.2 L10,7.5 L11,8 L11,7"
          fill={C.HAIR} stroke={C.OUTLINE} strokeWidth={0.4}
        />
      </g>
    </svg>
  );
}

function renderLeft(frame: number, size: number): JSX.Element {
  const bob = frame !== 0 ? 0.5 : 0;
  
  // 侧面行走的剪刀腿逻辑
  // frame 0: 站立
  // frame 1: 左脚(后脚)前摆，右脚(前脚)后摆
  // frame 2: 左脚后摆，右脚前摆
  
  // 为了简化，我们定义 "Near Leg" (靠近观众的腿/左腿) 和 "Far Leg" (右腿)
  // 注意：侧面视图时，x轴坐标需要精细调整以体现透视
  
  const farLegX = frame === 1 ? 9 : (frame === 2 ? 6 : 7.5);
  const nearLegX = frame === 1 ? 6 : (frame === 2 ? 9 : 7.5);
  
  // 摆动时稍微抬起
  const farLegY = frame === 1 ? 14 : 14.5; 
  const nearLegY = frame === 2 ? 14 : 14.5;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="15" rx="5" ry="1.5" fill={C.SHADOW} />

      <g transform={`translate(0, ${bob})`}>
        {/* === 远端腿 (右腿) === */}
        <path
          d={`M7.5,11 L${farLegX},13 L${farLegX},${farLegY} L8.5,12`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />

        {/* === 远端手臂 (摆动) === */}
        {/* 手臂摆动方向与腿相反: 左腿前(f1) -> 左手后 -> 右手(远端)前 */}
        {frame === 1 && (
           <path d="M8,9.5 Q10,10.5 10.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2} strokeLinecap="round" />
        )}
        {frame === 2 && (
           <path d="M8,9.5 Q6,10.5 6.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2} strokeLinecap="round" />
        )}

        {/* === 身体 (侧面) === */}
        <rect x="6" y="9" width="4" height="4" rx="1" fill={C.CLOTH_RED} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} />

        {/* === 头部 (侧面轮廓) === */}
        <g transform="translate(1,0)"> {/* 头部略微前倾 */}
          {/* 后脑勺头发 */}
          <path d="M5,4 Q4,6 5,8 L6,8" fill={C.HAIR} />
          
          {/* 脸部 */}
          <path
            d="M5.5,3.5 L9.5,3.5 L9.5,8 Q9.5,9 7,9 L5.5,8 Z"
            fill={C.SKIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
          />
          
          {/* 帽子 */}
          <path
            d="M5,4 C5,1.5 6,0.5 8,0.5 C10,0.5 10.5,1.5 10.5,4 L5,4"
            fill={C.HAT_MAIN} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH}
          />
          {/* 帽檐 (向前伸出) */}
          <path d="M9.5,3.5 L12,4 L9.5,4.5" fill={C.HAT_VISOR} stroke={C.OUTLINE} strokeWidth={0.4} />

          {/* 眼睛 (侧面点) */}
          <rect x="9" y="5.5" width="1" height="1.5" rx="0.2" fill="#222" />
        </g>

        {/* === 近端腿 (左腿) === */}
        <path
          d={`M7.5,12 L${nearLegX},13 L${nearLegX},${nearLegY} L8.5,11`}
          fill={C.PANTS} stroke={C.OUTLINE} strokeWidth={STROKE_WIDTH} strokeLinejoin="round"
        />
        {/* 鞋子细节 */}
        <path d={`M${nearLegX-0.5},${nearLegY} h2 v1 h-2 z`} fill={C.SHOES} />

        {/* === 近端手臂 (摆动) === */}
        {/* 左腿前(f1) -> 左手后 */}
        {frame === 1 ? (
           <path d="M7.5,9.5 Q6,10.5 5.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        ) : frame === 2 ? (
           <path d="M7.5,9.5 Q9,10.5 9.5,11.5" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        ) : (
           <path d="M7.5,9.5 L7.5,12" fill="none" stroke={C.CLOTH_RED} strokeWidth={2.5} strokeLinecap="round" />
        )}
      </g>
    </svg>
  );
}

function renderRight(frame: number, size: number): JSX.Element {
  // 右侧完全复用左侧的绘制逻辑，通过 transform 翻转
  // translate(-16, 0) 是因为翻转后坐标系变成了 [-16, 0]，需要移回 [0, 16]
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <g transform="scale(-1, 1) translate(-16, 0)">
        {/* 提取 renderLeft 的内部内容并不容易，因为它是返回 JSX。
            在 React SVG 中，简单的做法是重新调用 renderLeft 的逻辑，
            或者这里为了保持代码结构，我们直接包装 renderLeft 返回的 SVG 的内容。
            但由于我们要返回一个新的 SVG 标签，最干净的方法是复制 renderLeft 的内部逻辑
            或者封装一个 drawSideContent。
            
            为了符合"代码质量要求 - 这里的函数签名"，我们选择在 renderRight 内部
            渲染一个翻转的 group，并调用一个不带 svg 标签的内部辅助函数，
            或者最简单的：嵌套 SVG。
        */}
        <svg x="0" y="0" width="16" height="16" viewBox="0 0 16 16">
             {/* 这里我们不得不做一个特殊的处理：
                 renderLeft 返回的是 <svg>...</svg>。
                 如果不拆分 renderLeft，直接使用 renderLeft 的内容比较困难。
                 **修正策略**：为了代码整洁，我将 renderLeft 的内容提取为 _drawSide。
             */}
             <_DrawSideContent frame={frame} />
        </svg>
      </g>
    </svg>
  );
}

// 内部组件：用于复用侧面绘制逻辑
function _DrawSideContent({ frame }: { frame: number }) {
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
        {/* 身体 */}
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
        <path d={`M${nearLegX-0.5},${nearLegY} h2 v1 h-2 z`} fill={C.SHOES} />
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

// 重写 renderLeft 以使用提取的组件
function renderLeft(frame: number, size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <_DrawSideContent frame={frame} />
    </svg>
  );
}