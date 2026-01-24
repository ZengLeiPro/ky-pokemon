import type { Pokemon, BaseStats } from '../types/index.js';
import { SPECIES_DATA, MOVES, findSpeciesKeyByPokedexId } from '../constants/index.js';
import { calculateStats } from './stats.js';
import { checkEvolution } from './evolution.js';

export interface ExperienceGainResult {
  updatedPokemon: Pokemon;
  leveledUp: boolean;
  levelChanges?: { oldStats: BaseStats; newStats: BaseStats };
  learnedMoves: string[];
  evolutionCandidate?: { targetSpeciesId: string };
}

/**
 * 处理经验获取与升级
 */
export const gainExperience = (
  pokemon: Pokemon,
  amount: number
): ExperienceGainResult => {
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
        // 检查是否已达到最大等级
        if (newPokemon.level >= 100) {
            newPokemon.level = 100;
            newPokemon.exp = 0;
            newPokemon.nextLevelExp = Math.pow(101, 3) - Math.pow(100, 3);
            finalLevel = 100;
            break;
        }

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
