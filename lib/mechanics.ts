import { BaseStats, Move, Pokemon, PokemonType } from '../types';
import { SPECIES_DATA } from '../constants';

// Standard Gen 3+ Formula for stats
export const calculateStats = (base: BaseStats, ivs: BaseStats, evs: BaseStats, level: number): { stats: BaseStats, maxHp: number } => {
  const calcStat = (statName: keyof BaseStats, isHp: boolean) => {
    const b = base[statName];
    const i = ivs[statName];
    const e = evs[statName];
    
    if (isHp) {
      return Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + level + 10;
    } else {
      // Ignoring Nature for simplicity in this demo, assumed Neutral (1.0)
      return Math.floor((Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + 5) * 1.0);
    }
  };

  const maxHp = calcStat('hp', true);
  
  return {
    maxHp,
    stats: {
      hp: maxHp,
      atk: calcStat('atk', false),
      def: calcStat('def', false),
      spa: calcStat('spa', false),
      spd: calcStat('spd', false),
      spe: calcStat('spe', false),
    }
  };
};

export const createPokemon = (speciesKey: string, level: number, moves: Move[]): Pokemon => {
    const data = SPECIES_DATA[speciesKey];
    
    if (!data) throw new Error(`Species ${speciesKey} not found`);

    const ivs: BaseStats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }; // Perfect IVs for demo
    const evs: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    
    const { stats, maxHp } = calculateStats(data.baseStats!, ivs, evs, level);

    return {
        id: crypto.randomUUID(),
        speciesName: data.speciesName!,
        level,
        types: data.types!,
        baseStats: data.baseStats!,
        ivs,
        evs,
        nature: '勤奋',
        currentHp: maxHp,
        maxHp,
        stats,
        moves: moves.map(m => ({ move: m, ppCurrent: m.ppMax })),
        spriteUrl: data.spriteUrl,
        exp: 0,
        nextLevelExp: Math.pow(level + 1, 3), // Simplified Cubic exp curve
    };
};


const getTypeEffectiveness = (moveType: PokemonType, targetTypes: PokemonType[]): number => {
    // Simplified chart
    const superEffective: Record<string, string[]> = {
        'Fire': ['Grass', 'Ice', 'Bug', 'Steel'],
        'Water': ['Fire', 'Ground', 'Rock'],
        'Grass': ['Water', 'Ground', 'Rock'],
        'Electric': ['Water', 'Flying'],
    };
    
    const notVeryEffective: Record<string, string[]> = {
        'Fire': ['Fire', 'Water', 'Rock', 'Dragon'],
        'Water': ['Water', 'Grass', 'Dragon'],
        'Grass': ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
        'Electric': ['Electric', 'Grass', 'Dragon', 'Ground']
    };

    let multiplier = 1.0;
    
    targetTypes.forEach(tType => {
        if (superEffective[moveType]?.includes(tType)) multiplier *= 2;
        if (notVeryEffective[moveType]?.includes(tType)) multiplier *= 0.5;
        if (moveType === 'Electric' && tType === 'Ground') multiplier *= 0;
    });

    return multiplier;
};

export const calculateDamage = (attacker: Pokemon, defender: Pokemon, move: Move): { damage: number, isCritical: boolean, typeEffectiveness: number } => {
  if (move.category === 'Status') return { damage: 0, isCritical: false, typeEffectiveness: 1 };

  const a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  const d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const baseDamage = (levelFactor * move.power * (a / d)) / 50 + 2;

  // Modifiers
  const isCritical = Math.random() < 0.0625; // 1/16 crit rate
  const critMod = isCritical ? 1.5 : 1.0;
  
  const randomMod = (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100;
  
  const stabMod = attacker.types.includes(move.type) ? 1.5 : 1.0;
  
  const typeMod = getTypeEffectiveness(move.type, defender.types);

  const damage = Math.floor(baseDamage * critMod * randomMod * stabMod * typeMod);

  return { damage, isCritical, typeEffectiveness: typeMod };
};
