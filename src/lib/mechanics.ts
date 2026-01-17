import { BaseStats, Move, Pokemon, PokemonType, Weather } from '../types';
import { MOVES, SPECIES_DATA } from '../constants';

// Helper function to find species key by Pokedex ID
function findSpeciesKeyByPokedexId(pokedexId: number): string {
    for (const [key, data] of Object.entries(SPECIES_DATA)) {
        if (data.pokedexId === pokedexId) {
            return key;
        }
    }
    return '';
}

// Side Effect Map
export const MOVE_EFFECTS: Record<string, { type: 'status' | 'weather' | 'heal', id: string, chance: number, value?: number }> = {
    ember: { type: 'status', id: 'BRN', chance: 0.1 },
    flamethrower: { type: 'status', id: 'BRN', chance: 0.1 },
    fireBlast: { type: 'status', id: 'BRN', chance: 0.1 }, 
    willOWisp: { type: 'status', id: 'BRN', chance: 0.85 }, 
    poisonPowder: { type: 'status', id: 'PSN', chance: 1.0 },
    poisonSting: { type: 'status', id: 'PSN', chance: 0.3 },
    sludge: { type: 'status', id: 'PSN', chance: 0.3 },
    sleepPowder: { type: 'status', id: 'SLP', chance: 1.0 },
    hypnosis: { type: 'status', id: 'SLP', chance: 1.0 },
    sing: { type: 'status', id: 'SLP', chance: 1.0 },
    stunSpore: { type: 'status', id: 'PAR', chance: 1.0 },
    thunderWave: { type: 'status', id: 'PAR', chance: 1.0 },
    thunderShock: { type: 'status', id: 'PAR', chance: 0.1 },
    thunderbolt: { type: 'status', id: 'PAR', chance: 0.1 },
    bodySlam: { type: 'status', id: 'PAR', chance: 0.3 },
    lick: { type: 'status', id: 'PAR', chance: 0.3 },
    iceBeam: { type: 'status', id: 'FRZ', chance: 0.1 },
    powderSnow: { type: 'status', id: 'FRZ', chance: 0.1 },
    blizzard: { type: 'status', id: 'FRZ', chance: 0.1 },
    
    sunnyDay: { type: 'weather', id: 'Sunny', chance: 1.0 },
    rainDance: { type: 'weather', id: 'Rain', chance: 1.0 },
    sandstorm: { type: 'weather', id: 'Sandstorm', chance: 1.0 },
    hail: { type: 'weather', id: 'Hail', chance: 1.0 },
};

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

    // If no moves provided, try to populate from learnset up to current level
    let initialMoves = moves;
    if (moves.length === 0 && data.learnset) {
        const learnedMoves = data.learnset
            .filter(l => l.level <= level)
            .map(l => MOVES[l.moveId])
            .filter(m => !!m); // Filter out undefined moves if any
        
        // Take last 4 moves
        initialMoves = learnedMoves.slice(-4);
    }
    
    // If still no moves (e.g. data missing), fallback to tackle
    if (initialMoves.length === 0) {
        initialMoves = [MOVES.tackle];
    }

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
        moves: initialMoves.map(m => ({ move: m, ppCurrent: m.ppMax })),
        spriteUrl: data.spriteUrl,
        exp: 0,
        nextLevelExp: Math.pow(level + 1, 3), // Simplified Cubic exp curve
        speciesData: {
            pokedexId: data.pokedexId,
            catchRate: data.catchRate
        }
    };
};



