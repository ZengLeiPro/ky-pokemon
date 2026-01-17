import type { LocationData } from '../types';

export const WORLD_MAP: Record<string, LocationData> = {
  'pallet-town': {
    id: 'pallet-town',
    name: '真新镇',
    description: '纯白色的开始之镇。这里是你冒险开始的地方。',
    region: '关都',
    connections: ['route-1'],
    encounters: [],
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
      encounters: ['spearow', 'pidgey', 'jigglypuff', 'mankey'],
      bgGradient: 'from-stone-700 via-emerald-900 to-black'
  },
  'mt-moon': {
      id: 'mt-moon',
      name: '月见山',
      description: '这就因陨石坠落而闻名的神秘山脉。',
      region: '关都',
      connections: ['route-3', 'route-4'],
      encounters: ['zubat', 'geodude', 'clefairy', 'paras'],
      bgGradient: 'from-slate-900 via-purple-950 to-black'
  },
  'route-4': {
      id: 'route-4',
      name: '4号道路',
      description: '通往华蓝市的下坡路。',
      region: '关都',
      connections: ['mt-moon', 'cerulean-city'],
      encounters: ['rattata', 'spearow', 'ekans', 'sandshrew'],
      bgGradient: 'from-emerald-800 via-cyan-950 to-black'
  },
  'cerulean-city': {
      id: 'cerulean-city',
      name: '华蓝市',
      description: '被水包围的蓝色城市。',
      region: '关都',
      connections: ['route-4', 'route-24', 'route-5', 'route-9'],
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
      connections: ['cerulean-city'],
      encounters: ['caterpie', 'weedle', 'metapod', 'kakuna', 'pidgey', 'abra'],
      bgGradient: 'from-green-800 via-blue-900 to-black'
  },
  'route-5': {
      id: 'route-5',
      name: '5号道路',
      description: '连接华蓝市与南方的斜坡。',
      region: '关都',
      connections: ['cerulean-city', 'vermilion-city'],
      encounters: ['pidgey', 'rattata', 'jigglypuff', 'meowth'],
      bgGradient: 'from-emerald-700 via-slate-800 to-black'
  },
  'vermilion-city': {
      id: 'vermilion-city',
      name: '枯叶市',
      description: '夕阳照耀下的橙色港口城市。',
      region: '关都',
      connections: ['route-5', 'route-11'],
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
      connections: ['vermilion-city', 'route-12'],
      encounters: ['ekans', 'sandshrew', 'drowzee'],
      bgGradient: 'from-emerald-800 via-green-900 to-black'
  },
  'route-9': {
      id: 'route-9',
      name: '9号道路',
      description: '崎岖的山路，连接着华蓝市与岩山隧道。',
      region: '关都',
      connections: ['cerulean-city', 'rock-tunnel'],
      encounters: ['rattata', 'spearow', 'ekans', 'sandshrew'],
      bgGradient: 'from-stone-700 via-emerald-800 to-black'
  },
  'rock-tunnel': {
      id: 'rock-tunnel',
      name: '岩山隧道',
      description: '漆黑的隧道。需要闪光才能看清道路。',
      region: '关都',
      connections: ['route-9', 'lavender-town'],
      encounters: ['zubat', 'geodude', 'machop', 'onix', 'cubone'],
      bgGradient: 'from-gray-900 via-stone-900 to-black',
      weatherRates: { Sandstorm: 0.3 }
  },
  'lavender-town': {
      id: 'lavender-town',
      name: '紫苑镇',
      description: '高贵的紫色之镇。这里有着著名的宝可梦塔。',
      region: '关都',
      connections: ['rock-tunnel', 'route-8', 'route-12'],
      encounters: ['gastly', 'haunter', 'cubone'],
      bgGradient: 'from-purple-900 via-slate-900 to-black',
      weatherRates: { Rain: 0.2 }
  },
  'route-8': {
      id: 'route-8',
      name: '8号道路',
      description: '连接紫苑镇与彩虹市的道路。',
      region: '关都',
      connections: ['lavender-town', 'celadon-city'],
      encounters: ['pidgey', 'meowth', 'ekans', 'vulpix', 'growlithe'],
      bgGradient: 'from-emerald-800 via-stone-800 to-black'
  },
  'celadon-city': {
      id: 'celadon-city',
      name: '彩虹市',
      description: '有着名为彩虹的颜色的城市。',
      region: '关都',
      connections: ['route-8'],
      encounters: ['grimer', 'koffing'],
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
      connections: ['lavender-town', 'route-11'],
      encounters: ['oddish', 'bellsprout', 'venonat', 'krabby', 'farfetchd'],
      bgGradient: 'from-blue-900 via-cyan-900 to-black',
      weatherRates: { Rain: 0.5, Sunny: 0.3 }
  }
};
