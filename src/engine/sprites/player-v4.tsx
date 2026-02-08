import { renderSpriteFrame } from './spritesheet';
import type { Direction } from '../types';

const SPRITE_URL = '/sprites/player/adventurer_red.png';

export function getPlayerSprite(
  direction: Direction,
  frame: number,
  size: number
) {
  return renderSpriteFrame(SPRITE_URL, direction, frame, size);
}
