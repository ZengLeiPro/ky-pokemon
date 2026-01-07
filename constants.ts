import { LocationData, Move, Pokemon, PokemonType } from './types';

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Grass: '#7AC74C',
  Electric: '#F7D02C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Steel: '#B7B7CE',
  Dark: '#705746',
  Fairy: '#D685AD',
};

export const TYPE_TRANSLATIONS: Record<PokemonType, string> = {
  Normal: '一般',
  Fire: '火',
  Water: '水',
  Grass: '草',
  Electric: '电',
  Ice: '冰',
  Fighting: '格斗',
  Poison: '毒',
  Ground: '地面',
  Flying: '飞行',
  Psychic: '超能',
  Bug: '虫',
  Rock: '岩石',
  Ghost: '幽灵',
  Dragon: '龙',
  Steel: '钢',
  Dark: '恶',
  Fairy: '妖精',
};

// Mock Moves
export const MOVES: Record<string, Move> = {
  tackle: { id: 'tackle', name: '撞击', type: 'Normal', category: 'Physical', power: 40, accuracy: 100, ppMax: 35, description: '用整个身体撞向对手进行攻击。' },
  ember: { id: 'ember', name: '火花', type: 'Fire', category: 'Special', power: 40, accuracy: 100, ppMax: 25, description: '向对手发射小型的火焰进行攻击。有时会让对手陷入灼伤状态。' },
  vineWhip: { id: 'vineWhip', name: '藤鞭', type: 'Grass', category: 'Physical', power: 45, accuracy: 100, ppMax: 25, description: '用鞭子般细长的藤蔓抽打对手进行攻击。' },
  waterGun: { id: 'waterGun', name: '水枪', type: 'Water', category: 'Special', power: 40, accuracy: 100, ppMax: 25, description: '向对手喷射水流进行攻击。' },
  scratch: { id: 'scratch', name: '抓', type: 'Normal', category: 'Physical', power: 40, accuracy: 100, ppMax: 35, description: '用坚硬且锋利的爪子抓挠对手进行攻击。' },
  growl: { id: 'growl', name: '叫声', type: 'Normal', category: 'Status', power: 0, accuracy: 100, ppMax: 40, description: '让对手听可爱的叫声，引开注意力使其疏忽，从而降低对手的攻击。' },
  thunderShock: { id: 'thunderShock', name: '电击', type: 'Electric', category: 'Special', power: 40, accuracy: 100, ppMax: 30, description: '发出电流刺激对手进行攻击。有时会让对手陷入麻痹状态。' },
  gust: { id: 'gust', name: '起风', type: 'Flying', category: 'Special', power: 40, accuracy: 100, ppMax: 35, description: '刮起强风，攻击对手。' },
};

// Mock Species Data
interface SpeciesData extends Partial<Pokemon> {
    pokedexId: number;
}

export const SPECIES_DATA: Record<string, SpeciesData> = {
  bulbasaur: {
    pokedexId: 1,
    speciesName: '妙蛙种子',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
  },
  charmander: {
    pokedexId: 4,
    speciesName: '小火龙',
    types: ['Fire'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
  },
  squirtle: {
    pokedexId: 7,
    speciesName: '杰尼龟',
    types: ['Water'],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
  },
  pidgey: {
    pokedexId: 16,
    speciesName: '波波',
    types: ['Normal', 'Flying'],
    baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png'
  },
  rattata: {
    pokedexId: 19,
    speciesName: '小拉达',
    types: ['Normal'],
    baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png'
  },
  pikachu: {
    pokedexId: 25,
    speciesName: '皮卡丘',
    types: ['Electric'],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  },
  jigglypuff: {
    pokedexId: 39,
    speciesName: '胖丁',
    types: ['Normal', 'Fairy'],
    baseStats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png'
  },
  meowth: {
    pokedexId: 52,
    speciesName: '喵喵',
    types: ['Normal'],
    baseStats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 },
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png'
  }
};

// World Map Data
export const WORLD_MAP: Record<string, LocationData> = {
  'pallet-town': {
    id: 'pallet-town',
    name: '真新镇',
    description: '纯白色的开始之镇。这里是你冒险开始的地方。',
    region: '关都',
    connections: ['route-1'],
    encounters: [], // Town has no encounters
    bgGradient: 'from-slate-700 via-slate-800 to-slate-900'
  },
  'route-1': {
    id: 'route-1',
    name: '1号道路',
    description: '连接真新镇与常磐市的乡村小路。草丛中隐藏着宝可梦。',
    region: '关都',
    connections: ['pallet-town', 'viridian-city'],
    encounters: ['pidgey', 'rattata'],
    bgGradient: 'from-emerald-900 via-slate-900 to-black'
  },
  'viridian-city': {
    id: 'viridian-city',
    name: '常磐市',
    description: '常青色的永恒之市。拥有道馆的繁华城市。',
    region: '关都',
    connections: ['route-1', 'route-22', 'route-2'],
    encounters: [],
    bgGradient: 'from-emerald-800 via-slate-800 to-slate-900'
  },
  'route-22': {
    id: 'route-22',
    name: '22号道路',
    description: '通往宝可梦联盟大门的必经之路。',
    region: '关都',
    connections: ['viridian-city'],
    encounters: ['rattata', 'mankey', 'spearow'],
    bgGradient: 'from-slate-800 via-slate-900 to-black'
  },
  'route-2': {
    id: 'route-2',
    name: '2号道路',
    description: '通往常磐森林的道路。',
    region: '关都',
    connections: ['viridian-city', 'viridian-forest'],
    encounters: ['pidgey', 'rattata', 'caterpie', 'weedle'],
    bgGradient: 'from-emerald-900 via-slate-900 to-black'
  },
  'viridian-forest': {
    id: 'viridian-forest',
    name: '常磐森林',
    description: '树木茂密，光线昏暗的天然迷宫。充满了虫属性宝可梦。',
    region: '关都',
    connections: ['route-2', 'pewter-city'],
    encounters: ['caterpie', 'weedle', 'pikachu'],
    bgGradient: 'from-green-950 via-green-900 to-black'
  },
  'pewter-city': {
    id: 'pewter-city',
    name: '深灰市',
    description: '坐落在岩石山脚下的灰色城市。',
    region: '关都',
    connections: ['viridian-forest'],
    encounters: [],
    bgGradient: 'from-stone-800 via-stone-900 to-black'
  }
};
