export type PokemonType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Steel"
  | "Dark"
  | "Fairy";

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Grass: "#7AC74C",
  Electric: "#F7D02C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Steel: "#B7B7CE",
  Dark: "#705746",
  Fairy: "#D685AD",
};

export const TYPE_NAMES_CN: Record<PokemonType, string> = {
  Normal: "一般",
  Fire: "火",
  Water: "水",
  Grass: "草",
  Electric: "电",
  Ice: "冰",
  Fighting: "格斗",
  Poison: "毒",
  Ground: "地面",
  Flying: "飞行",
  Psychic: "超能",
  Bug: "虫",
  Rock: "岩石",
  Ghost: "幽灵",
  Dragon: "龙",
  Steel: "钢",
  Dark: "恶",
  Fairy: "妖精",
};

export const THEME = {
  gbScreen: "#8bac0f",
  gbDark: "#0f380f",
  gbLight: "#9bbc0f",
  gbDarkest: "#051f05",
  slateBg: "#0f172a",
  slateDarker: "#020617",
};
