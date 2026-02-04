// ============================================================
// 2D 游戏引擎 - 统一导出
// ============================================================

// 类型
export type {
  Direction,
  GridPosition,
  PixelPosition,
  TileDef,
  TileLayer,
  MapData,
  NPCData,
  InteractionZone,
  PlayerState,
  WorldState,
  InteractionResult,
} from './types';

// 常量
export {
  TILE_SIZE,
  MOVE_DURATION,
  WALK_FRAME_COUNT,
  WALK_FRAME_INTERVAL,
  INTERACTION_KEY,
  JOYSTICK_DEAD_ZONE,
  JOYSTICK_SIZE,
  JOYSTICK_KNOB_SIZE,
  DIRECTION_VECTORS,
} from './constants';

// Hooks
export { useGameLoop } from './hooks/useGameLoop';
export { useGridMovement } from './hooks/useGridMovement';
export { useCamera } from './hooks/useCamera';
export { useKeyboard } from './hooks/useKeyboard';
export { useInteraction } from './hooks/useInteraction';

// 精灵
export { tileRenderers } from './sprites/tiles';
export { getPlayerSprite } from './sprites/player';
export { getNPCSprite } from './sprites/npcs';

// 组件
export { TileMapRenderer } from './components/TileMapRenderer';
export { PlayerSprite } from './components/PlayerSprite';
export { NPCSprite } from './components/NPCSprite';
export { VirtualJoystick } from './components/VirtualJoystick';
export { DialogBox } from './components/DialogBox';
export { GameWorld } from './components/GameWorld';

// 场景
export { PokemonCenterScene } from './scenes/PokemonCenterScene';
export { GymScene } from './scenes/GymScene';
