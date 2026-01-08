import { LocationData, Move, Pokemon, PokemonType, Evolution, LearnsetMove } from './types';

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
  flamethrower: { id: 'flamethrower', name: '喷射火焰', type: 'Fire', category: 'Special', power: 90, accuracy: 100, ppMax: 15, description: '向对手发射烈焰进行攻击。有时会让对手陷入灼伤状态。' },
  razorLeaf: { id: 'razorLeaf', name: '飞叶快刀', type: 'Grass', category: 'Physical', power: 55, accuracy: 95, ppMax: 25, description: '飞出叶片，切斩对手进行攻击。容易击中要害。' },
  bubbleBeam: { id: 'bubbleBeam', name: '泡沫光线', type: 'Water', category: 'Special', power: 65, accuracy: 100, ppMax: 20, description: '向对手猛烈地喷射泡沫进行攻击。有时会降低对手的速度。' },
  quickAttack: { id: 'quickAttack', name: '电光一闪', type: 'Normal', category: 'Physical', power: 40, accuracy: 100, ppMax: 30, description: '以迅雷不及掩耳之势扑向对手。必定能够先制攻击。' },
  wingAttack: { id: 'wingAttack', name: '翅膀攻击', type: 'Flying', category: 'Physical', power: 60, accuracy: 100, ppMax: 35, description: '大大地展开翅膀，撞向对手进行攻击。' },
  bite: { id: 'bite', name: '咬住', type: 'Dark', category: 'Physical', power: 60, accuracy: 100, ppMax: 25, description: '用尖锐的牙咬住对手进行攻击。有时会使对手畏缩。' },
};

// Mock Species Data
interface SpeciesData extends Partial<Pokemon> {
    pokedexId: number;
    catchRate: number;
    learnset?: LearnsetMove[];
    evolutions?: Evolution[];
}

export const SPECIES_DATA: Record<string, SpeciesData> = {
  bulbasaur: {
    pokedexId: 1,
    speciesName: '妙蛙种子',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    learnset: [
        { moveId: 'vineWhip', level: 13 },
        { moveId: 'razorLeaf', level: 15 } // Early for demo
    ],
    evolutions: [
        { targetSpeciesId: 'ivysaur', level: 16 }
    ]
  },
  ivysaur: {
    pokedexId: 2,
    speciesName: '妙蛙草',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
    learnset: [
        { moveId: 'razorLeaf', level: 15 }
    ],
    evolutions: [
        { targetSpeciesId: 'venusaur', level: 32 }
    ]
  },
  venusaur: {
    pokedexId: 3,
    speciesName: '妙蛙花',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png'
  },
  charmander: {
    pokedexId: 4,
    speciesName: '小火龙',
    types: ['Fire'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    learnset: [
        { moveId: 'ember', level: 9 },
        { moveId: 'flamethrower', level: 15 } // Early for demo
    ],
    evolutions: [
        { targetSpeciesId: 'charmeleon', level: 16 }
    ]
  },
  charmeleon: {
    pokedexId: 5,
    speciesName: '火恐龙',
    types: ['Fire'],
    baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png',
    learnset: [
        { moveId: 'flamethrower', level: 15 }
    ],
    evolutions: [
        { targetSpeciesId: 'charizard', level: 36 }
    ]
  },
  charizard: {
    pokedexId: 6,
    speciesName: '喷火龙',
    types: ['Fire', 'Flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
  },
  squirtle: {
    pokedexId: 7,
    speciesName: '杰尼龟',
    types: ['Water'],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    learnset: [
        { moveId: 'waterGun', level: 9 },
        { moveId: 'bubbleBeam', level: 15 } // Early for demo
    ],
    evolutions: [
        { targetSpeciesId: 'wartortle', level: 16 }
    ]
  },
  wartortle: {
    pokedexId: 8,
    speciesName: '卡咪龟',
    types: ['Water'],
    baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png',
    learnset: [
        { moveId: 'bubbleBeam', level: 15 }
    ],
    evolutions: [
        { targetSpeciesId: 'blastoise', level: 36 }
    ]
  },
  blastoise: {
    pokedexId: 9,
    speciesName: '水箭龟',
    types: ['Water'],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png'
  },
  pidgey: {
    pokedexId: 16,
    speciesName: '波波',
    types: ['Normal', 'Flying'],
    baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
    catchRate: 255,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png',
    learnset: [
        { moveId: 'gust', level: 9 },
        { moveId: 'quickAttack', level: 13 },
        { moveId: 'wingAttack', level: 18 }
    ],
    evolutions: [
        { targetSpeciesId: 'pidgeotto', level: 18 }
    ]
  },
  pidgeotto: {
    pokedexId: 17,
    speciesName: '比比鸟',
    types: ['Normal', 'Flying'],
    baseStats: { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71 },
    catchRate: 120,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png',
    learnset: [
        { moveId: 'wingAttack', level: 18 }
    ],
    evolutions: [
        { targetSpeciesId: 'pidgeot', level: 36 }
    ]
  },
  pidgeot: {
    pokedexId: 18,
    speciesName: '大比鸟',
    types: ['Normal', 'Flying'],
    baseStats: { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png'
  },
  rattata: {
    pokedexId: 19,
    speciesName: '小拉达',
    types: ['Normal'],
    baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
    catchRate: 255,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png',
    learnset: [
        { moveId: 'quickAttack', level: 7 },
        { moveId: 'bite', level: 12 }
    ],
    evolutions: [
        { targetSpeciesId: 'raticate', level: 20 }
    ]
  },
  raticate: {
    pokedexId: 20,
    speciesName: '拉达',
    types: ['Normal'],
    baseStats: { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97 },
    catchRate: 127,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png'
  },
  pikachu: {
    pokedexId: 25,
    speciesName: '皮卡丘',
    types: ['Electric'],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    catchRate: 190,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    learnset: [
        { moveId: 'quickAttack', level: 8 },
        { moveId: 'thunderShock', level: 1 }
    ],
    evolutions: [] // Stone evolutions not supported yet
  },
  jigglypuff: {
    pokedexId: 39,
    speciesName: '胖丁',
    types: ['Normal', 'Fairy'],
    baseStats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
    catchRate: 170,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png'
  },
  meowth: {
    pokedexId: 52,
    speciesName: '喵喵',
    types: ['Normal'],
    baseStats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 },
    catchRate: 255,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png',
    learnset: [
        { moveId: 'bite', level: 12 }
    ]
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
