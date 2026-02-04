// ============================================================
// NPC SVG 精灵 - 宝可梦风格 NPC 角色
// ============================================================

import type { JSX } from 'react';
import type { Direction } from '../types';

/**
 * 获取 NPC 精灵 SVG。
 * 每个 NPC 只有正面（down）方向的静止帧。
 * 如果 direction 不是 down，仍返回正面朝向（简化实现）。
 *
 * @param spriteId - NPC 精灵标识
 * @param _direction - 面朝方向（当前仅支持 down，保留参数以便扩展）
 * @param size - 像素大小
 */
export function getNPCSprite(
  spriteId: string,
  _direction: Direction,
  size: number,
): JSX.Element {
  const renderer = npcRenderers[spriteId];
  if (renderer) {
    return renderer(size);
  }
  // 未知 NPC 使用默认精灵
  return renderDefault(size);
}

// NPC 渲染函数集合
const npcRenderers: Record<string, (size: number) => JSX.Element> = {
  'nurse-joy': renderNurseJoy,
  'gym-leader': renderGymLeader,
  'trainer-male': renderTrainerMale,
  'trainer-female': renderTrainerFemale,
  'old-man': renderOldMan,
};

/** 乔伊小姐 - 粉色头发，白色护士服 */
function renderNurseJoy(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 护士帽 */}
      <rect x="4" y="0.5" width="8" height="2.5" fill="#F8F8F8" rx="1" />
      {/* 十字标志 */}
      <rect x="7" y="0.8" width="2" height="2" fill="#E05050" rx="0.2" />
      <rect x="6.2" y="1.3" width="3.6" height="1" fill="#E05050" rx="0.2" />

      {/* 粉色头发 */}
      <rect x="3.5" y="2.5" width="9" height="4" fill="#F080A0" rx="1" />
      {/* 头发卷 */}
      <ellipse cx="4" cy="5" rx="1.5" ry="2" fill="#E87090" />
      <ellipse cx="12" cy="5" rx="1.5" ry="2" fill="#E87090" />
      <rect x="4.5" y="2.5" width="7" height="2" fill="#F890B0" rx="0.5" />

      {/* 脸 */}
      <rect x="5" y="4" width="6" height="3.5" fill="#F8D0A8" rx="0.5" />

      {/* 眼睛 */}
      <ellipse cx="6.5" cy="5.5" rx="0.8" ry="0.9" fill="#4080C0" />
      <ellipse cx="9.5" cy="5.5" rx="0.8" ry="0.9" fill="#4080C0" />
      {/* 眼睛高光 */}
      <circle cx="6.8" cy="5.2" r="0.3" fill="#F8F8F8" />
      <circle cx="9.8" cy="5.2" r="0.3" fill="#F8F8F8" />

      {/* 微笑 */}
      <path d="M 7 7 Q 8 7.8 9 7" fill="none" stroke="#C08060" strokeWidth="0.3" />

      {/* 白色护士服 */}
      <rect x="4" y="7.5" width="8" height="4.5" fill="#F8F8F8" rx="0.5" />
      {/* 衣服细节 */}
      <line x1="8" y1="7.5" x2="8" y2="12" stroke="#E0E0E0" strokeWidth="0.4" />
      {/* 围裙/领结 */}
      <path d="M 6.5 7.5 L 8 8.5 L 9.5 7.5" fill="#E05050" />

      {/* 手臂 */}
      <rect x="3" y="8" width="1.5" height="3" fill="#F8F8F8" rx="0.5" />
      <rect x="11.5" y="8" width="1.5" height="3" fill="#F8F8F8" rx="0.5" />
      {/* 手 */}
      <rect x="3" y="10.5" width="1.5" height="1" fill="#F8D0A8" rx="0.3" />
      <rect x="11.5" y="10.5" width="1.5" height="1" fill="#F8D0A8" rx="0.3" />

      {/* 裙子 */}
      <polygon points="4,12 12,12 13,16 3,16" fill="#F8F8F8" />
      <line x1="8" y1="12" x2="8" y2="16" stroke="#E0E0E0" strokeWidth="0.3" />

      {/* 鞋子 */}
      <rect x="4" y="15" width="3" height="1" fill="#F08090" rx="0.3" />
      <rect x="9" y="15" width="3" height="1" fill="#F08090" rx="0.3" />
    </svg>
  );
}

