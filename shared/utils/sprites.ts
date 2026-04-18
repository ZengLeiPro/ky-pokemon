/**
 * 宝可梦精灵图工具函数
 */

/**
 * 获取宝可梦背面精灵图 URL
 * 统一使用心金魂银（HGSS）背面精灵 —— 覆盖 #1-493，图像清晰
 */
export function getBackSpriteUrl(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/${pokedexId}.png`;
}

/**
 * 获取宝可梦背面精灵图的降级 URL（主选加载失败时使用）
 * 使用最基础的默认背面精灵作为兜底
 */
export function getBackSpriteFallbackUrl(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokedexId}.png`;
}
