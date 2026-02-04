// ============================================================
// 2D 游戏引擎核心类型定义
// ============================================================

/** 方向 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 网格坐标（列/行） */
export interface GridPosition {
  /** 列 */
  x: number;
  /** 行 */
  y: number;
}

/** 像素坐标（用于动画过渡） */
export interface PixelPosition {
  x: number;
  y: number;
}

/** 瓦片定义 */
export interface TileDef {
  id: string;
  walkable: boolean;
  // SVG 渲染由 tile id 映射到具体渲染函数
}

/** 地图层：二维数组，每个元素为 tile id 或 null（透明） */
export type TileLayer = (string | null)[][];

/** 地图数据 */
export interface MapData {
  id: string;
  name: string;
  /** 列数 */
  width: number;
  /** 行数 */
  height: number;
  layers: {
    /** 地面层 */
    ground: TileLayer;
    /** 物体层 */
    objects: TileLayer;
    /** 头顶层（渲染在玩家上方） */
    overhead: TileLayer;
  };
  /** 碰撞图：true = 不可通行 */
  collisionMap: boolean[][];
  /** 命名出生点 */
  spawns: Record<string, GridPosition>;
  npcs: NPCData[];
  interactions: InteractionZone[];
}

/** NPC 数据 */
export interface NPCData {
  id: string;
  name: string;
  position: GridPosition;
  direction: Direction;
  spriteId: string;
  /** 对话文本数组，逐条显示 */
  dialog: string[];
  /** 交互回调标识（如 'heal', 'open-pc', 'battle'） */
  onInteract?: string;
}

/** 交互区域（门、传送点等） */
export interface InteractionZone {
  id: string;
  position: GridPosition;
  type: 'door' | 'warp' | 'sign' | 'item';
  /** 目标场景 ID */
  targetScene?: string;
  /** 目标出生点 */
  targetSpawn?: string;
  /** 标牌文字 / 提示信息 */
  message?: string;
  /** 交互回调标识（如 'open-pc'） */
  onInteract?: string;
}

/** 玩家状态 */
export interface PlayerState {
  position: GridPosition;
  pixelPosition: PixelPosition;
  direction: Direction;
  isMoving: boolean;
  /** 走路动画帧：0 = 静止, 1 = 左脚, 2 = 右脚 */
  walkFrame: number;
}

/** 游戏世界状态 */
export interface WorldState {
  currentScene: string;
  player: PlayerState;
  dialogActive: boolean;
  dialogText: string[];
  dialogIndex: number;
  dialogCallback?: string;
}

/** 交互结果 */
export interface InteractionResult {
  type: 'npc' | 'zone';
  /** 对应 NPC 或交互区域 */
  npc?: NPCData;
  zone?: InteractionZone;
}
