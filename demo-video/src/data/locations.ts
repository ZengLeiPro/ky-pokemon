export interface LocationData {
  id: string;
  name: string;
  description: string;
  gymLeader?: string;
  badge?: string;
  x: number;
  y: number;
  connections: string[];
}

export const KANTO_LOCATIONS: LocationData[] = [
  {
    id: "pallet-town",
    name: "真新镇",
    description: "纯白色的开始之镇",
    x: 340,
    y: 520,
    connections: ["route-1"],
  },
  {
    id: "route-1",
    name: "1号道路",
    description: "连接真新镇与常磐市",
    x: 340,
    y: 420,
    connections: ["pallet-town", "viridian-city"],
  },
  {
    id: "viridian-city",
    name: "常磐市",
    description: "常青色的永恒之市",
    x: 340,
    y: 320,
    connections: ["route-1", "viridian-forest"],
  },
  {
    id: "viridian-forest",
    name: "常磐森林",
    description: "树木茂密的天然迷宫",
    x: 340,
    y: 220,
    connections: ["viridian-city", "pewter-city"],
  },
  {
    id: "pewter-city",
    name: "深灰市",
    description: "坐落在岩石山脚下",
    gymLeader: "小刚",
    badge: "灰色徽章",
    x: 340,
    y: 120,
    connections: ["viridian-forest", "route-3"],
  },
  {
    id: "route-3",
    name: "3号道路",
    description: "通往月见山的道路",
    x: 480,
    y: 120,
    connections: ["pewter-city", "cerulean-city"],
  },
  {
    id: "cerulean-city",
    name: "华蓝市",
    description: "水之花的闪耀之市",
    gymLeader: "小霞",
    badge: "蓝色徽章",
    x: 620,
    y: 120,
    connections: ["route-3", "route-5"],
  },
  {
    id: "route-5",
    name: "5号道路",
    description: "通往枯叶市的道路",
    x: 620,
    y: 260,
    connections: ["cerulean-city", "vermilion-city"],
  },
  {
    id: "vermilion-city",
    name: "枯叶市",
    description: "夕阳染红的港口之市",
    gymLeader: "马志士",
    badge: "橙色徽章",
    x: 620,
    y: 400,
    connections: ["route-5"],
  },
];

export const TRAVEL_PATH = ["pallet-town", "route-1", "viridian-city", "viridian-forest"];
