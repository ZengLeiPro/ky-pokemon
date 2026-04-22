// ============================================================
// 真新镇（Pallet Town）户外瓦片 - 火红叶绿风格 SVG 像素画
// ============================================================
//
// 命名规则：统一使用 `pt-` 前缀，避免和室内瓦片冲突。
//
// 分类：
//  1. 地面层：pt-grass / pt-path / pt-sand / pt-water
//  2. 装饰物（可踩）：pt-flower-red / pt-flower-yellow
//  3. 障碍物：pt-tree / pt-fence-h / pt-fence-v / pt-sign
//  4. 主角家（红顶，3×3）：home-roof-tl/tm/tr、home-roof-bl/bm/br、home-wall-l/door/wall-r
//  5. 小茂家（绿顶，3×3）：rival-roof-tl/tm/tr、rival-roof-bl/bm/br、rival-wall-l/door/wall-r
//  6. 奥希德研究所（灰顶大屋，5×3）：lab-roof-l/ml/m/mr/r、lab-roof-bl/bml/bm/bmr/br、lab-wall-l/ml/door/mr/wall-r
// ============================================================

import type { JSX, ReactNode } from 'react';

/** SVG 瓦片外壳 - 统一尺寸和像素化渲染 */
function Pixel16({ children, size }: { children: ReactNode; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' as const, display: 'block' }}
    >
      {children}
    </svg>
  );
}

