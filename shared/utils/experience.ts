import type { Pokemon, BaseStats } from '../types/index.js';
import { SPECIES_DATA, MOVES, findSpeciesKeyByPokedexId } from '../constants/index.js';
import { calculateStats } from './stats.js';
import { checkEvolution } from './evolution.js';

/** 经验曲线公式：总经验 = Level³（官方 Medium Fast 曲线） */
export const expForLevel = (level: number) => level * level * level;

export interface ExperienceGainResult {
  updatedPokemon: Pokemon;
  leveledUp: boolean;
  levelChanges?: { oldStats: BaseStats; newStats: BaseStats };
  learnedMoves: string[];
  pendingMoves: string[]; // 招式已满4个时，待玩家选择的新招式 moveId 列表
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
    // Using official Medium Fast curve: Total Exp = Level³
    // Current Exp Base = expForLevel(Level)
    // Progress = exp (relative to current level start)
    // Next Level Threshold = expForLevel(Level+1) (absolute total exp)

    while (true) {
        // 检查是否已达到最大等级
        if (newPokemon.level >= 100) {
            newPokemon.level = 100;
            newPokemon.exp = 0;
            newPokemon.nextLevelExp = expForLevel(101) - expForLevel(100);
            finalLevel = 100;
            break;
        }

        const currentBaseExp = expForLevel(newPokemon.level);
        const totalExp = currentBaseExp + newPokemon.exp; // Absolute total exp
        const nextLevelThreshold = expForLevel(newPokemon.level + 1);

        if (totalExp >= nextLevelThreshold) {
            newPokemon.level++;
            // Calculate overflow relative to NEW level base
            const newBaseExp = expForLevel(newPokemon.level);
            newPokemon.exp = totalExp - newBaseExp;
            newPokemon.nextLevelExp = expForLevel(newPokemon.level + 1);
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
    const pendingMoves: string[] = [];

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
                                 // 招式已满，交给 UI 让玩家选择忘记哪个
                                 pendingMoves.push(m.moveId);
                             }
                         }
                     }
                 });
             }
        }
    }

    // Check Evolution Logic
    const evolutionCandidate = checkEvolution(newPokemon, leveledUp);

    return { updatedPokemon: newPokemon, leveledUp, levelChanges, learnedMoves, pendingMoves, evolutionCandidate };
};