/** 道馆馆主 - 深色服装，威严 */
function renderGymLeader(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 头发（刺猬头/短发） */}
      <polygon points="3,5 5,1 7,3 8,0.5 9,3 11,1 13,5" fill="#303040" />
      <rect x="4" y="3" width="8" height="3" fill="#383848" rx="0.5" />

      {/* 脸 */}
      <rect x="5" y="4" width="6" height="4" fill="#E8B880" rx="0.5" />
      <rect x="5" y="7" width="6" height="1" fill="#D0A068" rx="0.3" />

      {/* 眉毛（粗，表示严肃） */}
      <rect x="5.5" y="4.8" width="2" height="0.6" fill="#303040" rx="0.2" />
      <rect x="8.5" y="4.8" width="2" height="0.6" fill="#303040" rx="0.2" />

      {/* 眼睛 */}
      <rect x="6" y="5.5" width="1.2" height="1" fill="#202020" rx="0.3" />
      <rect x="8.8" y="5.5" width="1.2" height="1" fill="#202020" rx="0.3" />
      <rect x="6.5" y="5.5" width="0.4" height="0.4" fill="#F8F8F8" rx="0.2" />
      <rect x="9.3" y="5.5" width="0.4" height="0.4" fill="#F8F8F8" rx="0.2" />

      {/* 嘴（严肃表情） */}
      <line x1="7" y1="7.2" x2="9" y2="7.2" stroke="#905838" strokeWidth="0.4" />

      {/* 衣领/披风 */}
      <polygon points="3,8 8,10 13,8 13,9 8,11 3,9" fill="#282838" />

      {/* 深色上衣 */}
      <rect x="4" y="8" width="8" height="4" fill="#383848" rx="0.5" />
      {/* 胸前徽章 */}
      <polygon points="8,9 9,10 8.5,11 7.5,11 7,10" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3" />

      {/* 手臂 */}
      <rect x="2.5" y="8.5" width="2" height="3.5" fill="#383848" rx="0.5" />
      <rect x="11.5" y="8.5" width="2" height="3.5" fill="#383848" rx="0.5" />
      {/* 手 */}
      <rect x="2.5" y="11.5" width="2" height="1" fill="#E8B880" rx="0.3" />
      <rect x="11.5" y="11.5" width="2" height="1" fill="#E8B880" rx="0.3" />

      {/* 裤子 */}
      <rect x="4.5" y="12" width="3" height="2.5" fill="#282838" rx="0.3" />
      <rect x="8.5" y="12" width="3" height="2.5" fill="#282838" rx="0.3" />

      {/* 靴子 */}
      <rect x="4" y="14" width="3.5" height="2" fill="#202028" rx="0.5" />
      <rect x="8.5" y="14" width="3.5" height="2" fill="#202028" rx="0.5" />
    </svg>
  );
}

