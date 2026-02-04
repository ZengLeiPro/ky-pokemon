// ============================================================
// 2D 游戏引擎常量
// ============================================================

/** 基础瓦片像素大小 */
export const TILE_SIZE = 48;

/** 移动一格的毫秒数 */
export const MOVE_DURATION = 180;

/** 走路动画帧数 (静止, 左脚, 右脚) */
export const WALK_FRAME_COUNT = 3;

/** 走路动画帧切换间隔 ms */
export const WALK_FRAME_INTERVAL = 120;

/** 交互键 (键盘) */
export const INTERACTION_KEY = 'z';

/** 摇杆死区比例 */
export const JOYSTICK_DEAD_ZONE = 0.3;

/** 摇杆区域直径 */
export const JOYSTICK_SIZE = 120;

/** 摇杆旋钮直径 */
export const JOYSTICK_KNOB_SIZE = 50;

/** 方向向量映射 */
export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const;