// 完整的 18x18 属性克制表 (Gen 3+ 官方数据)
// 格式: TYPE_CHART[攻击属性][防御属性] = 倍率
// 倍率: 0 = 无效, 0.5 = 效果不佳, 1 = 普通, 2 = 效果拔群
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 1
  },
  Fire: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 0.5, Steel: 2, Dark: 1, Fairy: 0.5
  },
  Water: {
    Normal: 1, Fire: 2, Water: 0.5, Grass: 0.5, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 0.5, Steel: 1, Dark: 1, Fairy: 0.5
  },
  Grass: {
    Normal: 1, Fire: 0.5, Water: 2, Grass: 0.5, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 0.5, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Electric: {
    Normal: 1, Fire: 1, Water: 2, Grass: 0.5, Electric: 0.5, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 0, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 0.5, Steel: 1, Dark: 1, Fairy: 0.5
  },
  Ice: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Ice: 0.5,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Fighting: {
    Normal: 2, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 0.5, Bug: 0.5,
    Rock: 2, Ghost: 0, Dragon: 1, Steel: 2, Dark: 2, Fairy: 0.5
  },
  Poison: {
    Normal: 1, Fire: 1, Water: 1, Grass: 2, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0.5, Dragon: 1, Steel: 0, Dark: 1, Fairy: 2
  },
  Ground: {
    Normal: 1, Fire: 2, Water: 1, Grass: 0.5, Electric: 2, Ice: 1,
    Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 1, Steel: 2, Dark: 1, Fairy: 0.5
  },
  Flying: {
    Normal: 1, Fire: 1, Water: 1, Grass: 2, Electric: 0.5, Ice: 1,
    Fighting: 2, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Psychic: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 2, Poison: 2, Ground: 1, Flying: 1, Psychic: 0.5, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 0, Fairy: 1
  },
  Bug: {
    Normal: 1, Fire: 0.5, Water: 1, Grass: 2, Electric: 1, Ice: 1,
    Fighting: 0.5, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 0.5, Dragon: 1, Steel: 0.5, Dark: 2, Fairy: 0.5
  },
  Rock: {
    Normal: 1, Fire: 2, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 0.5, Poison: 1, Ground: 0.5, Flying: 2, Psychic: 1, Bug: 2,
    Rock: 1, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Ghost: {
    Normal: 0, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Steel: 0.5, Dark: 2, Fairy: 0.5
  },
  Dragon: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 1, Fairy: 0
  },
  Steel: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 0.5, Electric: 0.5, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Dark: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 0.5, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Steel: 1, Dark: 0.5, Fairy: 0.5
  },
  Fairy: {
    Normal: 1, Fire: 0.5, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 2, Poison: 0.5, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 2, Fairy: 0.5
  }
};

const getTypeEffectiveness = (moveType: PokemonType, targetTypes: PokemonType[]): number => {
  let multiplier = 1.0;

  targetTypes.forEach(tType => {
    const chart = TYPE_CHART[moveType];
    if (chart) {
      const effectiveness = chart[tType];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    }
  });

  return multiplier;
};

