import { renderSpriteFrame } from './spritesheet';
import type { Direction } from '../types';

const NPC_SPRITES: Record<string, string> = {
  'nurse-joy': '/sprites/npcs/nurse-joy.png',
  'gym-leader': '/sprites/npcs/gym-leader.png',
  'trainer-male': '/sprites/npcs/trainer-male.png',
  'trainer-female': '/sprites/npcs/trainer-female.png',
  'old-man': '/sprites/npcs/old-man.png',
  'shopkeeper': '/sprites/npcs/shopkeeper.png',
};

const FALLBACK_SPRITE = '/sprites/npcs/trainer-male.png';

export function getNPCSprite(
  spriteId: string,
  direction: Direction,
  size: number
) {
  const url = NPC_SPRITES[spriteId] ?? FALLBACK_SPRITE;
  return renderSpriteFrame(url, direction, 0, size);
}