/** 男训练师 */
function renderTrainerMale(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子（绿色） */}
      <rect x="4" y="1" width="8" height="2.5" fill="#40A040" rx="1" />
      <rect x="3" y="3" width="10" height="1.5" fill="#40A040" rx="0.5" />
      <rect x="4" y="1" width="3" height="1.5" fill="#308030" rx="0.5" />

      {/* 头发 */}
      <rect x="4" y="3.5" width="1.5" height="2" fill="#604020" />
      <rect x="10.5" y="3.5" width="1.5" height="2" fill="#604020" />

      {/* 脸 */}
      <rect x="5" y="4" width="6" height="3.5" fill="#F8C890" rx="0.5" />

      {/* 眼睛 */}
      <rect x="6" y="5.5" width="1" height="1" fill="#202020" rx="0.3" />
      <rect x="9" y="5.5" width="1" height="1" fill="#202020" rx="0.3" />
      <rect x="6.5" y="5.5" width="0.4" height="0.4" fill="#F8F8F8" rx="0.2" />
      <rect x="9.5" y="5.5" width="0.4" height="0.4" fill="#F8F8F8" rx="0.2" />

      {/* 笑脸 */}
      <path d="M 7 7 Q 8 7.6 9 7" fill="none" stroke="#B08060" strokeWidth="0.3" />

      {/* 绿色上衣 */}
      <rect x="4" y="7.5" width="8" height="4" fill="#48B048" rx="0.5" />
      <rect x="6.5" y="7.5" width="3" height="1" fill="#308030" rx="0.3" />

      {/* 手臂 */}
      <rect x="3" y="8" width="1.5" height="3" fill="#48B048" rx="0.5" />
      <rect x="11.5" y="8" width="1.5" height="3" fill="#48B048" rx="0.5" />
      <rect x="3" y="10.5" width="1.5" height="1" fill="#F8C890" rx="0.3" />
      <rect x="11.5" y="10.5" width="1.5" height="1" fill="#F8C890" rx="0.3" />

      {/* 裤子 */}
      <rect x="4.5" y="11.5" width="3" height="2.5" fill="#505050" rx="0.3" />
      <rect x="8.5" y="11.5" width="3" height="2.5" fill="#505050" rx="0.3" />

      {/* 鞋子 */}
      <rect x="4" y="14" width="3.5" height="2" fill="#404040" rx="0.5" />
      <rect x="8.5" y="14" width="3.5" height="2" fill="#404040" rx="0.5" />
    </svg>
  );
}

/** 女训练师 */
function renderTrainerFemale(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 帽子（白色带蝴蝶结） */}
      <rect x="3.5" y="1" width="9" height="2.5" fill="#F8F8F8" rx="1" />
      <rect x="3" y="3" width="10" height="1" fill="#F8F8F8" rx="0.5" />
      {/* 蝴蝶结 */}
      <polygon points="10,1.5 12.5,0.5 12,2 12.5,3 10,2.5" fill="#E06080" />
      <circle cx="10" cy="2" r="0.5" fill="#C05070" />

      {/* 长发 */}
      <rect x="3.5" y="3" width="9" height="5" fill="#C08030" rx="1" />
      <rect x="3" y="4" width="2" height="5" fill="#B07028" rx="0.5" />
      <rect x="11" y="4" width="2" height="5" fill="#B07028" rx="0.5" />

      {/* 脸 */}
      <rect x="5" y="4" width="6" height="3.5" fill="#F8D0A8" rx="0.5" />

      {/* 眼睛（较大，可爱风） */}
      <ellipse cx="6.5" cy="5.5" rx="0.9" ry="1" fill="#4080C0" />
      <ellipse cx="9.5" cy="5.5" rx="0.9" ry="1" fill="#4080C0" />
      <circle cx="6.8" cy="5.2" r="0.3" fill="#F8F8F8" />
      <circle cx="9.8" cy="5.2" r="0.3" fill="#F8F8F8" />

      {/* 微笑 */}
      <path d="M 7 7 Q 8 7.8 9 7" fill="none" stroke="#C08060" strokeWidth="0.3" />

      {/* 上衣（红色） */}
      <rect x="4" y="8" width="8" height="3" fill="#E05060" rx="0.5" />
      <rect x="6.5" y="8" width="3" height="1" fill="#C04050" rx="0.3" />

      {/* 手臂 */}
      <rect x="3" y="8.5" width="1.5" height="2.5" fill="#E05060" rx="0.5" />
      <rect x="11.5" y="8.5" width="1.5" height="2.5" fill="#E05060" rx="0.5" />
      <rect x="3" y="10.5" width="1.5" height="1" fill="#F8D0A8" rx="0.3" />
      <rect x="11.5" y="10.5" width="1.5" height="1" fill="#F8D0A8" rx="0.3" />

      {/* 裙子 */}
      <polygon points="4,11 12,11 13.5,16 2.5,16" fill="#4080C0" />
      <line x1="8" y1="11" x2="8" y2="16" stroke="#3070B0" strokeWidth="0.3" />

      {/* 鞋子 */}
      <rect x="4" y="15" width="3" height="1" fill="#E05060" rx="0.3" />
      <rect x="9" y="15" width="3" height="1" fill="#E05060" rx="0.3" />
    </svg>
  );
}

