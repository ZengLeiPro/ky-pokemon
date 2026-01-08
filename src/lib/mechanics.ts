import { BaseStats, Move, Pokemon, PokemonType } from '../types';
import { MOVES, SPECIES_DATA } from '../constants';

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
        // This ensures if we gain multiple levels, we don't miss moves
        const speciesData = SPECIES_DATA[Object.keys(SPECIES_DATA).find(k => SPECIES_DATA[k].pokedexId === newPokemon.speciesData.pokedexId) || '']; // Reverse lookup species key by ID... inefficient but works for now since we don't store key in Pokemon object. 
        // Wait, we don't store the 'key' (e.g. 'charmander') in the Pokemon object, only speciesName ('小火龙').
        // We should probably rely on Pokedex ID or store the key.
        // For now, let's look up by pokedexId from SPECIES_DATA
        
        let speciesKey = '';
        for (const [key, data] of Object.entries(SPECIES_DATA)) {
            if (data.pokedexId === newPokemon.speciesData.pokedexId) {
                speciesKey = key;
                break;
            }
        }

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
    let evolutionCandidate: { targetSpeciesId: string } | undefined;
    if (leveledUp) {
         let speciesKey = '';
         for (const [key, data] of Object.entries(SPECIES_DATA)) {
             if (data.pokedexId === newPokemon.speciesData.pokedexId) {
                 speciesKey = key;
                 break;
             }
         }

         if (speciesKey && SPECIES_DATA[speciesKey].evolutions) {
             const evolutions = SPECIES_DATA[speciesKey].evolutions!;
             // Find first matching evolution
             const evo = evolutions.find(e => {
                 if (e.level && newPokemon.level >= e.level) return true;
                 return false;
             });

             if (evo) {
                 evolutionCandidate = { targetSpeciesId: evo.targetSpeciesId };
             }
         }
    }


    return { updatedPokemon: newPokemon, leveledUp, levelChanges, learnedMoves, evolutionCandidate };
};

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

