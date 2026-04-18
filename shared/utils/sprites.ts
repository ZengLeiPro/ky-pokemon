/**
 * 宝可梦精灵图工具函数
 */

/**
 * 获取宝可梦背面精灵图 URL（主选）
 * - #1-151：使用火红叶绿（FRLG）背面精灵
 * - #152-251：使用心金魂银（HGSS）背面精灵
 * - #252+：使用心金魂银背面精灵（HGSS 覆盖到 #493）
 */
export function getBackSpriteUrl(pokedexId: number): string {
  if (pokedexId >= 1 && pokedexId <= 151) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/back/${pokedexId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/${pokedexId}.png`;
}

/**
 * 获取宝可梦背面精灵图的降级 URL（主选加载失败时使用）
 * 统一使用心金魂银（HGSS）作为兜底 —— 它覆盖 #1-493，图像清晰可靠
 */
export function getBackSpriteFallbackUrl(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/${pokedexId}.png`;
}
