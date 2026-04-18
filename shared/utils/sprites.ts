/**
 * 宝可梦精灵图工具函数
 */

/**
 * 获取宝可梦背面精灵图 URL
 * - #1-151：使用火红叶绿（FRLG）背面精灵
 * - #152-251：使用红宝石蓝宝石（RS）背面精灵
 * - #252+：使用默认背面精灵
 */
export function getBackSpriteUrl(pokedexId: number): string {
  if (pokedexId >= 1 && pokedexId <= 151) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/back/${pokedexId}.png`;
  }
  if (pokedexId >= 152 && pokedexId <= 251) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/back/${pokedexId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokedexId}.png`;
}