/** 老人 NPC */
function renderOldMan(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 光头（上部） */}
      <ellipse cx="8" cy="3.5" rx="4" ry="3" fill="#E8C098" />

      {/* 白色侧发 */}
      <rect x="3.5" y="4" width="2" height="3" fill="#D8D8D8" rx="0.5" />
      <rect x="10.5" y="4" width="2" height="3" fill="#D8D8D8" rx="0.5" />

      {/* 脸 */}
      <rect x="5" y="4" width="6" height="4" fill="#E8C098" rx="0.5" />

      {/* 眉毛（浓密） */}
      <rect x="5.5" y="4.5" width="2" height="0.8" fill="#A0A0A0" rx="0.3" />
      <rect x="8.5" y="4.5" width="2" height="0.8" fill="#A0A0A0" rx="0.3" />

      {/* 眼睛（眯缝眼，慈祥） */}
      <line x1="6" y1="5.8" x2="7.2" y2="5.8" stroke="#303030" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="8.8" y1="5.8" x2="10" y2="5.8" stroke="#303030" strokeWidth="0.6" strokeLinecap="round" />

      {/* 胡子 */}
      <ellipse cx="8" cy="7.5" rx="2.5" ry="1.2" fill="#D0D0D0" />

      {/* 上衣（棕色传统服装） */}
      <rect x="4" y="8" width="8" height="4" fill="#8B6B3A" rx="0.5" />
      {/* 衣领 */}
      <path d="M 6 8 L 8 9.5 L 10 8" fill="none" stroke="#7B5B2A" strokeWidth="0.5" />
      {/* 腰带 */}
      <rect x="4" y="11" width="8" height="1" fill="#6B4B1A" rx="0.3" />

      {/* 手臂 */}
      <rect x="3" y="8.5" width="1.5" height="3" fill="#8B6B3A" rx="0.5" />
      <rect x="11.5" y="8.5" width="1.5" height="3" fill="#8B6B3A" rx="0.5" />
      {/* 手（握拐杖） */}
      <rect x="2.5" y="11" width="2" height="1" fill="#E8C098" rx="0.3" />
      <rect x="11.5" y="11" width="2" height="1" fill="#E8C098" rx="0.3" />

      {/* 拐杖 */}
      <rect x="2.8" y="8" width="0.8" height="8" fill="#6B4B1A" rx="0.3" />
      <rect x="2" y="7.5" width="2.5" height="1" fill="#7B5B2A" rx="0.3" />

      {/* 裤子 */}
      <rect x="4.5" y="12" width="3" height="2.5" fill="#7B5B2A" rx="0.3" />
      <rect x="8.5" y="12" width="3" height="2.5" fill="#7B5B2A" rx="0.3" />

      {/* 鞋子 */}
      <rect x="4" y="14" width="3.5" height="2" fill="#504030" rx="0.5" />
      <rect x="8.5" y="14" width="3.5" height="2" fill="#504030" rx="0.5" />
    </svg>
  );
}

/** 默认/未知 NPC 精灵 */
function renderDefault(size: number): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      {/* 简单的人形轮廓 */}
      <circle cx="8" cy="4" r="2.5" fill="#A0A0A0" />
      <rect x="5" y="6.5" width="6" height="5" fill="#808080" rx="1" />
      <rect x="3.5" y="7" width="2" height="3" fill="#808080" rx="0.5" />
      <rect x="10.5" y="7" width="2" height="3" fill="#808080" rx="0.5" />
      <rect x="5" y="11.5" width="2.5" height="3" fill="#707070" rx="0.3" />
      <rect x="8.5" y="11.5" width="2.5" height="3" fill="#707070" rx="0.3" />
      {/* 问号（未知角色） */}
      <text x="8" y="5" textAnchor="middle" fill="#F0F0F0" fontSize="3" fontFamily="monospace">?</text>
    </svg>
  );
}
