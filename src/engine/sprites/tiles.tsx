// ============================================================
// 瓦片 SVG 定义 - 宝可梦 GBA 室内风格
// ============================================================

import type { JSX } from 'react';

/**
 * 瓦片渲染函数集合。
 * 每个渲染函数接收 size（像素）参数，返回对应瓦片的 SVG 元素。
 * 配色参考 GBA 宝可梦室内场景。
 */
export const tileRenderers: Record<string, (size: number) => JSX.Element> = {
  // ----------------------------------------------------------
  // 地板类
  // ----------------------------------------------------------

  /** 室内地板 - 浅米色带微妙格子纹理 */
  floor: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 格子纹理 */}
      <line x1="0" y1="8" x2="16" y2="8" stroke="#DCC8A0" strokeWidth="0.5" />
      <line x1="8" y1="0" x2="8" y2="16" stroke="#DCC8A0" strokeWidth="0.5" />
      {/* 右下角微阴影 */}
      <rect x="15" y="0" width="1" height="16" fill="#D0B890" opacity="0.5" />
      <rect x="0" y="15" width="16" height="1" fill="#D0B890" opacity="0.5" />
    </svg>
  ),

  /** 装饰地板 - 有图案的地砖 */
  'floor-pattern': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#DCC8A0" />
      {/* 菱形装饰图案 */}
      <polygon points="8,2 14,8 8,14 2,8" fill="#D0B890" stroke="#C8B080" strokeWidth="0.5" />
      <polygon points="8,4 12,8 8,12 4,8" fill="#E0C8A0" stroke="#C8B080" strokeWidth="0.3" />
      {/* 角落小点缀 */}
      <rect x="1" y="1" width="2" height="2" fill="#C8B080" rx="0.5" />
      <rect x="13" y="1" width="2" height="2" fill="#C8B080" rx="0.5" />
      <rect x="1" y="13" width="2" height="2" fill="#C8B080" rx="0.5" />
      <rect x="13" y="13" width="2" height="2" fill="#C8B080" rx="0.5" />
    </svg>
  ),

  // ----------------------------------------------------------
  // 墙壁类
  // ----------------------------------------------------------

  /** 墙壁顶部 - 深色 */
  'wall-top': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#706050" />
      {/* 砖纹 */}
      <rect x="0" y="0" width="8" height="8" stroke="#605040" strokeWidth="0.5" fill="none" />
      <rect x="8" y="0" width="8" height="8" stroke="#605040" strokeWidth="0.5" fill="none" />
      <rect x="4" y="8" width="8" height="8" stroke="#605040" strokeWidth="0.5" fill="none" />
      {/* 顶部高光 */}
      <rect x="0" y="0" width="16" height="1" fill="#807060" />
    </svg>
  ),

  /** 墙壁正面 - 浅色带阴影 */
  'wall-front': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#B8A080" />
      {/* 砖缝 */}
      <line x1="0" y1="5" x2="16" y2="5" stroke="#A89070" strokeWidth="0.5" />
      <line x1="0" y1="11" x2="16" y2="11" stroke="#A89070" strokeWidth="0.5" />
      <line x1="8" y1="0" x2="8" y2="5" stroke="#A89070" strokeWidth="0.5" />
      <line x1="4" y1="5" x2="4" y2="11" stroke="#A89070" strokeWidth="0.5" />
      <line x1="12" y1="5" x2="12" y2="11" stroke="#A89070" strokeWidth="0.5" />
      <line x1="8" y1="11" x2="8" y2="16" stroke="#A89070" strokeWidth="0.5" />
      {/* 顶部阴影 */}
      <rect x="0" y="0" width="16" height="2" fill="#907860" opacity="0.4" />
      {/* 底部边缘 */}
      <rect x="0" y="15" width="16" height="1" fill="#A09070" />
    </svg>
  ),

  /** 侧墙（左） */
  'wall-side-left': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#A09070" />
      {/* 纵向砖缝 */}
      <line x1="0" y1="4" x2="16" y2="4" stroke="#908060" strokeWidth="0.5" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="#908060" strokeWidth="0.5" />
      <line x1="0" y1="12" x2="16" y2="12" stroke="#908060" strokeWidth="0.5" />
      {/* 左侧阴影（光从右来） */}
      <rect x="0" y="0" width="3" height="16" fill="#806850" opacity="0.3" />
      <rect x="0" y="0" width="1" height="16" fill="#706040" opacity="0.5" />
    </svg>
  ),

  /** 侧墙（右） */
  'wall-side-right': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#A09070" />
      {/* 纵向砖缝 */}
      <line x1="0" y1="4" x2="16" y2="4" stroke="#908060" strokeWidth="0.5" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="#908060" strokeWidth="0.5" />
      <line x1="0" y1="12" x2="16" y2="12" stroke="#908060" strokeWidth="0.5" />
      {/* 右侧高光 */}
      <rect x="13" y="0" width="3" height="16" fill="#C0A880" opacity="0.2" />
      <rect x="15" y="0" width="1" height="16" fill="#C8B088" opacity="0.3" />
    </svg>
  ),

  // ----------------------------------------------------------
  // 柜台类（宝可梦中心前台）
  // ----------------------------------------------------------

  /** 柜台左端 */
  'counter-left': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 柜台主体 */}
      <rect x="0" y="2" width="16" height="14" fill="#C85040" rx="2" />
      {/* 台面 */}
      <rect x="0" y="2" width="16" height="4" fill="#D86050" rx="2" />
      {/* 台面高光 */}
      <rect x="1" y="3" width="14" height="1" fill="#E87060" rx="0.5" />
      {/* 左端圆角装饰 */}
      <rect x="0" y="2" width="3" height="14" fill="#B84838" rx="1" />
      {/* 底部阴影 */}
      <rect x="0" y="14" width="16" height="2" fill="#A03828" rx="1" />
    </svg>
  ),

  /** 柜台中段 */
  'counter-center': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 柜台主体 */}
      <rect x="0" y="2" width="16" height="14" fill="#C85040" />
      {/* 台面 */}
      <rect x="0" y="2" width="16" height="4" fill="#D86050" />
      {/* 台面高光 */}
      <rect x="0" y="3" width="16" height="1" fill="#E87060" />
      {/* 正面装饰线 */}
      <rect x="0" y="9" width="16" height="1" fill="#B84838" />
      {/* 精灵球标志 */}
      <circle cx="8" cy="11" r="2.5" fill="#F0F0F0" stroke="#B84838" strokeWidth="0.5" />
      <line x1="5.5" y1="11" x2="10.5" y2="11" stroke="#B84838" strokeWidth="0.5" />
      <circle cx="8" cy="11" r="1" fill="#F8F8F8" stroke="#B84838" strokeWidth="0.3" />
      {/* 底部阴影 */}
      <rect x="0" y="14" width="16" height="2" fill="#A03828" />
    </svg>
  ),

  /** 柜台右端 */
  'counter-right': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 柜台主体 */}
      <rect x="0" y="2" width="16" height="14" fill="#C85040" rx="2" />
      {/* 台面 */}
      <rect x="0" y="2" width="16" height="4" fill="#D86050" rx="2" />
      {/* 台面高光 */}
      <rect x="1" y="3" width="14" height="1" fill="#E87060" rx="0.5" />
      {/* 右端圆角装饰 */}
      <rect x="13" y="2" width="3" height="14" fill="#B84838" rx="1" />
      {/* 底部阴影 */}
      <rect x="0" y="14" width="16" height="2" fill="#A03828" rx="1" />
    </svg>
  ),

  /** 柜台正面 */
  'counter-front': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 柜台正面 */}
      <rect x="0" y="0" width="16" height="16" fill="#C85040" />
      {/* 上缘 */}
      <rect x="0" y="0" width="16" height="2" fill="#D86050" />
      <rect x="0" y="1" width="16" height="1" fill="#E87060" />
      {/* 正面板 */}
      <rect x="1" y="4" width="14" height="8" fill="#B84030" rx="1" />
      {/* 精灵球装饰 */}
      <circle cx="8" cy="8" r="3" fill="#F0F0F0" stroke="#A03020" strokeWidth="0.5" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="#A03020" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="1" fill="#F8F8F8" stroke="#A03020" strokeWidth="0.3" />
      {/* 底部 */}
      <rect x="0" y="14" width="16" height="2" fill="#A03828" />
    </svg>
  ),

  // ----------------------------------------------------------
  // 家具与设备
  // ----------------------------------------------------------

  /** PC 电脑终端 */
  'pc-terminal': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 桌子 */}
      <rect x="2" y="8" width="12" height="8" fill="#8B7355" rx="1" />
      <rect x="2" y="8" width="12" height="2" fill="#9B8365" rx="1" />
      {/* 显示器外壳 */}
      <rect x="3" y="1" width="10" height="9" fill="#405880" rx="1" />
      {/* 屏幕 */}
      <rect x="4" y="2" width="8" height="6" fill="#50A0D0" rx="0.5" />
      {/* 屏幕光效 */}
      <rect x="5" y="3" width="3" height="1" fill="#80C8F0" opacity="0.6" rx="0.3" />
      <rect x="5" y="5" width="6" height="0.5" fill="#60B0E0" opacity="0.4" />
      <rect x="5" y="6" width="4" height="0.5" fill="#60B0E0" opacity="0.4" />
      {/* 显示器底座 */}
      <rect x="6" y="10" width="4" height="2" fill="#304868" rx="0.5" />
      {/* 键盘 */}
      <rect x="4" y="12" width="8" height="2" fill="#383838" rx="0.5" />
      <rect x="5" y="12.5" width="6" height="1" fill="#484848" rx="0.3" />
      {/* 指示灯 */}
      <circle cx="8" cy="8.5" r="0.5" fill="#60FF60" />
    </svg>
  ),

  /** 长椅左半 */
  'bench-left': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 椅腿 */}
      <rect x="2" y="10" width="2" height="5" fill="#6B5B3A" />
      <rect x="13" y="12" width="2" height="3" fill="#6B5B3A" />
      {/* 座面 */}
      <rect x="1" y="8" width="15" height="3" fill="#C8581C" rx="1" />
      <rect x="1" y="8" width="15" height="1.5" fill="#D8682C" rx="1" />
      {/* 靠背 */}
      <rect x="1" y="3" width="3" height="6" fill="#B04818" rx="1" />
      <rect x="2" y="4" width="1.5" height="4" fill="#C05828" rx="0.5" />
      {/* 扶手 */}
      <rect x="1" y="6" width="4" height="2" fill="#A04010" rx="0.5" />
    </svg>
  ),

  /** 长椅右半 */
  'bench-right': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 椅腿 */}
      <rect x="1" y="12" width="2" height="3" fill="#6B5B3A" />
      <rect x="12" y="10" width="2" height="5" fill="#6B5B3A" />
      {/* 座面 */}
      <rect x="0" y="8" width="15" height="3" fill="#C8581C" rx="1" />
      <rect x="0" y="8" width="15" height="1.5" fill="#D8682C" rx="1" />
      {/* 靠背 */}
      <rect x="12" y="3" width="3" height="6" fill="#B04818" rx="1" />
      <rect x="12.5" y="4" width="1.5" height="4" fill="#C05828" rx="0.5" />
      {/* 扶手 */}
      <rect x="11" y="6" width="4" height="2" fill="#A04010" rx="0.5" />
    </svg>
  ),

  /** 盆栽植物 */
  plant: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 花盆 */}
      <polygon points="5,11 11,11 10,16 6,16" fill="#C87040" />
      <rect x="4.5" y="10.5" width="7" height="1.5" fill="#D88050" rx="0.5" />
      {/* 土壤 */}
      <rect x="5.5" y="10.5" width="5" height="1" fill="#604020" rx="0.5" />
      {/* 茎 */}
      <rect x="7.5" y="5" width="1" height="6" fill="#408030" />
      {/* 叶子 */}
      <ellipse cx="5" cy="5" rx="3" ry="2.5" fill="#48A038" transform="rotate(-20, 5, 5)" />
      <ellipse cx="11" cy="5" rx="3" ry="2.5" fill="#48A038" transform="rotate(20, 11, 5)" />
      <ellipse cx="8" cy="3" rx="2.5" ry="2.5" fill="#58B048" />
      {/* 叶片高光 */}
      <ellipse cx="7" cy="2.5" rx="1" ry="0.8" fill="#68C058" opacity="0.6" />
      <ellipse cx="4.5" cy="4.5" rx="1" ry="0.6" fill="#58B048" opacity="0.5" />
    </svg>
  ),

  /** 入口地垫上半 */
  'mat-top': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 地垫 */}
      <rect x="1" y="4" width="14" height="12" fill="#C05030" rx="2" />
      <rect x="2" y="5" width="12" height="10" fill="#D06040" rx="1" />
      {/* 装饰线 */}
      <rect x="3" y="6" width="10" height="1" fill="#E07050" rx="0.5" />
      {/* 精灵球图案 */}
      <circle cx="8" cy="11" r="3" fill="#F0E0D0" opacity="0.3" />
      <line x1="5" y1="11" x2="11" y2="11" stroke="#F0E0D0" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),

  /** 入口地垫下半 */
  'mat-bottom': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 地垫 */}
      <rect x="1" y="0" width="14" height="12" fill="#C05030" rx="2" />
      <rect x="2" y="0" width="12" height="11" fill="#D06040" rx="1" />
      {/* 装饰线 */}
      <rect x="3" y="9" width="10" height="1" fill="#E07050" rx="0.5" />
      {/* 文字 WELCOME */}
      <text x="8" y="6" textAnchor="middle" fill="#F0E0D0" fontSize="2.5" fontFamily="monospace" opacity="0.5">
        WELCOME
      </text>
    </svg>
  ),

  /** 门（左半） */
  'door-left': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 门框 */}
      <rect width="16" height="16" fill="#706050" />
      {/* 门板 */}
      <rect x="1" y="0" width="15" height="16" fill="#8B6914" />
      <rect x="2" y="1" width="13" height="14" fill="#A07B28" />
      {/* 门板纹理 */}
      <rect x="3" y="2" width="11" height="5" fill="#8B6914" rx="0.5" />
      <rect x="3" y="9" width="11" height="5" fill="#8B6914" rx="0.5" />
      {/* 高光 */}
      <rect x="4" y="3" width="9" height="0.5" fill="#B89038" opacity="0.5" />
      <rect x="4" y="10" width="9" height="0.5" fill="#B89038" opacity="0.5" />
    </svg>
  ),

  /** 门（右半） */
  'door-right': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 门框 */}
      <rect width="16" height="16" fill="#706050" />
      {/* 门板 */}
      <rect x="0" y="0" width="15" height="16" fill="#8B6914" />
      <rect x="1" y="1" width="13" height="14" fill="#A07B28" />
      {/* 门板纹理 */}
      <rect x="2" y="2" width="11" height="5" fill="#8B6914" rx="0.5" />
      <rect x="2" y="9" width="11" height="5" fill="#8B6914" rx="0.5" />
      {/* 门把手 */}
      <circle cx="4" cy="8" r="1" fill="#D4A84C" />
      <circle cx="4" cy="8" r="0.5" fill="#E8C060" />
    </svg>
  ),

  /** 治愈机器（宝可梦中心标志性设备） */
  'healing-machine': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 机器基座 */}
      <rect x="2" y="8" width="12" height="8" fill="#E0E0E8" rx="1" />
      <rect x="2" y="8" width="12" height="2" fill="#E8E8F0" rx="1" />
      {/* 机器顶部圆弧 */}
      <ellipse cx="8" cy="6" rx="6" ry="4" fill="#F0F0F8" />
      <ellipse cx="8" cy="6" rx="5.5" ry="3.5" fill="#E8E8F0" />
      {/* 精灵球凹槽（6个） */}
      <circle cx="4.5" cy="5.5" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      <circle cx="8" cy="4.5" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      <circle cx="11.5" cy="5.5" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      <circle cx="4.5" cy="8" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      <circle cx="8" cy="7.5" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      <circle cx="11.5" cy="8" r="1.2" fill="#D0D0D8" stroke="#B0B0B8" strokeWidth="0.3" />
      {/* 指示灯 */}
      <circle cx="8" cy="11" r="1" fill="#50E050" />
      <circle cx="8" cy="11" r="0.5" fill="#80FF80" />
      {/* 底部通风口 */}
      <rect x="4" y="13" width="2" height="0.5" fill="#C0C0C8" rx="0.2" />
      <rect x="7" y="13" width="2" height="0.5" fill="#C0C0C8" rx="0.2" />
      <rect x="10" y="13" width="2" height="0.5" fill="#C0C0C8" rx="0.2" />
    </svg>
  ),

  /** 书架 */
  bookshelf: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 书架主体 */}
      <rect x="1" y="1" width="14" height="15" fill="#7B5B3A" rx="0.5" />
      {/* 隔板 */}
      <rect x="1" y="5" width="14" height="1" fill="#6B4B2A" />
      <rect x="1" y="10" width="14" height="1" fill="#6B4B2A" />
      {/* 顶部装饰 */}
      <rect x="1" y="1" width="14" height="1.5" fill="#8B6B4A" rx="0.5" />
      {/* 第一层书 */}
      <rect x="2" y="2" width="2" height="3" fill="#D04040" rx="0.2" />
      <rect x="4.5" y="2.5" width="1.5" height="2.5" fill="#4060C0" rx="0.2" />
      <rect x="6.5" y="2" width="2" height="3" fill="#40A040" rx="0.2" />
      <rect x="9" y="2.5" width="1.5" height="2.5" fill="#C0A020" rx="0.2" />
      <rect x="11" y="2" width="2.5" height="3" fill="#8040A0" rx="0.2" />
      {/* 第二层书 */}
      <rect x="2" y="6.5" width="1.5" height="3" fill="#C08020" rx="0.2" />
      <rect x="4" y="7" width="2" height="2.5" fill="#2080A0" rx="0.2" />
      <rect x="6.5" y="6.5" width="2.5" height="3" fill="#C04060" rx="0.2" />
      <rect x="9.5" y="7" width="2" height="2.5" fill="#40A060" rx="0.2" />
      <rect x="12" y="6.5" width="1.5" height="3" fill="#6060C0" rx="0.2" />
      {/* 第三层书 */}
      <rect x="2" y="11.5" width="2.5" height="3" fill="#A06030" rx="0.2" />
      <rect x="5" y="12" width="1.5" height="2.5" fill="#3060B0" rx="0.2" />
      <rect x="7" y="11.5" width="2" height="3" fill="#B04050" rx="0.2" />
      <rect x="9.5" y="12" width="2" height="2.5" fill="#20A080" rx="0.2" />
      <rect x="12" y="11.5" width="1.5" height="3" fill="#9050B0" rx="0.2" />
    </svg>
  ),

  /** 交换终端（GTS 风格交换机器） */
  'trade-machine': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 机器基座 */}
      <rect x="2" y="8" width="12" height="8" fill="#4868A0" rx="1" />
      <rect x="2" y="8" width="12" height="2" fill="#5078B0" rx="1" />
      {/* 机器顶部 */}
      <rect x="2" y="1" width="12" height="8" fill="#5078B0" rx="1.5" />
      <rect x="3" y="2" width="10" height="6" fill="#405890" rx="1" />
      {/* 屏幕 */}
      <rect x="4" y="2.5" width="8" height="4.5" fill="#40C8A0" rx="0.5" />
      {/* 屏幕上的交换箭头图标 */}
      <polygon points="5,5 7,3.5 7,4.5 9,4.5 9,3.5 11,5 9,6.5 9,5.5 7,5.5 7,6.5" fill="#F0F8F0" opacity="0.8" />
      {/* 屏幕光效 */}
      <rect x="4.5" y="3" width="3" height="0.5" fill="#60E8C0" opacity="0.5" rx="0.2" />
      {/* 精灵球凹槽（左右两个，代表交换双方） */}
      <circle cx="5.5" cy="10" r="1.5" fill="#D0D0D8" stroke="#3858A0" strokeWidth="0.4" />
      <line x1="4" y1="10" x2="7" y2="10" stroke="#3858A0" strokeWidth="0.3" />
      <circle cx="5.5" cy="10" r="0.5" fill="#F0F0F0" />
      <circle cx="10.5" cy="10" r="1.5" fill="#D0D0D8" stroke="#3858A0" strokeWidth="0.4" />
      <line x1="9" y1="10" x2="12" y2="10" stroke="#3858A0" strokeWidth="0.3" />
      <circle cx="10.5" cy="10" r="0.5" fill="#F0F0F0" />
      {/* 中间交换箭头 */}
      <polygon points="7.2,10 8,9.2 8.8,10 8,10.8" fill="#50E0B0" />
      {/* 指示灯 */}
      <circle cx="8" cy="13" r="0.8" fill="#50E050" />
      <circle cx="8" cy="13" r="0.4" fill="#80FF80" />
      {/* 底部通风口 */}
      <rect x="4" y="14.5" width="2" height="0.5" fill="#3858A0" rx="0.2" />
      <rect x="7" y="14.5" width="2" height="0.5" fill="#3858A0" rx="0.2" />
      <rect x="10" y="14.5" width="2" height="0.5" fill="#3858A0" rx="0.2" />
    </svg>
  ),

  /** 雕像/装饰物 */
  statue: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 底座 */}
      <rect x="3" y="12" width="10" height="4" fill="#808898" rx="0.5" />
      <rect x="3" y="12" width="10" height="1" fill="#909AA8" rx="0.5" />
      <rect x="4" y="10" width="8" height="3" fill="#888A98" rx="0.5" />
      {/* 精灵球雕像 */}
      <circle cx="8" cy="6" r="4.5" fill="#D0D0D8" stroke="#A0A0A8" strokeWidth="0.5" />
      {/* 上半部红色 */}
      <path d="M 3.5 6 A 4.5 4.5 0 0 1 12.5 6 Z" fill="#D85040" />
      {/* 中线 */}
      <line x1="3.5" y1="6" x2="12.5" y2="6" stroke="#404040" strokeWidth="0.8" />
      {/* 中心按钮 */}
      <circle cx="8" cy="6" r="1.5" fill="#F0F0F0" stroke="#404040" strokeWidth="0.5" />
      <circle cx="8" cy="6" r="0.8" fill="#FFFFFF" />
      {/* 高光 */}
      <circle cx="6" cy="4" r="1" fill="#FFFFFF" opacity="0.3" />
    </svg>
  ),

  // ----------------------------------------------------------
  // 道馆专用
  // ----------------------------------------------------------

  /** 道馆地板 */
  'gym-floor': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#686878" />
      {/* 网格纹理 */}
      <line x1="0" y1="8" x2="16" y2="8" stroke="#606070" strokeWidth="0.5" />
      <line x1="8" y1="0" x2="8" y2="16" stroke="#606070" strokeWidth="0.5" />
      {/* 微妙高光 */}
      <rect x="0" y="0" width="8" height="8" fill="#707080" opacity="0.15" />
      <rect x="8" y="8" width="8" height="8" fill="#707080" opacity="0.15" />
      {/* 边缘 */}
      <rect x="15" y="0" width="1" height="16" fill="#585868" opacity="0.5" />
      <rect x="0" y="15" width="16" height="1" fill="#585868" opacity="0.5" />
    </svg>
  ),

  /** 道馆装饰图案 */
  'gym-pattern': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#505068" />
      {/* 十字图案 */}
      <rect x="6" y="0" width="4" height="16" fill="#585878" />
      <rect x="0" y="6" width="16" height="4" fill="#585878" />
      {/* 中心菱形 */}
      <polygon points="8,2 14,8 8,14 2,8" fill="#606080" stroke="#505068" strokeWidth="0.5" />
      <polygon points="8,4 12,8 8,12 4,8" fill="#686898" stroke="#585878" strokeWidth="0.3" />
      {/* 中心 */}
      <circle cx="8" cy="8" r="1.5" fill="#7878A0" />
      <circle cx="8" cy="8" r="0.7" fill="#8888B0" />
    </svg>
  ),

  /** 徽章展示台 */
  'badge-display': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 地板 */}
      <rect width="16" height="16" fill="#686878" />
      {/* 展示台底座 */}
      <rect x="2" y="8" width="12" height="8" fill="#484858" rx="1" />
      <rect x="2" y="8" width="12" height="2" fill="#505060" rx="1" />
      {/* 展示柜玻璃 */}
      <rect x="3" y="2" width="10" height="7" fill="#789CC0" rx="1" opacity="0.5" />
      <rect x="3" y="2" width="10" height="1" fill="#90B0D0" rx="1" opacity="0.3" />
      {/* 徽章排列 */}
      <circle cx="5" cy="5" r="1.2" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3" />
      <circle cx="8" cy="5" r="1.2" fill="#C0C0C0" stroke="#A0A0A0" strokeWidth="0.3" />
      <circle cx="11" cy="5" r="1.2" fill="#CD7F32" stroke="#8B5A2B" strokeWidth="0.3" />
      <circle cx="5" cy="8" r="1.2" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="0.3" />
      <circle cx="8" cy="8" r="1.2" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="0.3" />
      <circle cx="11" cy="8" r="1.2" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="0.3" />
      {/* 标签 */}
      <rect x="4" y="12" width="8" height="2" fill="#383848" rx="0.5" />
      <rect x="5" y="12.5" width="6" height="1" fill="#404050" rx="0.3" />
    </svg>
  ),

  /** 对战区域标记 */
  'arena-marker': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#686878" />
      {/* 精灵球标记 */}
      <circle cx="8" cy="8" r="6" fill="none" stroke="#A0A0C0" strokeWidth="1" />
      <circle cx="8" cy="8" r="4" fill="none" stroke="#A0A0C0" strokeWidth="0.5" />
      {/* 上半部 */}
      <path d="M 2 8 A 6 6 0 0 1 14 8 Z" fill="#C05040" opacity="0.3" />
      {/* 中线 */}
      <line x1="2" y1="8" x2="14" y2="8" stroke="#A0A0C0" strokeWidth="1" />
      {/* 中心 */}
      <circle cx="8" cy="8" r="2" fill="#686878" stroke="#A0A0C0" strokeWidth="0.8" />
      <circle cx="8" cy="8" r="1" fill="#B0B0D0" />
    </svg>
  ),

  // ----------------------------------------------------------
  // 商店专用
  // ----------------------------------------------------------

  /** 商店地板 - 木质地板 */
  'shop-floor': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#C8A878" />
      {/* 木纹 */}
      <rect x="0" y="0" width="16" height="4" fill="#C0A070" />
      <rect x="0" y="4" width="16" height="4" fill="#C8A878" />
      <rect x="0" y="8" width="16" height="4" fill="#C0A070" />
      <rect x="0" y="12" width="16" height="4" fill="#C8A878" />
      {/* 木板间隙 */}
      <line x1="0" y1="4" x2="16" y2="4" stroke="#B09060" strokeWidth="0.3" />
      <line x1="0" y1="8" x2="16" y2="8" stroke="#B09060" strokeWidth="0.3" />
      <line x1="0" y1="12" x2="16" y2="12" stroke="#B09060" strokeWidth="0.3" />
      <line x1="8" y1="0" x2="8" y2="4" stroke="#B89868" strokeWidth="0.2" />
      <line x1="4" y1="4" x2="4" y2="8" stroke="#B89868" strokeWidth="0.2" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="#B89868" strokeWidth="0.2" />
    </svg>
  ),

  /** 商店柜台左端 */
  'shop-counter-left': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="0" y="2" width="16" height="14" fill="#6B5B3A" rx="2" />
      <rect x="0" y="2" width="16" height="4" fill="#8B7355" rx="2" />
      <rect x="1" y="3" width="14" height="1" fill="#9B8365" rx="0.5" />
      <rect x="0" y="2" width="3" height="14" fill="#5B4B2A" rx="1" />
      <rect x="0" y="14" width="16" height="2" fill="#4B3B1A" rx="1" />
    </svg>
  ),

  /** 商店柜台中段 */
  'shop-counter-center': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="0" y="2" width="16" height="14" fill="#6B5B3A" />
      <rect x="0" y="2" width="16" height="4" fill="#8B7355" />
      <rect x="0" y="3" width="16" height="1" fill="#9B8365" />
      {/* 正面装饰 */}
      <rect x="0" y="9" width="16" height="1" fill="#5B4B2A" />
      {/* 金币标志 */}
      <circle cx="8" cy="11" r="2.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
      <text x="8" y="12.2" textAnchor="middle" fill="#8B6914" fontSize="3" fontFamily="monospace" fontWeight="bold">¥</text>
      <rect x="0" y="14" width="16" height="2" fill="#4B3B1A" />
    </svg>
  ),

  /** 商店柜台右端 */
  'shop-counter-right': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="0" y="2" width="16" height="14" fill="#6B5B3A" rx="2" />
      <rect x="0" y="2" width="16" height="4" fill="#8B7355" rx="2" />
      <rect x="1" y="3" width="14" height="1" fill="#9B8365" rx="0.5" />
      <rect x="13" y="2" width="3" height="14" fill="#5B4B2A" rx="1" />
      <rect x="0" y="14" width="16" height="2" fill="#4B3B1A" rx="1" />
    </svg>
  ),

  /** 商店柜台正面 */
  'shop-counter-front': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect x="0" y="0" width="16" height="16" fill="#6B5B3A" />
      <rect x="0" y="0" width="16" height="2" fill="#8B7355" />
      <rect x="0" y="1" width="16" height="1" fill="#9B8365" />
      <rect x="1" y="4" width="14" height="8" fill="#5B4B2A" rx="1" />
      {/* 商品展示格 */}
      <rect x="2" y="5" width="5" height="3" fill="#7B6B4A" rx="0.5" />
      <rect x="9" y="5" width="5" height="3" fill="#7B6B4A" rx="0.5" />
      <rect x="2" y="9" width="5" height="2" fill="#7B6B4A" rx="0.5" />
      <rect x="9" y="9" width="5" height="2" fill="#7B6B4A" rx="0.5" />
      <rect x="0" y="14" width="16" height="2" fill="#4B3B1A" />
    </svg>
  ),

  /** 商品货架 - 药品类 */
  'shelf-potions': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#C8A878" />
      {/* 货架主体 */}
      <rect x="1" y="1" width="14" height="15" fill="#7B5B3A" rx="0.5" />
      <rect x="1" y="5" width="14" height="1" fill="#6B4B2A" />
      <rect x="1" y="10" width="14" height="1" fill="#6B4B2A" />
      <rect x="1" y="1" width="14" height="1.5" fill="#8B6B4A" rx="0.5" />
      {/* 第一层 - 药水瓶 */}
      <rect x="2.5" y="2.5" width="2" height="2.5" fill="#A060D0" rx="0.5" />
      <rect x="3" y="2" width="1" height="0.8" fill="#B070E0" rx="0.3" />
      <rect x="5.5" y="2.5" width="2" height="2.5" fill="#60A0D0" rx="0.5" />
      <rect x="6" y="2" width="1" height="0.8" fill="#70B0E0" rx="0.3" />
      <rect x="8.5" y="2.5" width="2" height="2.5" fill="#D0A060" rx="0.5" />
      <rect x="9" y="2" width="1" height="0.8" fill="#E0B070" rx="0.3" />
      <rect x="11.5" y="2.5" width="2" height="2.5" fill="#60D0A0" rx="0.5" />
      <rect x="12" y="2" width="1" height="0.8" fill="#70E0B0" rx="0.3" />
      {/* 第二层 - 较大药瓶 */}
      <rect x="3" y="6.5" width="2.5" height="3" fill="#D06060" rx="0.5" />
      <rect x="3.5" y="6" width="1.5" height="1" fill="#E07070" rx="0.3" />
      <rect x="7" y="6.5" width="2.5" height="3" fill="#6060D0" rx="0.5" />
      <rect x="7.5" y="6" width="1.5" height="1" fill="#7070E0" rx="0.3" />
      <rect x="11" y="6.5" width="2.5" height="3" fill="#60D060" rx="0.5" />
      <rect x="11.5" y="6" width="1.5" height="1" fill="#70E070" rx="0.3" />
      {/* 第三层 - 小盒子 */}
      <rect x="2.5" y="11.5" width="3" height="2.5" fill="#E8D8C0" rx="0.3" />
      <rect x="6.5" y="11.5" width="3" height="2.5" fill="#D8C8B0" rx="0.3" />
      <rect x="10.5" y="11.5" width="3" height="2.5" fill="#E8D8C0" rx="0.3" />
    </svg>
  ),

  /** 商品货架 - 精灵球类 */
  'shelf-pokeballs': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#C8A878" />
      {/* 货架主体 */}
      <rect x="1" y="1" width="14" height="15" fill="#7B5B3A" rx="0.5" />
      <rect x="1" y="5" width="14" height="1" fill="#6B4B2A" />
      <rect x="1" y="10" width="14" height="1" fill="#6B4B2A" />
      <rect x="1" y="1" width="14" height="1.5" fill="#8B6B4A" rx="0.5" />
      {/* 第一层 - 精灵球 */}
      <circle cx="4" cy="3.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 2.7 3.5 A 1.3 1.3 0 0 1 5.3 3.5 Z" fill="#E05040" />
      <line x1="2.7" y1="3.5" x2="5.3" y2="3.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="4" cy="3.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="8" cy="3.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 6.7 3.5 A 1.3 1.3 0 0 1 9.3 3.5 Z" fill="#E05040" />
      <line x1="6.7" y1="3.5" x2="9.3" y2="3.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="8" cy="3.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="12" cy="3.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 10.7 3.5 A 1.3 1.3 0 0 1 13.3 3.5 Z" fill="#E05040" />
      <line x1="10.7" y1="3.5" x2="13.3" y2="3.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="12" cy="3.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      {/* 第二层 - 超级球 */}
      <circle cx="4" cy="8" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 2.7 8 A 1.3 1.3 0 0 1 5.3 8 Z" fill="#4080D0" />
      <line x1="2.7" y1="8" x2="5.3" y2="8" stroke="#404040" strokeWidth="0.3" />
      <circle cx="4" cy="8" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="8" cy="8" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 6.7 8 A 1.3 1.3 0 0 1 9.3 8 Z" fill="#4080D0" />
      <line x1="6.7" y1="8" x2="9.3" y2="8" stroke="#404040" strokeWidth="0.3" />
      <circle cx="8" cy="8" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="12" cy="8" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 10.7 8 A 1.3 1.3 0 0 1 13.3 8 Z" fill="#4080D0" />
      <line x1="10.7" y1="8" x2="13.3" y2="8" stroke="#404040" strokeWidth="0.3" />
      <circle cx="12" cy="8" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      {/* 第三层 - 高级球 */}
      <circle cx="4" cy="12.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 2.7 12.5 A 1.3 1.3 0 0 1 5.3 12.5 Z" fill="#F0D040" />
      <line x1="2.7" y1="12.5" x2="5.3" y2="12.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="4" cy="12.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="8" cy="12.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 6.7 12.5 A 1.3 1.3 0 0 1 9.3 12.5 Z" fill="#F0D040" />
      <line x1="6.7" y1="12.5" x2="9.3" y2="12.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="8" cy="12.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
      <circle cx="12" cy="12.5" r="1.3" fill="#F0F0F0" stroke="#808080" strokeWidth="0.3" />
      <path d="M 10.7 12.5 A 1.3 1.3 0 0 1 13.3 12.5 Z" fill="#F0D040" />
      <line x1="10.7" y1="12.5" x2="13.3" y2="12.5" stroke="#404040" strokeWidth="0.3" />
      <circle cx="12" cy="12.5" r="0.4" fill="#F8F8F8" stroke="#404040" strokeWidth="0.2" />
    </svg>
  ),

  /** 收银台 */
  'cash-register': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#C8A878" />
      {/* 桌面 */}
      <rect x="2" y="8" width="12" height="8" fill="#8B7355" rx="1" />
      <rect x="2" y="8" width="12" height="2" fill="#9B8365" rx="1" />
      {/* 收银机主体 */}
      <rect x="3" y="2" width="10" height="8" fill="#505860" rx="1" />
      {/* 屏幕 */}
      <rect x="4" y="3" width="8" height="3" fill="#80D080" rx="0.5" />
      {/* 屏幕文字 */}
      <text x="8" y="5.2" textAnchor="middle" fill="#408040" fontSize="2" fontFamily="monospace">¥0000</text>
      {/* 按键 */}
      <rect x="4" y="7" width="2" height="1.5" fill="#404850" rx="0.3" />
      <rect x="7" y="7" width="2" height="1.5" fill="#404850" rx="0.3" />
      <rect x="10" y="7" width="2" height="1.5" fill="#D04040" rx="0.3" />
      {/* 钱箱 */}
      <rect x="4" y="11" width="8" height="2" fill="#404850" rx="0.5" />
      <rect x="6" y="11.5" width="4" height="1" fill="#505860" rx="0.3" />
    </svg>
  ),

  /** 商店招牌 */
  'shop-sign': (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <rect width="16" height="16" fill="#C8A878" />
      {/* 墙壁背景 */}
      <rect x="0" y="0" width="16" height="16" fill="#B8A080" />
      {/* 招牌板 */}
      <rect x="2" y="3" width="12" height="8" fill="#4870A0" rx="1" />
      <rect x="2.5" y="3.5" width="11" height="7" fill="#5080B0" rx="0.8" />
      {/* 边框装饰 */}
      <rect x="3" y="4" width="10" height="6" fill="none" stroke="#FFD700" strokeWidth="0.5" rx="0.5" />
      {/* SHOP 文字 */}
      <text x="8" y="8" textAnchor="middle" fill="#FFD700" fontSize="3.5" fontFamily="monospace" fontWeight="bold">SHOP</text>
      {/* 顶部砖缝 */}
      <rect x="0" y="0" width="16" height="2" fill="#907860" opacity="0.4" />
    </svg>
  ),

  /** 柱子 */
  pillar: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 透明背景（柱子可叠加在其他地板上） */}
      <rect width="16" height="16" fill="#E8D4B8" />
      {/* 柱顶 */}
      <rect x="2" y="0" width="12" height="3" fill="#C0C0C8" rx="1" />
      <rect x="2" y="0" width="12" height="1.5" fill="#D0D0D8" rx="1" />
      {/* 柱身 */}
      <rect x="4" y="3" width="8" height="10" fill="#B8B8C0" />
      {/* 柱身阴影和高光 */}
      <rect x="4" y="3" width="2" height="10" fill="#A8A8B0" opacity="0.5" />
      <rect x="7" y="3" width="2" height="10" fill="#C8C8D0" opacity="0.3" />
      {/* 柱底 */}
      <rect x="2" y="13" width="12" height="3" fill="#C0C0C8" rx="1" />
      <rect x="2" y="14" width="12" height="1.5" fill="#A8A8B0" rx="1" />
    </svg>
  ),
};
