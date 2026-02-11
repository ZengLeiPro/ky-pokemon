import type { PokemonType } from "./types";

export interface PokemonData {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  spriteUrl: string;
  evolvesTo?: { id: number; name: string };
}

const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const POKEMON: Record<string, PokemonData> = {
  bulbasaur: {
    id: 1,
    name: "妙蛙种子",
    types: ["Grass", "Poison"],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    spriteUrl: sprite(1),
    evolvesTo: { id: 2, name: "妙蛙草" },
  },
  ivysaur: {
    id: 2,
    name: "妙蛙草",
    types: ["Grass", "Poison"],
    baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
    spriteUrl: sprite(2),
    evolvesTo: { id: 3, name: "妙蛙花" },
  },
  venusaur: {
    id: 3,
    name: "妙蛙花",
    types: ["Grass", "Poison"],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    spriteUrl: sprite(3),
  },
  charmander: {
    id: 4,
    name: "小火龙",
    types: ["Fire"],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    spriteUrl: sprite(4),
    evolvesTo: { id: 5, name: "火恐龙" },
  },
  charmeleon: {
    id: 5,
    name: "火恐龙",
    types: ["Fire"],
    baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
    spriteUrl: sprite(5),
    evolvesTo: { id: 6, name: "喷火龙" },
  },
  charizard: {
    id: 6,
    name: "喷火龙",
    types: ["Fire", "Flying"],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    spriteUrl: sprite(6),
  },
  squirtle: {
    id: 7,
    name: "杰尼龟",
    types: ["Water"],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    spriteUrl: sprite(7),
    evolvesTo: { id: 8, name: "卡咪龟" },
  },
  wartortle: {
    id: 8,
    name: "卡咪龟",
    types: ["Water"],
    baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
    spriteUrl: sprite(8),
    evolvesTo: { id: 9, name: "水箭龟" },
  },
  blastoise: {
    id: 9,
    name: "水箭龟",
    types: ["Water"],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    spriteUrl: sprite(9),
  },
  pikachu: {
    id: 25,
    name: "皮卡丘",
    types: ["Electric"],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    spriteUrl: sprite(25),
  },
  gengar: {
    id: 94,
    name: "耿鬼",
    types: ["Ghost", "Poison"],
    baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    spriteUrl: sprite(94),
  },
  gyarados: {
    id: 130,
    name: "暴鲤龙",
    types: ["Water", "Flying"],
    baseStats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
    spriteUrl: sprite(130),
  },
  eevee: {
    id: 133,
    name: "伊布",
    types: ["Normal"],
    baseStats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
    spriteUrl: sprite(133),
  },
  snorlax: {
    id: 143,
    name: "卡比兽",
    types: ["Normal"],
    baseStats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
    spriteUrl: sprite(143),
  },
  dragonite: {
    id: 149,
    name: "快龙",
    types: ["Dragon", "Flying"],
    baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
    spriteUrl: sprite(149),
  },
  mewtwo: {
    id: 150,
    name: "超梦",
    types: ["Psychic"],
    baseStats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
    spriteUrl: sprite(150),
  },
  mew: {
    id: 151,
    name: "梦幻",
    types: ["Psychic"],
    baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    spriteUrl: sprite(151),
  },
};

// Pokedex grid display - 20 Pokemon for the collection scene
export const POKEDEX_GRID = [
  { id: 1, name: "妙蛙种子", caught: true },
  { id: 4, name: "小火龙", caught: true },
  { id: 7, name: "杰尼龟", caught: true },
  { id: 25, name: "皮卡丘", caught: true },
  { id: 6, name: "喷火龙", caught: true },
  { id: 9, name: "水箭龟", caught: false },
  { id: 3, name: "妙蛙花", caught: false },
  { id: 94, name: "耿鬼", caught: true },
  { id: 130, name: "暴鲤龙", caught: true },
  { id: 133, name: "伊布", caught: true },
  { id: 143, name: "卡比兽", caught: false },
  { id: 149, name: "快龙", caught: false },
  { id: 150, name: "超梦", caught: false },
  { id: 151, name: "梦幻", caught: false },
  { id: 12, name: "巴大蝶", caught: true },
  { id: 59, name: "风速狗", caught: true },
  { id: 65, name: "胡地", caught: false },
  { id: 76, name: "隆隆岩", caught: true },
  { id: 103, name: "椰蛋树", caught: false },
  { id: 131, name: "拉普拉斯", caught: true },
];