/** 真新镇瓦片渲染函数集合 */
export const palletTownTileRenderers: Record<string, (size: number) => JSX.Element> = {
  // ============ 地面 ============

  /** 草地 - 火红风格短草（浅绿 + 深绿斑点） */
  'pt-grass': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 草丛斑点 */}
      <rect x="2" y="3" width="1" height="1" fill="#5ca840" />
      <rect x="8" y="1" width="1" height="1" fill="#5ca840" />
      <rect x="12" y="5" width="1" height="1" fill="#5ca840" />
      <rect x="4" y="9" width="1" height="1" fill="#5ca840" />
      <rect x="10" y="11" width="1" height="1" fill="#5ca840" />
      <rect x="14" y="13" width="1" height="1" fill="#5ca840" />
      <rect x="6" y="14" width="1" height="1" fill="#5ca840" />
      <rect x="1" y="12" width="1" height="1" fill="#5ca840" />
      {/* 更亮的高光小点 */}
      <rect x="5" y="2" width="1" height="1" fill="#98e870" />
      <rect x="11" y="7" width="1" height="1" fill="#98e870" />
      <rect x="3" y="6" width="1" height="1" fill="#98e870" />
      <rect x="13" y="10" width="1" height="1" fill="#98e870" />
    </Pixel16>
  ),

  /** 土路 - 米黄色沙土路 */
  'pt-path': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8d090" />
      <rect x="3" y="2" width="1" height="1" fill="#c8a870" />
      <rect x="9" y="5" width="1" height="1" fill="#c8a870" />
      <rect x="5" y="11" width="1" height="1" fill="#c8a870" />
      <rect x="13" y="8" width="1" height="1" fill="#c8a870" />
      <rect x="2" y="14" width="1" height="1" fill="#c8a870" />
      <rect x="11" y="13" width="1" height="1" fill="#c8a870" />
      <rect x="7" y="7" width="1" height="1" fill="#f8e0a8" />
      <rect x="1" y="8" width="1" height="1" fill="#f8e0a8" />
    </Pixel16>
  ),

  /** 沙滩 - 靠近水的浅沙地 */
  'pt-sand': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#f0e0b0" />
      <rect x="3" y="4" width="1" height="1" fill="#d8c090" />
      <rect x="10" y="2" width="1" height="1" fill="#d8c090" />
      <rect x="6" y="9" width="1" height="1" fill="#d8c090" />
      <rect x="13" y="12" width="1" height="1" fill="#d8c090" />
      <rect x="2" y="13" width="1" height="1" fill="#d8c090" />
      <rect x="8" y="14" width="1" height="1" fill="#d8c090" />
    </Pixel16>
  ),

  /** 水 - 蓝色海水，有波纹 */
  'pt-water': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#4090d0" />
      {/* 波纹 */}
      <rect x="1" y="3" width="4" height="1" fill="#70b0e0" />
      <rect x="8" y="5" width="5" height="1" fill="#70b0e0" />
      <rect x="3" y="9" width="6" height="1" fill="#70b0e0" />
      <rect x="10" y="11" width="4" height="1" fill="#70b0e0" />
      <rect x="1" y="13" width="3" height="1" fill="#70b0e0" />
      <rect x="6" y="1" width="3" height="1" fill="#70b0e0" />
      {/* 高光小点 */}
      <rect x="2" y="6" width="1" height="1" fill="#a8d0e8" />
      <rect x="12" y="8" width="1" height="1" fill="#a8d0e8" />
    </Pixel16>
  ),

  // ============ 装饰（可踩） ============

  /** 红色小花 - 种在草地上，可踩过 */
  'pt-flower-red': (size) => (
    <Pixel16 size={size}>
      {/* 草地底 */}
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="2" y="3" width="1" height="1" fill="#5ca840" />
      <rect x="13" y="11" width="1" height="1" fill="#5ca840" />
      {/* 花叶 */}
      <rect x="4" y="9" width="2" height="1" fill="#388038" />
      <rect x="10" y="10" width="2" height="1" fill="#388038" />
      {/* 花 1 */}
      <rect x="4" y="6" width="2" height="1" fill="#f83030" />
      <rect x="3" y="7" width="4" height="1" fill="#f83030" />
      <rect x="4" y="8" width="2" height="1" fill="#f83030" />
      <rect x="4" y="7" width="2" height="1" fill="#ffd830" />
      {/* 花 2 */}
      <rect x="10" y="7" width="2" height="1" fill="#f83030" />
      <rect x="9" y="8" width="4" height="1" fill="#f83030" />
      <rect x="10" y="9" width="2" height="1" fill="#f83030" />
      <rect x="10" y="8" width="2" height="1" fill="#ffd830" />
    </Pixel16>
  ),

  /** 黄色小花 - 种在草地上，可踩过 */
  'pt-flower-yellow': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="11" y="2" width="1" height="1" fill="#5ca840" />
      <rect x="3" y="13" width="1" height="1" fill="#5ca840" />
      {/* 叶 */}
      <rect x="5" y="9" width="2" height="1" fill="#388038" />
      <rect x="9" y="10" width="2" height="1" fill="#388038" />
      {/* 花 1 */}
      <rect x="5" y="6" width="2" height="1" fill="#ffd830" />
      <rect x="4" y="7" width="4" height="1" fill="#ffd830" />
      <rect x="5" y="8" width="2" height="1" fill="#ffd830" />
      <rect x="5" y="7" width="2" height="1" fill="#f89030" />
      {/* 花 2 */}
      <rect x="9" y="7" width="2" height="1" fill="#ffd830" />
      <rect x="8" y="8" width="4" height="1" fill="#ffd830" />
      <rect x="9" y="9" width="2" height="1" fill="#ffd830" />
      <rect x="9" y="8" width="2" height="1" fill="#f89030" />
    </Pixel16>
  ),

  // ============ 障碍 ============

  /** 树 - 1×1 圆形树冠，深绿高饱和 */
  'pt-tree': (size) => (
    <Pixel16 size={size}>
      {/* 草地背景 */}
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 树冠深色轮廓 */}
      <rect x="3" y="2" width="10" height="1" fill="#184018" />
      <rect x="2" y="3" width="12" height="1" fill="#184018" />
      <rect x="2" y="4" width="12" height="1" fill="#184018" />
      <rect x="2" y="5" width="12" height="1" fill="#184018" />
      <rect x="2" y="6" width="12" height="1" fill="#184018" />
      <rect x="2" y="7" width="12" height="1" fill="#184018" />
      <rect x="2" y="8" width="12" height="1" fill="#184018" />
      <rect x="2" y="9" width="12" height="1" fill="#184018" />
      <rect x="3" y="10" width="10" height="1" fill="#184018" />
      <rect x="4" y="11" width="8" height="1" fill="#184018" />
      {/* 树冠主体（深绿） */}
      <rect x="3" y="3" width="10" height="7" fill="#308038" />
      {/* 高光（亮绿） */}
      <rect x="4" y="4" width="4" height="3" fill="#50b848" />
      <rect x="5" y="5" width="2" height="1" fill="#80d870" />
      {/* 树干 */}
      <rect x="6" y="12" width="4" height="3" fill="#583018" />
      <rect x="7" y="13" width="1" height="2" fill="#8a5030" />
      {/* 底部阴影 */}
      <rect x="5" y="15" width="6" height="1" fill="#60a050" />
    </Pixel16>
  ),

  /** 水平栅栏（白色木栅栏，火红风格） */
  'pt-fence-h': (size) => (
    <Pixel16 size={size}>
      {/* 草地背景 */}
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="13" y="14" width="1" height="1" fill="#5ca840" />
      {/* 上横梁 */}
      <rect x="0" y="5" width="16" height="2" fill="#e8e0c0" />
      <rect x="0" y="5" width="16" height="1" fill="#f8f0d8" />
      <rect x="0" y="6" width="16" height="1" fill="#c0a060" />
      {/* 下横梁 */}
      <rect x="0" y="10" width="16" height="2" fill="#e8e0c0" />
      <rect x="0" y="10" width="16" height="1" fill="#f8f0d8" />
      <rect x="0" y="11" width="16" height="1" fill="#c0a060" />
      {/* 立柱 */}
      <rect x="2" y="3" width="2" height="11" fill="#e8e0c0" />
      <rect x="2" y="3" width="1" height="11" fill="#f8f0d8" />
      <rect x="3" y="3" width="1" height="11" fill="#c0a060" />
      <rect x="12" y="3" width="2" height="11" fill="#e8e0c0" />
      <rect x="12" y="3" width="1" height="11" fill="#f8f0d8" />
      <rect x="13" y="3" width="1" height="11" fill="#c0a060" />
    </Pixel16>
  ),

  /** 路牌 - 木制路标 */
  'pt-sign': (size) => (
    <Pixel16 size={size}>
      {/* 草地背景 */}
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 牌匾 */}
      <rect x="3" y="3" width="10" height="6" fill="#684020" />
      <rect x="3" y="3" width="10" height="1" fill="#8a5a30" />
      <rect x="3" y="8" width="10" height="1" fill="#4a2810" />
      <rect x="4" y="4" width="8" height="4" fill="#a87040" />
      {/* 文字示意（3 条横线） */}
      <rect x="5" y="5" width="6" height="1" fill="#4a2810" />
      <rect x="5" y="7" width="4" height="1" fill="#4a2810" />
      {/* 木柱 */}
      <rect x="7" y="9" width="2" height="6" fill="#684020" />
      <rect x="7" y="9" width="1" height="6" fill="#8a5a30" />
      <rect x="8" y="9" width="1" height="6" fill="#4a2810" />
    </Pixel16>
  ),

  // ============ 主角家（红顶，3×3） ============
  // 屋顶顶行（左/中/右）：红色斜面
  'home-roof-tl': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 屋顶左斜边 */}
      <rect x="6" y="2" width="10" height="2" fill="#5a1810" />
      <rect x="4" y="4" width="12" height="2" fill="#b82820" />
      <rect x="2" y="6" width="14" height="2" fill="#d83830" />
      <rect x="0" y="8" width="16" height="2" fill="#e84838" />
      <rect x="0" y="10" width="16" height="6" fill="#a81810" />
      {/* 屋顶亮面高光 */}
      <rect x="8" y="4" width="6" height="1" fill="#f05848" />
      <rect x="6" y="6" width="6" height="1" fill="#f05848" />
      <rect x="3" y="8" width="8" height="1" fill="#f05848" />
    </Pixel16>
  ),
  'home-roof-tm': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 屋顶主体 */}
      <rect x="0" y="0" width="16" height="2" fill="#5a1810" />
      <rect x="0" y="2" width="16" height="3" fill="#b82820" />
      <rect x="0" y="5" width="16" height="3" fill="#d83830" />
      <rect x="0" y="8" width="16" height="2" fill="#e84838" />
      <rect x="0" y="10" width="16" height="6" fill="#a81810" />
      {/* 高光 */}
      <rect x="0" y="3" width="16" height="1" fill="#d03828" />
      <rect x="0" y="6" width="16" height="1" fill="#f05848" />
    </Pixel16>
  ),
  'home-roof-tr': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      {/* 屋顶右斜边 */}
      <rect x="0" y="2" width="10" height="2" fill="#5a1810" />
      <rect x="0" y="4" width="12" height="2" fill="#b82820" />
      <rect x="0" y="6" width="14" height="2" fill="#d83830" />
      <rect x="0" y="8" width="16" height="2" fill="#e84838" />
      <rect x="0" y="10" width="16" height="6" fill="#a81810" />
      {/* 高光 */}
      <rect x="2" y="4" width="6" height="1" fill="#f05848" />
      <rect x="4" y="6" width="6" height="1" fill="#f05848" />
      <rect x="5" y="8" width="8" height="1" fill="#f05848" />
    </Pixel16>
  ),
  // 屋顶底行（含窗户）
  'home-roof-bl': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#a81810" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      {/* 侧墙分隔 */}
      <rect x="0" y="0" width="1" height="16" fill="#604028" />
      {/* 装饰砖块 */}
      <rect x="4" y="6" width="2" height="2" fill="#d8b870" />
      <rect x="4" y="10" width="2" height="2" fill="#d8b870" />
    </Pixel16>
  ),
  'home-roof-bm': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#a81810" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      {/* 窗户框 */}
      <rect x="3" y="4" width="10" height="8" fill="#4060a0" />
      <rect x="3" y="4" width="10" height="1" fill="#2040a0" />
      <rect x="3" y="11" width="10" height="1" fill="#2040a0" />
      <rect x="4" y="5" width="8" height="6" fill="#80b0e0" />
      {/* 窗户十字栅 */}
      <rect x="7" y="5" width="2" height="6" fill="#2040a0" />
      <rect x="4" y="7" width="8" height="2" fill="#2040a0" />
      {/* 反光高光 */}
      <rect x="5" y="5" width="1" height="2" fill="#c0e0f8" />
      <rect x="10" y="9" width="1" height="1" fill="#c0e0f8" />
    </Pixel16>
  ),
  'home-roof-br': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#a81810" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      <rect x="15" y="0" width="1" height="16" fill="#604028" />
      {/* 装饰砖 */}
      <rect x="10" y="6" width="2" height="2" fill="#d8b870" />
      <rect x="10" y="10" width="2" height="2" fill="#d8b870" />
    </Pixel16>
  ),
  // 墙壁行（左墙/门/右墙）
  'home-wall-l': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      <rect x="0" y="0" width="1" height="16" fill="#604028" />
      {/* 底部台阶/阴影 */}
      <rect x="0" y="14" width="16" height="2" fill="#785028" />
      <rect x="0" y="14" width="16" height="1" fill="#604028" />
      {/* 墙面纹理 */}
      <rect x="6" y="4" width="4" height="1" fill="#d0a860" />
      <rect x="3" y="8" width="4" height="1" fill="#d0a860" />
    </Pixel16>
  ),
  'home-door': (size) => (
    <Pixel16 size={size}>
      {/* 墙底 */}
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      {/* 门框 */}
      <rect x="2" y="1" width="12" height="15" fill="#4a2810" />
      {/* 门板 */}
      <rect x="3" y="2" width="10" height="14" fill="#884020" />
      <rect x="3" y="2" width="10" height="1" fill="#a8502c" />
      {/* 门扶手/把手 */}
      <rect x="11" y="9" width="1" height="1" fill="#ffd830" />
      {/* 门板木纹 */}
      <rect x="5" y="3" width="6" height="1" fill="#6a3018" />
      <rect x="5" y="8" width="6" height="1" fill="#6a3018" />
      <rect x="5" y="13" width="6" height="1" fill="#6a3018" />
    </Pixel16>
  ),
  'home-wall-r': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      <rect x="15" y="0" width="1" height="16" fill="#604028" />
      <rect x="0" y="14" width="16" height="2" fill="#785028" />
      <rect x="0" y="14" width="16" height="1" fill="#604028" />
      <rect x="6" y="6" width="4" height="1" fill="#d0a860" />
      <rect x="9" y="10" width="4" height="1" fill="#d0a860" />
    </Pixel16>
  ),

  // ============ 小茂家（绿顶，3×3） ============
  'rival-roof-tl': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="6" y="2" width="10" height="2" fill="#184a20" />
      <rect x="4" y="4" width="12" height="2" fill="#2a7838" />
      <rect x="2" y="6" width="14" height="2" fill="#409848" />
      <rect x="0" y="8" width="16" height="2" fill="#58b858" />
      <rect x="0" y="10" width="16" height="6" fill="#286830" />
      <rect x="8" y="4" width="6" height="1" fill="#60c860" />
      <rect x="6" y="6" width="6" height="1" fill="#60c860" />
      <rect x="3" y="8" width="8" height="1" fill="#60c860" />
    </Pixel16>
  ),
  'rival-roof-tm': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="0" width="16" height="2" fill="#184a20" />
      <rect x="0" y="2" width="16" height="3" fill="#2a7838" />
      <rect x="0" y="5" width="16" height="3" fill="#409848" />
      <rect x="0" y="8" width="16" height="2" fill="#58b858" />
      <rect x="0" y="10" width="16" height="6" fill="#286830" />
      <rect x="0" y="3" width="16" height="1" fill="#388838" />
      <rect x="0" y="6" width="16" height="1" fill="#60c860" />
    </Pixel16>
  ),
  'rival-roof-tr': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="2" width="10" height="2" fill="#184a20" />
      <rect x="0" y="4" width="12" height="2" fill="#2a7838" />
      <rect x="0" y="6" width="14" height="2" fill="#409848" />
      <rect x="0" y="8" width="16" height="2" fill="#58b858" />
      <rect x="0" y="10" width="16" height="6" fill="#286830" />
      <rect x="2" y="4" width="6" height="1" fill="#60c860" />
      <rect x="4" y="6" width="6" height="1" fill="#60c860" />
      <rect x="5" y="8" width="8" height="1" fill="#60c860" />
    </Pixel16>
  ),
  'rival-roof-bl': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#286830" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      <rect x="0" y="0" width="1" height="16" fill="#604028" />
      <rect x="4" y="6" width="2" height="2" fill="#d8b870" />
      <rect x="4" y="10" width="2" height="2" fill="#d8b870" />
    </Pixel16>
  ),
  'rival-roof-bm': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#286830" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      <rect x="3" y="4" width="10" height="8" fill="#4060a0" />
      <rect x="3" y="4" width="10" height="1" fill="#2040a0" />
      <rect x="3" y="11" width="10" height="1" fill="#2040a0" />
      <rect x="4" y="5" width="8" height="6" fill="#80b0e0" />
      <rect x="7" y="5" width="2" height="6" fill="#2040a0" />
      <rect x="4" y="7" width="8" height="2" fill="#2040a0" />
      <rect x="5" y="5" width="1" height="2" fill="#c0e0f8" />
      <rect x="10" y="9" width="1" height="1" fill="#c0e0f8" />
    </Pixel16>
  ),
  'rival-roof-br': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#286830" />
      <rect x="0" y="2" width="16" height="14" fill="#f0e0a0" />
      <rect x="0" y="2" width="16" height="1" fill="#d8c070" />
      <rect x="0" y="14" width="16" height="2" fill="#a88050" />
      <rect x="15" y="0" width="1" height="16" fill="#604028" />
      <rect x="10" y="6" width="2" height="2" fill="#d8b870" />
      <rect x="10" y="10" width="2" height="2" fill="#d8b870" />
    </Pixel16>
  ),
  'rival-wall-l': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      <rect x="0" y="0" width="1" height="16" fill="#604028" />
      <rect x="0" y="14" width="16" height="2" fill="#785028" />
      <rect x="0" y="14" width="16" height="1" fill="#604028" />
      <rect x="6" y="4" width="4" height="1" fill="#d0a860" />
      <rect x="3" y="8" width="4" height="1" fill="#d0a860" />
    </Pixel16>
  ),
  'rival-door': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      <rect x="2" y="1" width="12" height="15" fill="#4a2810" />
      <rect x="3" y="2" width="10" height="14" fill="#884020" />
      <rect x="3" y="2" width="10" height="1" fill="#a8502c" />
      <rect x="11" y="9" width="1" height="1" fill="#ffd830" />
      <rect x="5" y="3" width="6" height="1" fill="#6a3018" />
      <rect x="5" y="8" width="6" height="1" fill="#6a3018" />
      <rect x="5" y="13" width="6" height="1" fill="#6a3018" />
    </Pixel16>
  ),
  'rival-wall-r': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#e8c878" />
      <rect x="0" y="0" width="16" height="1" fill="#a88050" />
      <rect x="15" y="0" width="1" height="16" fill="#604028" />
      <rect x="0" y="14" width="16" height="2" fill="#785028" />
      <rect x="0" y="14" width="16" height="1" fill="#604028" />
      <rect x="6" y="6" width="4" height="1" fill="#d0a860" />
      <rect x="9" y="10" width="4" height="1" fill="#d0a860" />
    </Pixel16>
  ),

  // ============ 奥希德研究所（灰顶，5×3） ============
  // 屋顶顶行（左/中左/中/中右/右）
  'lab-roof-l': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="6" y="2" width="10" height="2" fill="#404040" />
      <rect x="4" y="4" width="12" height="2" fill="#606068" />
      <rect x="2" y="6" width="14" height="2" fill="#808088" />
      <rect x="0" y="8" width="16" height="2" fill="#a0a0a8" />
      <rect x="0" y="10" width="16" height="6" fill="#484850" />
      <rect x="8" y="4" width="6" height="1" fill="#a0a0b0" />
      <rect x="6" y="6" width="6" height="1" fill="#b8b8c0" />
    </Pixel16>
  ),
  'lab-roof-ml': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="0" width="16" height="2" fill="#404040" />
      <rect x="0" y="2" width="16" height="3" fill="#606068" />
      <rect x="0" y="5" width="16" height="3" fill="#808088" />
      <rect x="0" y="8" width="16" height="2" fill="#a0a0a8" />
      <rect x="0" y="10" width="16" height="6" fill="#484850" />
      <rect x="0" y="3" width="16" height="1" fill="#707078" />
      <rect x="0" y="6" width="16" height="1" fill="#a8a8b8" />
    </Pixel16>
  ),
  'lab-roof-m': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="0" width="16" height="2" fill="#404040" />
      <rect x="0" y="2" width="16" height="3" fill="#606068" />
      <rect x="0" y="5" width="16" height="3" fill="#808088" />
      <rect x="0" y="8" width="16" height="2" fill="#a0a0a8" />
      <rect x="0" y="10" width="16" height="6" fill="#484850" />
      {/* 中央装饰：屋顶烟囱/风向标 */}
      <rect x="5" y="-0" width="6" height="2" fill="#303030" />
      <rect x="7" y="0" width="2" height="4" fill="#303030" />
      <rect x="0" y="3" width="16" height="1" fill="#707078" />
      <rect x="0" y="6" width="16" height="1" fill="#a8a8b8" />
    </Pixel16>
  ),
  'lab-roof-mr': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="0" width="16" height="2" fill="#404040" />
      <rect x="0" y="2" width="16" height="3" fill="#606068" />
      <rect x="0" y="5" width="16" height="3" fill="#808088" />
      <rect x="0" y="8" width="16" height="2" fill="#a0a0a8" />
      <rect x="0" y="10" width="16" height="6" fill="#484850" />
      <rect x="0" y="3" width="16" height="1" fill="#707078" />
      <rect x="0" y="6" width="16" height="1" fill="#a8a8b8" />
    </Pixel16>
  ),
  'lab-roof-r': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#78c850" />
      <rect x="0" y="2" width="10" height="2" fill="#404040" />
      <rect x="0" y="4" width="12" height="2" fill="#606068" />
      <rect x="0" y="6" width="14" height="2" fill="#808088" />
      <rect x="0" y="8" width="16" height="2" fill="#a0a0a8" />
      <rect x="0" y="10" width="16" height="6" fill="#484850" />
      <rect x="2" y="4" width="6" height="1" fill="#a0a0b0" />
      <rect x="4" y="6" width="6" height="1" fill="#b8b8c0" />
    </Pixel16>
  ),
  // 屋顶底行（含大面招牌）
  'lab-roof-bl': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#484850" />
      <rect x="0" y="2" width="16" height="14" fill="#d0c8b8" />
      <rect x="0" y="2" width="16" height="1" fill="#b0a898" />
      <rect x="0" y="14" width="16" height="2" fill="#786858" />
      <rect x="0" y="0" width="1" height="16" fill="#404038" />
    </Pixel16>
  ),
  'lab-roof-bml': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#484850" />
      <rect x="0" y="2" width="16" height="14" fill="#d0c8b8" />
      <rect x="0" y="2" width="16" height="1" fill="#b0a898" />
      <rect x="0" y="14" width="16" height="2" fill="#786858" />
      {/* 招牌左半 "OAK" */}
      <rect x="2" y="5" width="14" height="6" fill="#1850a0" />
      <rect x="2" y="5" width="14" height="1" fill="#0838a0" />
      <rect x="2" y="10" width="14" height="1" fill="#0838a0" />
      {/* 字 O */}
      <rect x="5" y="7" width="3" height="2" fill="#fff8c8" />
      <rect x="6" y="8" width="1" height="1" fill="#1850a0" />
    </Pixel16>
  ),
  'lab-roof-bm': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#484850" />
      <rect x="0" y="2" width="16" height="14" fill="#d0c8b8" />
      <rect x="0" y="2" width="16" height="1" fill="#b0a898" />
      <rect x="0" y="14" width="16" height="2" fill="#786858" />
      {/* 招牌中间 */}
      <rect x="0" y="5" width="16" height="6" fill="#1850a0" />
      <rect x="0" y="5" width="16" height="1" fill="#0838a0" />
      <rect x="0" y="10" width="16" height="1" fill="#0838a0" />
      {/* 字 A */}
      <rect x="4" y="7" width="3" height="2" fill="#fff8c8" />
      <rect x="4" y="9" width="1" height="1" fill="#fff8c8" />
      <rect x="6" y="9" width="1" height="1" fill="#fff8c8" />
      {/* 字 K */}
      <rect x="9" y="7" width="1" height="3" fill="#fff8c8" />
      <rect x="10" y="8" width="2" height="1" fill="#fff8c8" />
      <rect x="11" y="7" width="1" height="1" fill="#fff8c8" />
      <rect x="11" y="9" width="1" height="1" fill="#fff8c8" />
    </Pixel16>
  ),
  'lab-roof-bmr': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#484850" />
      <rect x="0" y="2" width="16" height="14" fill="#d0c8b8" />
      <rect x="0" y="2" width="16" height="1" fill="#b0a898" />
      <rect x="0" y="14" width="16" height="2" fill="#786858" />
      {/* 招牌右半 */}
      <rect x="0" y="5" width="14" height="6" fill="#1850a0" />
      <rect x="0" y="5" width="14" height="1" fill="#0838a0" />
      <rect x="0" y="10" width="14" height="1" fill="#0838a0" />
    </Pixel16>
  ),
  'lab-roof-br': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="2" fill="#484850" />
      <rect x="0" y="2" width="16" height="14" fill="#d0c8b8" />
      <rect x="0" y="2" width="16" height="1" fill="#b0a898" />
      <rect x="0" y="14" width="16" height="2" fill="#786858" />
      <rect x="15" y="0" width="1" height="16" fill="#404038" />
    </Pixel16>
  ),
  // 墙行（左墙 / 左装饰 / 门 / 右装饰 / 右墙）
  'lab-wall-l': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#c8c0a8" />
      <rect x="0" y="0" width="16" height="1" fill="#786858" />
      <rect x="0" y="0" width="1" height="16" fill="#484030" />
      <rect x="0" y="14" width="16" height="2" fill="#584838" />
      <rect x="0" y="14" width="16" height="1" fill="#302818" />
    </Pixel16>
  ),
  'lab-wall-ml': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#c8c0a8" />
      <rect x="0" y="0" width="16" height="1" fill="#786858" />
      <rect x="0" y="14" width="16" height="2" fill="#584838" />
      <rect x="0" y="14" width="16" height="1" fill="#302818" />
      {/* 窗户 */}
      <rect x="3" y="4" width="10" height="8" fill="#4060a0" />
      <rect x="3" y="4" width="10" height="1" fill="#2040a0" />
      <rect x="3" y="11" width="10" height="1" fill="#2040a0" />
      <rect x="4" y="5" width="8" height="6" fill="#80b0e0" />
      <rect x="7" y="5" width="2" height="6" fill="#2040a0" />
      <rect x="4" y="7" width="8" height="2" fill="#2040a0" />
      <rect x="5" y="5" width="1" height="2" fill="#c0e0f8" />
    </Pixel16>
  ),
  'lab-door': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#c8c0a8" />
      <rect x="0" y="0" width="16" height="1" fill="#786858" />
      {/* 大门框 */}
      <rect x="1" y="1" width="14" height="15" fill="#2a2a2a" />
      {/* 自动门（双扇） */}
      <rect x="2" y="2" width="6" height="14" fill="#405878" />
      <rect x="8" y="2" width="6" height="14" fill="#405878" />
      <rect x="2" y="2" width="6" height="1" fill="#708ab0" />
      <rect x="8" y="2" width="6" height="1" fill="#708ab0" />
      {/* 反光高光 */}
      <rect x="3" y="3" width="1" height="8" fill="#90b0d8" />
      <rect x="13" y="3" width="1" height="8" fill="#90b0d8" />
      {/* 门缝 */}
      <rect x="7" y="2" width="2" height="14" fill="#1a1a1a" />
      {/* 感应条 */}
      <rect x="6" y="4" width="4" height="1" fill="#f84040" />
    </Pixel16>
  ),
  'lab-wall-mr': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#c8c0a8" />
      <rect x="0" y="0" width="16" height="1" fill="#786858" />
      <rect x="0" y="14" width="16" height="2" fill="#584838" />
      <rect x="0" y="14" width="16" height="1" fill="#302818" />
      <rect x="3" y="4" width="10" height="8" fill="#4060a0" />
      <rect x="3" y="4" width="10" height="1" fill="#2040a0" />
      <rect x="3" y="11" width="10" height="1" fill="#2040a0" />
      <rect x="4" y="5" width="8" height="6" fill="#80b0e0" />
      <rect x="7" y="5" width="2" height="6" fill="#2040a0" />
      <rect x="4" y="7" width="8" height="2" fill="#2040a0" />
      <rect x="5" y="5" width="1" height="2" fill="#c0e0f8" />
    </Pixel16>
  ),
  'lab-wall-r': (size) => (
    <Pixel16 size={size}>
      <rect x="0" y="0" width="16" height="16" fill="#c8c0a8" />
      <rect x="0" y="0" width="16" height="1" fill="#786858" />
      <rect x="15" y="0" width="1" height="16" fill="#484030" />
      <rect x="0" y="14" width="16" height="2" fill="#584838" />
      <rect x="0" y="14" width="16" height="1" fill="#302818" />
    </Pixel16>
  ),
};
