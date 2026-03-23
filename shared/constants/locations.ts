import type { LocationData } from '../types/index.js';

export const WORLD_MAP: Record<string, LocationData> = {
  'pallet-town': {
    id: 'pallet-town',
    name: '真新镇',
    description: '纯白色的开始之镇。这里是你冒险开始的地方。',
    region: '关都',
    connections: ['route-1', 'route-21'],
    encounters: [],
    bgGradient: 'from-slate-700 via-slate-800 to-slate-900'
  },
  'route-1': {
    id: 'route-1',
    name: '1号道路',
    description: '连接真新镇与常磐市的乡村小路。草丛中隐藏着宝可梦。',
    region: '关都',
    connections: ['pallet-town', 'viridian-city'],
    encounters: ['pidgey', 'rattata', 'sentret', 'hoothoot', 'igglybuff'],
    levelRange: [2, 5],
    bgGradient: 'from-emerald-900 via-slate-900 to-black'
  },
  'viridian-city': {
    id: 'viridian-city',
    name: '常磐市',
    description: '常青色的永恒之市。拥有道馆的繁华城市。',
    region: '关都',
    connections: ['route-1', 'route-22', 'route-2', 'viridian-pond'],
    encounters: [],
    bgGradient: 'from-emerald-800 via-slate-800 to-slate-900'
  },
  'route-22': {
    id: 'route-22',
    name: '22号道路',
    description: '通往宝可梦联盟大门的必经之路。',
    region: '关都',
    connections: ['viridian-city', 'route-23'],
    encounters: ['rattata', 'mankey', 'spearow', 'stantler', 'smeargle'],
    levelRange: [3, 6],
    bgGradient: 'from-slate-800 via-slate-900 to-black'
  },
  'route-2': {
    id: 'route-2',
    name: '2号道路',
    description: '通往常磐森林的道路。',
    region: '关都',
    connections: ['viridian-city', 'viridian-forest', 'digletts-cave'],
    encounters: ['pidgey', 'rattata', 'caterpie', 'weedle', 'sentret', 'ledyba', 'hoppip', 'sunkern'],
    levelRange: [3, 6],
    bgGradient: 'from-emerald-900 via-slate-900 to-black'
  },
  'viridian-forest': {
    id: 'viridian-forest',
    name: '常磐森林',
    description: '树木茂密，光线昏暗的天然迷宫。充满了虫属性宝可梦。',
    region: '关都',
    connections: ['route-2', 'pewter-city'],
    encounters: ['caterpie', 'weedle', 'pikachu', 'ledyba', 'spinarak', 'hoothoot', 'pineco', 'yanma', 'pichu'],
    levelRange: [3, 7],
    bgGradient: 'from-green-950 via-green-900 to-black',
    weatherRates: { Rain: 0.2 }
  },
  'pewter-city': {
    id: 'pewter-city',
    name: '深灰市',
    description: '坐落在岩石山脚下的灰色城市。',
    region: '关都',
    connections: ['viridian-forest', 'route-3'],
    encounters: [],
    bgGradient: 'from-stone-800 via-stone-900 to-black',
    gym: {
        leaderName: '小刚',
        badgeName: '灰色徽章',
        badgeId: 'boulder-badge',
        description: '坚如磐石的宝可梦训练家。',
        pokemon: ['geodude', 'onix'],
        level: 12
    }
  },
  'route-3': {
      id: 'route-3',
      name: '3号道路',
      description: '通往月见山的山路。',
      region: '关都',
      connections: ['pewter-city', 'mt-moon'],
      encounters: ['spearow', 'pidgey', 'jigglypuff', 'mankey', 'stantler', 'phanpy', 'natu'],
    levelRange: [6, 10],
      bgGradient: 'from-stone-700 via-emerald-900 to-black'
  },
  'mt-moon': {
      id: 'mt-moon',
      name: '月见山',
      description: '这就因陨石坠落而闻名的神秘山脉。',
      region: '关都',
      connections: ['route-3', 'route-4'],
      encounters: ['zubat', 'geodude', 'clefairy', 'paras', 'teddiursa', 'slugma', 'cleffa', 'dunsparce', 'magby'],
    levelRange: [7, 11],
      bgGradient: 'from-slate-900 via-purple-950 to-black'
  },
  'route-4': {
      id: 'route-4',
      name: '4号道路',
      description: '通往华蓝市的下坡路。',
      region: '关都',
      connections: ['mt-moon', 'cerulean-city'],
      encounters: ['rattata', 'spearow', 'ekans', 'sandshrew', 'wooper', 'marill', 'quagsire', 'hoppip'],
    levelRange: [8, 12],
      bgGradient: 'from-emerald-800 via-cyan-950 to-black'
  },
  'cerulean-city': {
      id: 'cerulean-city',
      name: '华蓝市',
      description: '被水包围的蓝色城市。',
      region: '关都',
      connections: ['route-4', 'route-24', 'route-5', 'route-9', 'cerulean-cave'],
      encounters: [],
      bgGradient: 'from-cyan-800 via-blue-900 to-slate-900',
      gym: {
          leaderName: '小霞',
          badgeName: '蓝色徽章',
          badgeId: 'cascade-badge',
          description: '俏皮的人鱼公主。',
          pokemon: ['staryu', 'starmie'],
          level: 18
      },
      weatherRates: { Rain: 0.4 }
  },
  'route-24': {
      id: 'route-24',
      name: '24号道路',
      description: '著名的黄金球大桥所在地。',
      region: '关都',
      connections: ['cerulean-city', 'route-25'],
      encounters: ['caterpie', 'weedle', 'metapod', 'kakuna', 'pidgey', 'abra', 'spinarak', 'ledyba', 'ledian', 'ariados'],
    levelRange: [10, 14],
      bgGradient: 'from-green-800 via-blue-900 to-black'
  },
  'route-5': {
      id: 'route-5',
      name: '5号道路',
      description: '连接华蓝市与南方的斜坡。',
      region: '关都',
      connections: ['cerulean-city', 'vermilion-city'],
      encounters: ['pidgey', 'rattata', 'jigglypuff', 'meowth', 'snubbull', 'aipom', 'girafarig', 'sudowoodo'],
    levelRange: [12, 16],
      bgGradient: 'from-emerald-700 via-slate-800 to-black'
  },
  'vermilion-city': {
      id: 'vermilion-city',
      name: '枯叶市',
      description: '夕阳照耀下的橙色港口城市。',
      region: '关都',
      connections: ['route-5', 'route-6', 'route-11', 'ss-anne'],
      encounters: [],
      bgGradient: 'from-orange-900 via-slate-800 to-black',
      gym: {
          leaderName: '马志士',
          badgeName: '橙色徽章',
          badgeId: 'thunder-badge',
          description: '闪电般的美国硬汉。',
          pokemon: ['voltorb', 'pikachu', 'raichu'],
          level: 24
      }
  },
  'route-11': {
      id: 'route-11',
      name: '11号道路',
      description: '枯叶市东边的草地。',
      region: '关都',
      connections: ['vermilion-city', 'route-12', 'digletts-cave'],
      encounters: ['ekans', 'sandshrew', 'drowzee', 'houndour', 'murkrow', 'phanpy', 'donphan', 'tyrogue'],
    levelRange: [14, 18],
      bgGradient: 'from-emerald-800 via-green-900 to-black'
  },
  'route-9': {
      id: 'route-9',
      name: '9号道路',
      description: '崎岖的山路，连接着华蓝市与岩山隧道。',
      region: '关都',
      connections: ['cerulean-city', 'rock-tunnel'],
      encounters: ['rattata', 'spearow', 'ekans', 'sandshrew', 'natu', 'xatu'],
    levelRange: [15, 19],
      bgGradient: 'from-stone-700 via-emerald-800 to-black'
  },
  'rock-tunnel': {
      id: 'rock-tunnel',
      name: '岩山隧道',
      description: '漆黑的隧道。需要闪光才能看清道路。',
      region: '关都',
      connections: ['route-9', 'lavender-town', 'route-10'],
      encounters: ['zubat', 'geodude', 'machop', 'onix', 'cubone', 'gligar', 'swinub', 'steelix', 'shuckle'],
    levelRange: [16, 21],
      bgGradient: 'from-gray-900 via-stone-900 to-black',
      weatherRates: { Sandstorm: 0.3 }
  },
  'lavender-town': {
      id: 'lavender-town',
      name: '紫苑镇',
      description: '高贵的紫色之镇。这里有着著名的宝可梦塔。',
      region: '关都',
      connections: ['rock-tunnel', 'route-8', 'route-12', 'pokemon-tower'],
      encounters: ['gastly', 'haunter', 'cubone', 'misdreavus', 'murkrow', 'smoochum'],
    levelRange: [16, 20],
      bgGradient: 'from-purple-900 via-slate-900 to-black',
      weatherRates: { Rain: 0.2 }
  },
  'route-8': {
      id: 'route-8',
      name: '8号道路',
      description: '连接紫苑镇与彩虹市的道路。',
      region: '关都',
      connections: ['lavender-town', 'celadon-city'],
      encounters: ['pidgey', 'meowth', 'ekans', 'vulpix', 'growlithe', 'houndour', 'snubbull', 'granbull', 'houndoom'],
    levelRange: [18, 23],
      bgGradient: 'from-emerald-800 via-stone-800 to-black'
  },
  'celadon-city': {
      id: 'celadon-city',
      name: '彩虹市',
      description: '有着名为彩虹的颜色的城市。',
      region: '关都',
      connections: ['route-8', 'route-7', 'route-16', 'celadon-game-corner'],
      encounters: ['grimer', 'koffing', 'murkrow', 'houndour', 'smeargle'],
    levelRange: [20, 25],
      bgGradient: 'from-green-800 via-emerald-900 to-slate-900',
      gym: {
          leaderName: '莉佳',
          badgeName: '彩虹徽章',
          badgeId: 'rainbow-badge',
          description: '热爱大自然的千金小姐。',
          pokemon: ['victreebel', 'tangela', 'vileplume'],
          level: 29
      }
  },
  'route-12': {
      id: 'route-12',
      name: '12号道路',
      description: '以垂钓者闻名的沿海道路。',
      region: '关都',
      connections: ['lavender-town', 'route-11', 'route-13'],
      encounters: ['oddish', 'bellsprout', 'venonat', 'krabby', 'farfetchd', 'marill', 'wooper', 'corsola', 'remoraid', 'politoed'],
    levelRange: [22, 27],
      bgGradient: 'from-blue-900 via-cyan-900 to-black',
      weatherRates: { Rain: 0.5, Sunny: 0.3 }
  },
  'route-13': {
      id: 'route-13',
      name: '13号道路',
      description: '连接多个道路的复杂路段。',
      region: '关都',
      connections: ['route-12', 'route-14'],
      encounters: ['pidgey', 'oddish', 'bellsprout', 'venonat', 'ditto', 'skiploom', 'sunflora'],
    levelRange: [23, 28],
      bgGradient: 'from-emerald-800 via-green-900 to-black'
  },
  'route-14': {
      id: 'route-14',
      name: '14号道路',
      description: '草丛茂密的自然道路。',
      region: '关都',
      connections: ['route-13', 'route-15', 'fuchsia-city'],
      encounters: ['pidgey', 'oddish', 'gloom', 'venonat', 'venomoth', 'yanma', 'bellossom'],
    levelRange: [24, 28],
      bgGradient: 'from-green-800 via-emerald-900 to-black'
  },
  'route-15': {
      id: 'route-15',
      name: '15号道路',
      description: '通往浅红市的林间小路。',
      region: '关都',
      connections: ['route-14', 'fuchsia-city'],
      encounters: ['pidgey', 'oddish', 'bellsprout', 'venonat', 'ditto', 'jumpluff', 'hoppip'],
    levelRange: [24, 28],
      bgGradient: 'from-emerald-700 via-green-800 to-black'
  },
  'fuchsia-city': {
      id: 'fuchsia-city',
      name: '浅红市',
      description: '被自然环抱的粉红色城市。著名的野生原野区在此。',
      region: '关都',
      connections: ['route-14', 'route-15', 'safari-zone', 'route-18', 'route-19'],
      encounters: [],
      bgGradient: 'from-pink-900 via-fuchsia-900 to-slate-900',
      gym: {
          leaderName: '阿杏',
          badgeName: '粉红徽章',
          badgeId: 'soul-badge',
          description: '毒系忍者大师。',
          pokemon: ['koffing', 'muk', 'weezing'],
          level: 43
      }
  },
  'safari-zone': {
      id: 'safari-zone',
      name: '野生原野区',
      description: '可以遇到稀有宝可梦的自然保护区。',
      region: '关都',
      connections: ['fuchsia-city'],
      encounters: ['nidorino', 'nidorina', 'parasect', 'venonat', 'exeggcute', 'rhyhorn', 'chansey', 'kangaskhan', 'scyther', 'pinsir', 'tauros', 'dratini', 'teddiursa', 'gligar', 'heracross', 'scizor', 'ursaring', 'wobbuffet', 'stantler', 'miltank'],
    levelRange: [24, 30],
      bgGradient: 'from-green-700 via-lime-800 to-emerald-900'
  },
  'route-18': {
      id: 'route-18',
      name: '18号道路',
      description: '通往自行车道的起点。',
      region: '关都',
      connections: ['fuchsia-city', 'route-17'],
      encounters: ['rattata', 'raticate', 'spearow', 'fearow', 'doduo', 'furret'],
    levelRange: [25, 30],
      bgGradient: 'from-stone-700 via-slate-800 to-black'
  },
  'route-17': {
      id: 'route-17',
      name: '17号道路',
      description: '著名的自行车道。',
      region: '关都',
      connections: ['route-18', 'route-16'],
      encounters: ['rattata', 'raticate', 'spearow', 'fearow', 'doduo', 'dodrio', 'girafarig', 'stantler'],
    levelRange: [25, 30],
      bgGradient: 'from-gray-700 via-slate-800 to-black'
  },
  'route-16': {
      id: 'route-16',
      name: '16号道路',
      description: '彩虹市西边的道路。据说有卡比兽挡路。',
      region: '关都',
      connections: ['route-17', 'celadon-city'],
      encounters: ['rattata', 'spearow', 'doduo', 'snorlax', 'dunsparce', 'wobbuffet'],
    levelRange: [20, 25],
      bgGradient: 'from-emerald-700 via-slate-800 to-black'
  },
  'route-19': {
      id: 'route-19',
      name: '19号水道',
      description: '通往双子岛的水上路线。',
      region: '关都',
      connections: ['fuchsia-city', 'route-20'],
      encounters: ['tentacool', 'tentacruel', 'magikarp', 'horsea', 'staryu', 'chinchou', 'marill', 'qwilfish', 'mantine', 'corsola'],
    levelRange: [27, 32],
      bgGradient: 'from-blue-800 via-cyan-900 to-black',
      weatherRates: { Rain: 0.3 }
  },
  'route-20': {
      id: 'route-20',
      name: '20号水道',
      description: '双子岛附近的海域。',
      region: '关都',
      connections: ['route-19', 'seafoam-islands', 'cinnabar-island'],
      encounters: ['tentacool', 'magikarp', 'horsea', 'seadra', 'staryu', 'shellder', 'chinchou', 'wooper', 'lanturn', 'octillery', 'remoraid'],
    levelRange: [27, 32],
      bgGradient: 'from-cyan-800 via-blue-900 to-black'
  },
  'seafoam-islands': {
      id: 'seafoam-islands',
      name: '双子岛',
      description: '寒冷的海岛洞穴。据说有传说的宝可梦栖息。',
      region: '关都',
      connections: ['route-20'],
      encounters: ['zubat', 'golbat', 'psyduck', 'golduck', 'slowpoke', 'slowbro', 'seel', 'dewgong', 'shellder', 'cloyster', 'krabby', 'kingler', 'horsea', 'jynx', 'lapras', 'swinub', 'piloswine', 'delibird', 'smoochum'],
    levelRange: [28, 34],
      bgGradient: 'from-cyan-900 via-blue-950 to-black',
      weatherRates: { Hail: 0.4 },
      legendaryEncounter: {
          speciesId: 'articuno',
          level: 50
      }
  },
  'cinnabar-island': {
      id: 'cinnabar-island',
      name: '红莲岛',
      description: '火山岛上的热闹城镇。有研究化石的实验室。',
      region: '关都',
      connections: ['route-20', 'route-21', 'pokemon-mansion', 'cinnabar-lab'],
      encounters: [],
      bgGradient: 'from-red-900 via-orange-900 to-slate-900',
      gym: {
          leaderName: '夏伯',
          badgeName: '深红徽章',
          badgeId: 'volcano-badge',
          description: '灼热的火焰爱好者。',
          pokemon: ['growlithe', 'ponyta', 'rapidash', 'arcanine'],
          level: 47
      }
  },
  'pokemon-mansion': {
      id: 'pokemon-mansion',
      name: '宝可梦屋敷',
      description: '废弃的研究所。曾经进行过秘密实验。',
      region: '关都',
      connections: ['cinnabar-island'],
      encounters: ['rattata', 'raticate', 'vulpix', 'growlithe', 'ponyta', 'grimer', 'muk', 'koffing', 'weezing', 'magmar', 'slugma', 'houndour', 'magcargo', 'magby'],
    levelRange: [28, 34],
      bgGradient: 'from-gray-800 via-slate-900 to-black'
  },
  'route-21': {
      id: 'route-21',
      name: '21号水道',
      description: '从红莲岛返回真新镇的水路。',
      region: '关都',
      connections: ['cinnabar-island', 'pallet-town'],
      encounters: ['tentacool', 'magikarp', 'staryu', 'tangela', 'chinchou', 'mantine', 'octillery'],
    levelRange: [28, 33],
      bgGradient: 'from-blue-700 via-cyan-800 to-black'
  },
  'route-6': {
      id: 'route-6',
      name: '6号道路',
      description: '从5号道路延伸到枯叶市的道路。',
      region: '关都',
      connections: ['vermilion-city', 'route-5'],
      encounters: ['pidgey', 'rattata', 'oddish', 'bellsprout', 'meowth', 'sentret', 'hoothoot', 'noctowl', 'togetic'],
    levelRange: [12, 16],
      bgGradient: 'from-emerald-700 via-slate-800 to-black'
  },
  'route-7': {
      id: 'route-7',
      name: '7号道路',
      description: '连接彩虹市与玉虹市的短道。',
      region: '关都',
      connections: ['celadon-city', 'saffron-city'],
      encounters: ['pidgey', 'rattata', 'vulpix', 'meowth', 'growlithe', 'snubbull', 'murkrow', 'umbreon'],
    levelRange: [18, 23],
      bgGradient: 'from-green-700 via-slate-800 to-black'
  },
  'saffron-city': {
      id: 'saffron-city',
      name: '玉虹市',
      description: '关都地区的中心大都市。',
      region: '关都',
      connections: ['route-7', 'route-8', 'route-5', 'route-6', 'fighting-dojo'],
      encounters: [],
      bgGradient: 'from-yellow-900 via-amber-900 to-slate-900',
      gym: {
          leaderName: '娜姿',
          badgeName: '金色徽章',
          badgeId: 'marsh-badge',
          description: '拥有超能力的神秘女孩。',
          pokemon: ['kadabra', 'alakazam'],
          level: 38
      }
  },
  'route-10': {
      id: 'route-10',
      name: '10号道路',
      description: '通往无人发电厂的道路。',
      region: '关都',
      connections: ['rock-tunnel', 'power-plant'],
      encounters: ['voltorb', 'magnemite', 'electabuzz', 'mareep', 'flaaffy', 'elekid'],
    levelRange: [16, 20],
      bgGradient: 'from-yellow-800 via-slate-900 to-black',
      weatherRates: { Rain: 0.2 }
  },
  'power-plant': {
      id: 'power-plant',
      name: '无人发电厂',
      description: '废弃的发电站。充满了电属性宝可梦。据说有传说的宝可梦栖息。',
      region: '关都',
      connections: ['route-10'],
      encounters: ['voltorb', 'electrode', 'magnemite', 'magneton', 'electabuzz', 'pikachu', 'raichu', 'ampharos', 'elekid'],
    levelRange: [25, 32],
      bgGradient: 'from-yellow-700 via-amber-800 to-black',
      weatherRates: { Rain: 0.5 },
      legendaryEncounter: {
          speciesId: 'zapdos',
          level: 50
      }
  },
  'digletts-cave': {
      id: 'digletts-cave',
      name: '地鼠洞穴',
      description: '地鼠群居的长长隧道。',
      region: '关都',
      connections: ['route-2', 'route-11'],
      encounters: ['diglett', 'dugtrio'],
    levelRange: [15, 22],
      bgGradient: 'from-amber-900 via-stone-900 to-black'
  },
  'route-23': {
      id: 'route-23',
      name: '23号道路',
      description: '通往宝可梦联盟的最后道路。',
      region: '关都',
      connections: ['route-22', 'victory-road'],
      encounters: ['spearow', 'fearow', 'ekans', 'arbok', 'sandshrew', 'sandslash', 'mankey', 'primeape', 'donphan', 'pupitar'],
    levelRange: [30, 36],
      bgGradient: 'from-slate-700 via-stone-800 to-black'
  },
  'victory-road': {
      id: 'victory-road',
      name: '冠军之路',
      description: '挑战四天王前的最终试炼。强大的宝可梦栖息于此。据说有传说的宝可梦栖息。',
      region: '关都',
      connections: ['route-23', 'pokemon-league'],
      encounters: ['zubat', 'golbat', 'geodude', 'graveler', 'onix', 'machop', 'machoke', 'marowak', 'larvitar', 'gligar', 'pupitar', 'crobat', 'skarmory'],
    levelRange: [32, 38],
      bgGradient: 'from-purple-900 via-slate-900 to-black',
      legendaryEncounter: {
          speciesId: 'moltres',
          level: 50
      }
  },
  'pokemon-tower': {
      id: 'pokemon-tower',
      name: '宝可梦塔',
      description: '祭奠逝去宝可梦的灵塔。',
      region: '关都',
      connections: ['lavender-town'],
      encounters: ['gastly', 'haunter', 'cubone', 'marowak', 'misdreavus', 'murkrow'],
    levelRange: [17, 22],
      bgGradient: 'from-purple-950 via-gray-900 to-black'
  },
  'cerulean-cave': {
      id: 'cerulean-cave',
      name: '华蓝洞窟',
      description: '只有最强训练家才能进入的神秘洞穴。据说有极强的宝可梦栖息。',
      region: '关都',
      connections: ['cerulean-city'],
      encounters: ['golbat', 'parasect', 'venomoth', 'kadabra', 'hypno', 'magneton', 'electrode', 'rhydon', 'chansey', 'ditto', 'larvitar', 'sneasel', 'tyranitar', 'blissey', 'crobat', 'forretress'],
    levelRange: [36, 42],
      bgGradient: 'from-indigo-900 via-purple-950 to-black',
      legendaryEncounter: {
          speciesId: 'mewtwo',
          level: 70
      }
  },
  'ss-anne': {
      id: 'ss-anne',
      name: '圣特安努号',
      description: '停靠在枯叶市港口的豪华游轮。',
      region: '关都',
      connections: ['vermilion-city'],
      encounters: ['tentacool', 'tentacruel', 'magikarp', 'gyarados', 'staryu', 'shellder', 'chinchou', 'wooper', 'lanturn', 'qwilfish'],
    levelRange: [14, 18],
      bgGradient: 'from-blue-700 via-slate-800 to-black'
  },
  'route-25': {
      id: 'route-25',
      name: '25号道路',
      description: '通往海角小屋的岬角道路。',
      region: '关都',
      connections: ['route-24', 'cerulean-cape'],
      encounters: ['pidgey', 'oddish', 'bellsprout', 'abra', 'slowpoke', 'psyduck', 'poliwag', 'goldeen', 'marill', 'wooper', 'sunflora', 'sunkern'],
    levelRange: [10, 14],
      bgGradient: 'from-blue-800 via-green-900 to-black'
  },
  'cerulean-cape': {
      id: 'cerulean-cape',
      name: '华蓝岬',
      description: '华蓝市北边的海角。适合垂钓。',
      region: '关都',
      connections: ['route-25'],
      encounters: ['magikarp', 'goldeen', 'seaking', 'poliwag', 'tentacool', 'lickitung', 'marill', 'chinchou'],
    levelRange: [10, 15],
      bgGradient: 'from-cyan-700 via-blue-800 to-black'
  },
  'celadon-game-corner': {
      id: 'celadon-game-corner',
      name: '彩虹游戏城',
      description: '彩虹市著名的游戏娱乐中心。可以用代币兑换稀有宝可梦。',
      region: '关都',
      connections: ['celadon-city'],
      encounters: ['porygon', 'eevee', 'dratini', 'porygon2', 'togepi', 'espeon', 'slowking'],
    levelRange: [20, 25],
      bgGradient: 'from-purple-800 via-pink-900 to-slate-900'
  },
  'fighting-dojo': {
      id: 'fighting-dojo',
      name: '格斗道场',
      description: '玉虹市的格斗道场。曾经是正式道馆。',
      region: '关都',
      connections: ['saffron-city'],
      encounters: ['hitmonlee', 'hitmonchan', 'machop', 'machoke', 'primeape', 'heracross', 'tyrogue', 'hitmontop'],
    levelRange: [25, 30],
      bgGradient: 'from-orange-800 via-red-900 to-slate-900'
  },
  'cinnabar-lab': {
      id: 'cinnabar-lab',
      name: '红莲研究所',
      description: '研究化石复活技术的科学实验室。据说实验室深处隐藏着神秘的宝可梦。',
      region: '关都',
      connections: ['cinnabar-island'],
      encounters: ['omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl', 'shuckle', 'porygon2'],
    levelRange: [28, 34],
      bgGradient: 'from-gray-700 via-slate-800 to-black',
      legendaryEncounter: {
          speciesId: 'mew',
          level: 30
      }
  },
  'pokemon-league': {
      id: 'pokemon-league',
      name: '宝可梦联盟',
      description: '关都地区最强训练家的殿堂。',
      region: '关都',
      connections: ['victory-road', 'new-bark-town'],
      encounters: [],
      bgGradient: 'from-indigo-800 via-purple-900 to-black'
  },
  'viridian-pond': {
      id: 'viridian-pond',
      name: '常磐池塘',
      description: '常磐市郊外的宁静池塘。',
      region: '关都',
      connections: ['viridian-city'],
      encounters: ['poliwag', 'poliwhirl', 'goldeen', 'seaking', 'magikarp', 'psyduck', 'wooper', 'marill', 'azumarill', 'politoed'],
    levelRange: [3, 8],
      bgGradient: 'from-blue-700 via-cyan-800 to-emerald-900'
  },

  // ===== 城都地区 (Johto) =====
  'new-bark-town': {
      id: 'new-bark-town',
      name: '若叶镇',
      description: '风起之镇。城都地区冒险的起点。',
      region: '城都',
      connections: ['pokemon-league', 'cherrygrove-city'],
      encounters: ['sentret', 'hoothoot', 'pidgey', 'rattata'],
    levelRange: [28, 32],
      bgGradient: 'from-green-700 via-emerald-800 to-slate-900'
  },
  'cherrygrove-city': {
      id: 'cherrygrove-city',
      name: '吉花市',
      description: '花香四溢的美丽小城。',
      region: '城都',
      connections: ['new-bark-town', 'violet-city'],
      encounters: ['ledyba', 'spinarak', 'caterpie', 'weedle', 'hoppip', 'sunkern', 'pichu'],
    levelRange: [28, 33],
      bgGradient: 'from-pink-700 via-rose-800 to-slate-900'
  },
  'violet-city': {
      id: 'violet-city',
      name: '桔梗市',
      description: '高耸入云的壮丽之城。有着古老的宝可梦塔。',
      region: '城都',
      connections: ['cherrygrove-city', 'azalea-town', 'ecruteak-city'],
      encounters: ['pidgey', 'hoothoot', 'bellsprout', 'mareep', 'flaaffy', 'natu', 'hoppip', 'togepi'],
    levelRange: [29, 34],
      bgGradient: 'from-violet-800 via-purple-900 to-slate-900',
      gym: {
          leaderName: '阿速',
          badgeName: '飞翼徽章',
          badgeId: 'zephyr-badge',
          description: '以优雅的飞行系宝可梦闻名的训练家。',
          pokemon: ['pidgey', 'pidgeotto'],
          level: 9
      }
  },
  'azalea-town': {
      id: 'azalea-town',
      name: '桧皮镇',
      description: '与自然共存的小镇。以虫系宝可梦闻名。',
      region: '城都',
      connections: ['violet-city', 'ilex-forest', 'goldenrod-city'],
      encounters: ['caterpie', 'weedle', 'spinarak', 'pineco', 'ledyba', 'ariados', 'yanma'],
    levelRange: [29, 34],
      bgGradient: 'from-lime-800 via-green-900 to-slate-900',
      gym: {
          leaderName: '阿笔',
          badgeName: '虫甲徽章',
          badgeId: 'hive-badge',
          description: '热爱虫系宝可梦的少年训练家。',
          pokemon: ['metapod', 'kakuna', 'scyther'],
          level: 16
      }
  },
  'ilex-forest': {
      id: 'ilex-forest',
      name: '桧皮森林',
      description: '古老而神秘的森林。据说有守护森林的神奇宝可梦。',
      region: '城都',
      connections: ['azalea-town', 'goldenrod-city'],
      encounters: ['oddish', 'paras', 'pineco', 'hoothoot', 'noctowl', 'forretress', 'sudowoodo'],
    levelRange: [30, 35],
      bgGradient: 'from-green-950 via-emerald-950 to-black',
      weatherRates: { Rain: 0.3 },
      legendaryEncounter: {
          speciesId: 'celebi',
          level: 30,
          minBadges: 6
      }
  },
  'goldenrod-city': {
      id: 'goldenrod-city',
      name: '满金市',
      description: '城都地区最繁华的大都市。拥有百货大楼和广播塔。',
      region: '城都',
      connections: ['azalea-town', 'ilex-forest', 'ecruteak-city'],
      encounters: ['rattata', 'meowth', 'snubbull', 'aipom', 'granbull', 'smeargle', 'igglybuff'],
    levelRange: [30, 35],
      bgGradient: 'from-yellow-700 via-amber-800 to-slate-900',
      gym: {
          leaderName: '小茜',
          badgeName: '正规徽章',
          badgeId: 'plain-badge',
          description: '使用一般系宝可梦的可爱女孩，但实力不容小觑。',
          pokemon: ['clefairy', 'miltank'],
          level: 20
      }
  },
  'ecruteak-city': {
      id: 'ecruteak-city',
      name: '圆朱市',
      description: '承载历史与传统的古都。钟楼与烧焦塔矗立于此。',
      region: '城都',
      connections: ['goldenrod-city', 'violet-city', 'olivine-city', 'mahogany-town', 'tin-tower'],
      encounters: ['gastly', 'misdreavus', 'murkrow', 'zubat', 'unown', 'natu', 'xatu'],
    levelRange: [31, 36],
      bgGradient: 'from-amber-800 via-orange-900 to-slate-900',
      gym: {
          leaderName: '松叶',
          badgeName: '幻影徽章',
          badgeId: 'fog-badge',
          description: '操纵幽灵系宝可梦的神秘训练家。',
          pokemon: ['gastly', 'haunter', 'gengar', 'misdreavus'],
          level: 25
      }
  },
  'olivine-city': {
      id: 'olivine-city',
      name: '浅葱市',
      description: '面朝大海的港口城市。灯塔是城市的标志。',
      region: '城都',
      connections: ['ecruteak-city', 'whirl-islands', 'mahogany-town'],
      encounters: ['tentacool', 'magnemite', 'voltorb', 'chinchou', 'lanturn', 'corsola', 'mantine', 'skarmory'],
    levelRange: [31, 36],
      bgGradient: 'from-cyan-700 via-steel-800 to-slate-900',
      gym: {
          leaderName: '小美',
          badgeName: '钢铁徽章',
          badgeId: 'mineral-badge',
          description: '温柔而坚强的钢系训练家。',
          pokemon: ['magnemite', 'steelix'],
          level: 30
      }
  },
  'mahogany-town': {
      id: 'mahogany-town',
      name: '沼木镇',
      description: '被群山环绕的寒冷小镇。忍者的据点。',
      region: '城都',
      connections: ['ecruteak-city', 'olivine-city', 'blackthorn-city', 'lake-of-rage', 'mt-mortar'],
      encounters: ['swinub', 'sneasel', 'delibird', 'jynx', 'piloswine', 'smoochum'],
    levelRange: [32, 37],
      bgGradient: 'from-sky-900 via-blue-950 to-slate-900',
      weatherRates: { Hail: 0.3 },
      gym: {
          leaderName: '柳伯',
          badgeName: '冰河徽章',
          badgeId: 'glacier-badge',
          description: '冰系宝可梦的老练使者。',
          pokemon: ['seel', 'dewgong', 'piloswine'],
          level: 31
      }
  },
  'blackthorn-city': {
      id: 'blackthorn-city',
      name: '烟墨市',
      description: '龙之传承者所守护的山中之城。',
      region: '城都',
      connections: ['mahogany-town', 'silver-cave'],
      encounters: ['dratini', 'horsea', 'magikarp', 'larvitar', 'kingdra', 'pupitar'],
    levelRange: [33, 38],
      bgGradient: 'from-indigo-800 via-violet-900 to-slate-900',
      gym: {
          leaderName: '小椿',
          badgeName: '升龙徽章',
          badgeId: 'rising-badge',
          description: '龙系宝可梦的骄傲传承者。',
          pokemon: ['dragonair', 'dragonair', 'kingdra'],
          level: 37
      }
  },
  'lake-of-rage': {
      id: 'lake-of-rage',
      name: '愤怒之湖',
      description: '传闻有红色暴鲤龙出没的神秘湖泊。',
      region: '城都',
      connections: ['mahogany-town'],
      encounters: ['magikarp', 'gyarados', 'goldeen', 'psyduck', 'wooper', 'quagsire', 'azumarill'],
    levelRange: [32, 37],
      bgGradient: 'from-red-900 via-blue-950 to-black',
      weatherRates: { Rain: 0.5 },
      legendaryEncounter: {
          speciesId: 'raikou',
          level: 40,
          minBadges: 4
      }
  },
  'tin-tower': {
      id: 'tin-tower',
      name: '钟楼',
      description: '供奉凤王的神圣高塔。据说彩虹羽毛可以召唤凤王。',
      region: '城都',
      connections: ['ecruteak-city'],
      encounters: ['gastly', 'misdreavus', 'unown', 'xatu', 'togetic'],
    levelRange: [33, 38],
      bgGradient: 'from-yellow-700 via-amber-900 to-black',
      legendaryEncounter: {
          speciesId: 'hoOh',
          level: 70,
          minBadges: 8
      }
  },
  'whirl-islands': {
      id: 'whirl-islands',
      name: '漩涡列岛',
      description: '被漩涡包围的神秘岛群。据说海之神栖息于最深处。',
      region: '城都',
      connections: ['olivine-city'],
      encounters: ['tentacool', 'seel', 'horsea', 'krabby', 'chinchou', 'corsola', 'qwilfish', 'remoraid'],
    levelRange: [32, 37],
      bgGradient: 'from-blue-800 via-cyan-950 to-black',
      weatherRates: { Rain: 0.4 },
      legendaryEncounter: {
          speciesId: 'suicune',
          level: 40,
          minBadges: 5
      }
  },
  'silver-cave': {
      id: 'silver-cave',
      name: '白银山',
      description: '城都地区最深处的洞穴。只有集齐徽章的训练家才能进入。传说中最强训练家在此修行。',
      region: '城都',
      connections: ['blackthorn-city'],
      encounters: ['larvitar', 'ursaring', 'sneasel', 'golduck', 'tyranitar', 'crobat', 'steelix', 'skarmory'],
    levelRange: [36, 42],
      bgGradient: 'from-gray-800 via-slate-900 to-black',
      legendaryEncounter: {
          speciesId: 'lugia',
          level: 70,
          minBadges: 8
      }
  },
  'mt-mortar': {
      id: 'mt-mortar',
      name: '断崖山',
      description: '崎岖险峻的山地。许多格斗系宝可梦在此修炼。',
      region: '城都',
      connections: ['mahogany-town'],
      encounters: ['machop', 'zubat', 'marill', 'geodude', 'teddiursa', 'ursaring', 'hitmontop', 'tyrogue'],
    levelRange: [32, 37],
      bgGradient: 'from-stone-800 via-amber-900 to-black',
      legendaryEncounter: {
          speciesId: 'entei',
          level: 40,
          minBadges: 4
      }
  }
};