export const calculateDamage = (
    attacker: Pokemon, 
    defender: Pokemon, 
    move: Move, 
    weather: Weather = 'None'
): { damage: number, isCritical: boolean, typeEffectiveness: number } => {
  if (move.category === 'Status') return { damage: 0, isCritical: false, typeEffectiveness: 1 };

  let a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  const d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

  if (attacker.status === 'BRN' && move.category === 'Physical') {
      a = Math.floor(a * 0.5);
  }

  let power = move.power;
  if (weather === 'Sunny') {
      if (move.type === 'Fire') power = Math.floor(power * 1.5);
      if (move.type === 'Water') power = Math.floor(power * 0.5);
  } else if (weather === 'Rain') {
      if (move.type === 'Water') power = Math.floor(power * 1.5);
      if (move.type === 'Fire') power = Math.floor(power * 0.5);
  }

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const baseDamage = (levelFactor * power * (a / d)) / 50 + 2;

  // Modifiers
  const isCritical = Math.random() < 0.0625; // 1/16 crit rate
  const critMod = isCritical ? 1.5 : 1.0;
  
  const randomMod = (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100;
  
  const stabMod = attacker.types.includes(move.type) ? 1.5 : 1.0;
  
  const typeMod = getTypeEffectiveness(move.type, defender.types);

  const damage = Math.floor(baseDamage * critMod * randomMod * stabMod * typeMod);

  return { damage, isCritical, typeEffectiveness: typeMod };
};

export const gainExperience = (
    pokemon: Pokemon, 
    amount: number
): { 
    updatedPokemon: Pokemon, 
    leveledUp: boolean, 
    levelChanges?: { oldStats: BaseStats, newStats: BaseStats },
    learnedMoves: string[], // Names of learned moves
    evolutionCandidate?: { targetSpeciesId: string } // Next evolution if eligible
} => {
    // Create a shallow copy first, then deep copy specific properties if needed
    const newPokemon = { ...pokemon };
    // Stats needs to be a new object if we modify it
    newPokemon.stats = { ...pokemon.stats };
    // Moves array needs to be copied if we push new moves
    newPokemon.moves = [...pokemon.moves];

    newPokemon.exp += amount;

    let leveledUp = false;
    const oldStats = { ...newPokemon.stats };
    const startLevel = pokemon.level;
    let finalLevel = startLevel;
    
    // Check for level up
    // Using simple cubic curve: Total Exp = Level^3
    // Current Exp Base = Level^3
    // Progress = exp (relative to current level start)
    // Next Level Threshold = (Level+1)^3 (absolute total exp)
    
    while (true) {
        const currentBaseExp = Math.pow(newPokemon.level, 3);
        const totalExp = currentBaseExp + newPokemon.exp; // Absolute total exp
        const nextLevelThreshold = Math.pow(newPokemon.level + 1, 3);

        if (totalExp >= nextLevelThreshold) {
            newPokemon.level++;
            // Calculate overflow relative to NEW level base
            const newBaseExp = Math.pow(newPokemon.level, 3);
            newPokemon.exp = totalExp - newBaseExp; 
            newPokemon.nextLevelExp = Math.pow(newPokemon.level + 1, 3);
            leveledUp = true;
        } else {
            // Not leveling up (or anymore)
            // Ensure nextLevelExp is set correctly (it might already be)
            newPokemon.nextLevelExp = nextLevelThreshold;
            finalLevel = newPokemon.level;
            break;
        }
    }

    let levelChanges;
    const learnedMoves: string[] = [];
    
    if (leveledUp) {
        // Recalculate stats
        const { stats, maxHp } = calculateStats(newPokemon.baseStats, newPokemon.ivs, newPokemon.evs, newPokemon.level);
        
        // Heal the HP difference (Standard Pokemon mechanic: Current HP increases by max HP gain)
        const hpDiff = maxHp - newPokemon.maxHp;
        newPokemon.maxHp = maxHp;
        newPokemon.currentHp += hpDiff;
        newPokemon.stats = stats;
        
        levelChanges = {
            oldStats,
            newStats: stats
        };

        // Check for Move Learning (Iterate from startLevel + 1 to finalLevel)
        const speciesKey = findSpeciesKeyByPokedexId(newPokemon.speciesData.pokedexId);

        if (speciesKey && SPECIES_DATA[speciesKey].learnset) {
             const learnset = SPECIES_DATA[speciesKey].learnset!;
             for (let lvl = startLevel + 1; lvl <= finalLevel; lvl++) {
                 const movesToLearn = learnset.filter(l => l.level === lvl);
                 movesToLearn.forEach(m => {
                     const moveData = MOVES[m.moveId];
                     if (moveData) {
                         // Check if already known
                         if (!newPokemon.moves.find(pm => pm.move.id === moveData.id)) {
                             if (newPokemon.moves.length < 4) {
                                 newPokemon.moves.push({ move: moveData, ppCurrent: moveData.ppMax });
                                 learnedMoves.push(moveData.name);
                             } else {
                                 // Full! For MVP, we just notify "Could not learn X" or auto-replace first non-damaging move?
                                 // Let's keep it simple: Auto-replace the first move (Slot 1) for now to ensure user sees new moves
                                 // Ideally this should be a UI choice.
                                 // Let's implement "Auto-Forget Slot 1" for MVP to keep game dynamic.
                                 const forgotten = newPokemon.moves[0].move.name;
                                 newPokemon.moves.shift();
                                 newPokemon.moves.push({ move: moveData, ppCurrent: moveData.ppMax });
                                 learnedMoves.push(`${moveData.name} (忘记了 ${forgotten})`);
                             }
                         }
                     }
                 });
             }
        }
    }

    // Check Evolution Logic
    const evolutionCandidate = checkEvolution(newPokemon, leveledUp);

    return { updatedPokemon: newPokemon, leveledUp, levelChanges, learnedMoves, evolutionCandidate };
};

export function checkEvolution(pokemon: Pokemon, leveledUp: boolean = true): { targetSpeciesId: string } | undefined {
    if (!leveledUp) return undefined;

    const speciesKey = findSpeciesKeyByPokedexId(pokemon.speciesData.pokedexId);

    if (speciesKey && SPECIES_DATA[speciesKey].evolutions) {
        const evolutions = SPECIES_DATA[speciesKey].evolutions!;
        const evo = evolutions.find(e => e.level && pokemon.level >= e.level);

        if (evo) {
            return { targetSpeciesId: evo.targetSpeciesId };
        }
    }
    return undefined;
}

export const evolvePokemon = (pokemon: Pokemon, targetSpeciesKey: string): Pokemon => {
    const data = SPECIES_DATA[targetSpeciesKey];
    if (!data) throw new Error(`Evolution target ${targetSpeciesKey} not found`);

    const newPokemon = { ...pokemon };
    
    newPokemon.speciesName = data.speciesName!;
    newPokemon.types = data.types!;
    newPokemon.baseStats = data.baseStats!;
    newPokemon.spriteUrl = data.spriteUrl;
    newPokemon.speciesData = {
        pokedexId: data.pokedexId!,
        catchRate: data.catchRate!
    };

    // Recalculate stats with new Base Stats
    // Keep IVs/EVs/Level same
    const { stats, maxHp } = calculateStats(newPokemon.baseStats, newPokemon.ivs, newPokemon.evs, newPokemon.level);
    
    // Adjust HP current based on max HP increase (or decrease? rarely happens)
    const hpDiff = maxHp - pokemon.maxHp;
    newPokemon.maxHp = maxHp;
    newPokemon.currentHp = Math.min(maxHp, Math.max(0, newPokemon.currentHp + hpDiff));
    newPokemon.stats = stats;

    return newPokemon;
};

