import { create } from 'zustand';
import { produce } from 'immer';
import { LogEntry, Pokemon, ViewState, InventoryItem, PokedexStatus, Weather, EvolutionState } from '@/types';
import { MOVES, SPECIES_DATA, WORLD_MAP } from '@/constants';
import { createPokemon, calculateDamage, gainExperience, evolvePokemon, MOVE_EFFECTS, calculateStats } from '@/lib/mechanics';
import { config } from '@/config';

const API_URL = `${config.apiUrl}/game`;
const getToken = () => localStorage.getItem('token');

function createLogEntry(message: string, type: LogEntry['type'] = 'info'): LogEntry {
  return {
    id: crypto.randomUUID(),
    message,
    timestamp: Date.now(),
    type
  };
}

const starter = createPokemon('charmander', 5, [MOVES.scratch, MOVES.ember]);

const initialPokedex: Record<number, PokedexStatus> = {};
Object.values(SPECIES_DATA).forEach(s => {
      initialPokedex[s.pokedexId!] = 'UNKNOWN';
  });
  initialPokedex[4] = 'CAUGHT'; 
  initialPokedex[19] = 'SEEN';

  const initialInventory: InventoryItem[] = [
    { 
        id: 'potion', 
        name: '伤药', 
        description: '喷雾式伤药，能恢复宝可梦20点HP。', 
        category: 'MEDICINE',
        quantity: 5
    },
    { 
        id: 'pokeball', 
        name: '精灵球', 
        description: '用于投向野生宝可梦并将其捕捉的球。', 
        category: 'POKEBALLS',
        quantity: 10
    },
    { 
        id: 'map', 
        name: '城镇地图', 
        description: '方便确认当前位置的高科技地图。', 
        category: 'KEY_ITEMS',
        quantity: 1
    }
  ];

  import { GymData } from '@/types';


interface GameState {
  view: ViewState;
  selectedPokemonId: string | null;
  logs: LogEntry[];
  playerParty: Pokemon[];
  playerStorage: Pokemon[];
  inventory: InventoryItem[];
  playerMoney: number;
  playerLocationId: string;
  pokedex: Record<number, PokedexStatus>;
  badges: string[];
  hasSelectedStarter: boolean;
  weather: Weather;
  weatherDuration: number;
  isGameLoading: boolean;

  evolution: EvolutionState;

  battle: {
    active: boolean;
    turnCount: number;
    enemy: Pokemon | null;
    enemyParty: Pokemon[];
    trainerName?: string;
    gymBadgeReward?: string;
    gymBadgeName?: string;
    playerActiveIndex: number;
    phase: 'INPUT' | 'PROCESSING' | 'ENDED' | 'FORCED_SWITCH' | 'NICKNAME';
    caughtPokemonId?: string;
  };

  setView: (view: ViewState) => void;
  setSelectedPokemon: (id: string | null) => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
  startBattle: (enemyId: string) => void;
  startGymBattle: (gym: GymData) => void;
  runAway: () => void;
  executeMove: (moveIndex: number) => Promise<void>;
  useItem: (itemId: string, targetId: string) => void;
  addItem: (itemId: string, quantity?: number) => void;
  throwPokeball: (ballId?: string) => Promise<void>;
  buyItem: (itemId: string, price: number, quantity?: number) => boolean;
  healParty: () => void;
  switchPokemon: (pokemonId: string) => void;
  setFirstPokemon: (pokemonId: string) => void;
  depositPokemon: (pokemonId: string) => boolean;
  withdrawPokemon: (pokemonId: string) => boolean;
  releasePokemon: (pokemonId: string) => boolean;
  moveTo: (locationId: string) => void;
  selectStarter: (speciesKey: string) => void;
  resetGame: () => void;
  renamePokemon: (id: string, name: string) => void;
  confirmNickname: (name?: string) => void;
  manualSave: () => void;
  loadGame: (userId: string) => Promise<void>;
  saveGame: (userId: string) => Promise<void>;

  triggerEvolution: (pokemon: Pokemon, targetSpeciesId: string) => void;
  advanceEvolutionStage: (stage: EvolutionState['stage']) => void;
  completeEvolution: () => void;
}

export const useGameStore = create<GameState>()(
  (set, get) => ({
    view: 'ROAM',
  selectedPokemonId: null,
  logs: [{ id: 'init', message: '欢迎来到关都传说。', timestamp: Date.now() }],
  playerParty: [],
  playerStorage: [],
  playerMoney: 3000,
  playerLocationId: 'pallet-town',
  pokedex: initialPokedex,
  badges: [],
  hasSelectedStarter: false,
  weather: 'None',
  weatherDuration: 0,
  isGameLoading: false,
    inventory: initialInventory,

  evolution: {
    isEvolving: false,
    pokemon: null,
    targetSpeciesId: null,
    stage: 'START'
  },

  battle: {
    active: false,
    turnCount: 0,
    enemy: null,
    enemyParty: [],
    playerActiveIndex: 0,
    phase: 'INPUT',
  },

  resetGame: async () => {
    const token = getToken();
    if (token) {
        try {
            await fetch(`${API_URL}/save`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Failed to delete remote save:', error);
        }
    }

    set({
      view: 'ROAM',
      selectedPokemonId: null,
      logs: [{ id: 'init', message: '游戏已重置。欢迎来到关都传说。', timestamp: Date.now() }],
      playerParty: [],
      playerStorage: [],
      playerMoney: 3000,
      playerLocationId: 'pallet-town',
      pokedex: initialPokedex,
      badges: [],
      hasSelectedStarter: false,
      weather: 'None',
      weatherDuration: 0,
      inventory: initialInventory,
      battle: {
        active: false,
        turnCount: 0,
        enemy: null,
        enemyParty: [],
        playerActiveIndex: 0,
        phase: 'INPUT',
      }
    });
  },

  selectStarter: (speciesKey: string) => set(produce((state: GameState) => {
    if (state.hasSelectedStarter) return;
    const starter = createPokemon(speciesKey, 5, []);
    state.playerParty = [starter];
    state.hasSelectedStarter = true;
    state.pokedex[starter.speciesData.pokedexId] = 'CAUGHT';
    state.logs.push(createLogEntry(`获得了 ${starter.speciesName}！开始你的冒险吧。`, 'urgent'));
  })),

  setView: (view) => set({ view }),
  setSelectedPokemon: (id) => set({ selectedPokemonId: id }),

  addLog: (message, type: LogEntry['type'] = 'info') => set(produce((state: GameState) => {
    state.logs.push(createLogEntry(message, type));
    if (state.logs.length > 50) state.logs.shift();
  })),

  moveTo: (locationId) => {
      const target = WORLD_MAP[locationId];
      if (!target) return;

      set(produce((state: GameState) => {
          state.playerLocationId = locationId;
          state.logs.push(createLogEntry(`抵达了 ${target.name}。`));
          
          state.weather = 'None';
          state.weatherDuration = 0;

          if (target.weatherRates) {
              const roll = Math.random();
              let cumulative = 0;
              for (const [weatherType, rate] of Object.entries(target.weatherRates)) {
                  cumulative += rate;
                  if (roll < cumulative) {
                      state.weather = weatherType as Weather;
                      state.weatherDuration = 255; 
                      let msg = '';
                      switch(state.weather) {
                          case 'Rain': msg = '天空下起了雨...'; break;
                          case 'Sunny': msg = '阳光变得有些刺眼...'; break;
                          case 'Sandstorm': msg = '周围扬起了沙尘...'; break;
                          case 'Hail': msg = '天空飘起了冰雹...'; break;
                      }
                      if (msg) state.logs.push(createLogEntry(msg));
                      break;
                  }
              }
          }
      }));
  },

  startBattle: (speciesKey) => {
    const enemyData = SPECIES_DATA[speciesKey];
    if (!enemyData) return;

    const enemy = createPokemon(speciesKey, 3 + Math.floor(Math.random() * 3), []);

    set(produce((state: GameState) => {
      state.battle.active = true;
      state.battle.enemy = enemy;
      state.battle.enemyParty = [];
      state.battle.turnCount = 1;
      state.battle.phase = 'INPUT';
      state.battle.gymBadgeReward = undefined;
      state.battle.trainerName = undefined;
      state.view = 'BATTLE';
      state.logs.push(createLogEntry(`野生的 ${enemy.speciesName} 出现了！`, 'urgent'));

      const dexId = enemyData.pokedexId!;
      if (state.pokedex[dexId] === 'UNKNOWN') {
          state.pokedex[dexId] = 'SEEN';
      }
    }));
  },

  startGymBattle: (gym) => {
      const enemyParty = gym.pokemon.map(id => createPokemon(id, gym.level, []));
      const firstEnemy = enemyParty.shift();
      if (!firstEnemy) return;

      set(produce((state: GameState) => {
          state.battle.active = true;
          state.battle.enemy = firstEnemy;
          state.battle.enemyParty = enemyParty;
          state.battle.turnCount = 1;
          state.battle.phase = 'INPUT';
          state.battle.trainerName = `${gym.leaderName}`;
          state.battle.gymBadgeReward = gym.badgeId;
          state.battle.gymBadgeName = gym.badgeName;
          state.view = 'BATTLE';
          
          state.logs.push(createLogEntry(`${gym.leaderName} 发起了挑战！`, 'urgent'));
          state.logs.push(createLogEntry(`${gym.leaderName} 派出了 ${firstEnemy.speciesName}！`, 'urgent'));

          const dexId = firstEnemy.speciesData.pokedexId;
           if (state.pokedex[dexId] === 'UNKNOWN') {
              state.pokedex[dexId] = 'SEEN';
          }
      }));
  },

  runAway: () => {
    set(produce((state: GameState) => {
      state.battle.active = false;
      state.battle.enemy = null;
      state.view = 'ROAM';
      state.logs.push(createLogEntry('成功逃跑了！'));
    }));
  },

  executeMove: async (moveIndex) => {
    const { battle, playerParty, addLog, weather } = get();
    if (!battle.active || !battle.enemy || battle.phase !== 'INPUT') return;

    set(produce((state: GameState) => { state.battle.phase = 'PROCESSING'; }));

    const playerMon = playerParty[battle.playerActiveIndex];
    const playerMoveData = playerMon.moves[moveIndex];
    
    if (!playerMoveData || playerMoveData.ppCurrent <= 0) {
        addLog("无法使用该招式！");
        set(produce((state: GameState) => { state.battle.phase = 'INPUT'; }));
        return;
    }

    const enemyMon = battle.enemy;
    const enemyMoveData = enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)];
    
    // Paralysis speed drop (1/4 speed)
    const getSpeed = (p: Pokemon) => p.status === 'PAR' ? Math.floor(p.stats.spe * 0.25) : p.stats.spe;

    const playerSpeed = getSpeed(playerMon);
    const enemySpeed = getSpeed(enemyMon);
    
    const playerGoesFirst = playerSpeed >= enemySpeed; 
    
    const executeTurn = async (attackerSnapshot: Pokemon, defenderSnapshot: Pokemon, moveData: any, isPlayer: boolean) => {
        const currentState = get();
        const latestPlayer = currentState.playerParty[currentState.battle.playerActiveIndex];
        const latestEnemy = currentState.battle.enemy;

        if (!latestEnemy || !latestPlayer) return;

        const attacker = isPlayer ? latestPlayer : latestEnemy;
        const defender = isPlayer ? latestEnemy : latestPlayer;

        if (attacker.currentHp <= 0 || defender.currentHp <= 0) return;

        // Status Checks Pre-Move
        if (attacker.status === 'SLP') {
             addLog(`${attacker.speciesName} 正在睡觉。`);
             // Chance to wake up? Simplified: 1/3 chance
             if (Math.random() < 0.33) {
                 set(produce((state: GameState) => {
                     const p = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                     if (p) delete p.status;
                 }));
                 addLog(`${attacker.speciesName} 醒过来了！`);
             } else {
                 await new Promise(r => setTimeout(r, 600));
                 return;
             }
        }

        if (attacker.status === 'FRZ') {
             addLog(`${attacker.speciesName} 身体冻结了！`);
             if (Math.random() < 0.2) {
                 set(produce((state: GameState) => {
                     const p = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                     if (p) delete p.status;
                 }));
                 addLog(`${attacker.speciesName} 的冰融化了！`);
             } else {
                 await new Promise(r => setTimeout(r, 600));
                 return;
             }
        }

        if (attacker.status === 'PAR') {
            if (Math.random() < 0.25) {
                addLog(`${attacker.speciesName} 身体麻痹动弹不得！`);
                await new Promise(r => setTimeout(r, 600));
                return;
            }
        }

        if (isPlayer) {
             set(produce((state: GameState) => {
                 state.playerParty[state.battle.playerActiveIndex].moves[moveIndex].ppCurrent--;
             }));
        }

        addLog(`${attacker.speciesName} 使用了 ${moveData.move.name}！`, 'combat');
        
        if (moveData.move.description) {
            addLog(moveData.move.description, 'info');
        }

        await new Promise(r => setTimeout(r, 800));

        const result = calculateDamage(attacker, defender, moveData.move, currentState.weather);
        
        if (result.damage > 0) {
            if (isPlayer) {
                set(produce((state: GameState) => {
                    if (state.battle.enemy) {
                        state.battle.enemy.currentHp = Math.max(0, state.battle.enemy.currentHp - result.damage);
                    }
                }));
            } else {
                 set(produce((state: GameState) => {
                     const p = state.playerParty[state.battle.playerActiveIndex];
                     p.currentHp = Math.max(0, p.currentHp - result.damage);
                 }));
            }

            if (result.isCritical) addLog("击中要害！", 'urgent');
            if (result.typeEffectiveness > 1) addLog("效果绝佳！", 'info');
            if (result.typeEffectiveness < 1 && result.typeEffectiveness > 0) addLog("效果不理想...", 'info');
            if (result.typeEffectiveness === 0) addLog("似乎没有效果。", 'info');
        } else {
            if (moveData.move.category !== 'Status') {
                addLog("但是失败了！");
            }
        }

        // Apply Move Effects (Status / Weather)
        const effect = MOVE_EFFECTS[moveData.move.id];
        if (effect) {
            const roll = Math.random();
            if (roll < effect.chance) {
                if (effect.type === 'status') {
                    // Check if defender already has status
                    const targetHasStatus = defender.status !== undefined;
                    // Type immunities (Poison vs Steel/Poison, Burn vs Fire, etc - simplified)
                    let immune = false;
                    if (effect.id === 'PSN' && (defender.types.includes('Poison') || defender.types.includes('Steel'))) immune = true;
                    if (effect.id === 'BRN' && defender.types.includes('Fire')) immune = true;
                    if (effect.id === 'FRZ' && defender.types.includes('Ice')) immune = true;
                    if (effect.id === 'PAR' && defender.types.includes('Electric')) immune = true;

                    if (!targetHasStatus && !immune && defender.currentHp > 0) {
                         set(produce((state: GameState) => {
                             const target = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                             if (target) {
                                 target.status = effect.id as any;
                                 let msg = '';
                                 switch(effect.id) {
                                     case 'BRN': msg = `${target.speciesName} 灼伤了！`; break;
                                     case 'PSN': msg = `${target.speciesName} 中毒了！`; break;
                                     case 'PAR': msg = `${target.speciesName} 麻痹了！`; break;
                                     case 'SLP': msg = `${target.speciesName} 睡着了！`; break;
                                     case 'FRZ': msg = `${target.speciesName} 冻结了！`; break;
                                 }
                                 state.logs.push(createLogEntry(msg, 'urgent'));
                             }
                         }));
                    }
                } else if (effect.type === 'weather') {
                    set(produce((state: GameState) => {
                        state.weather = effect.id as any;
                        state.weatherDuration = 5;
                        let msg = '';
                        switch(effect.id) {
                            case 'Sunny': msg = `阳光变得强烈了！`; break;
                            case 'Rain': msg = `开始下雨了！`; break;
                            case 'Sandstorm': msg = `刮起了沙暴！`; break;
                            case 'Hail': msg = `开始下冰雹了！`; break;
                        }
                        state.logs.push(createLogEntry(msg, 'info'));
                    }));
                }
            }
        }

         await new Promise(r => setTimeout(r, 600));
    };

    if (playerGoesFirst) {
        await executeTurn(playerMon, enemyMon, playerMoveData, true);
        await executeTurn(enemyMon, playerMon, enemyMoveData, false);
    } else {
        await executeTurn(enemyMon, playerMon, enemyMoveData, false);
        await executeTurn(playerMon, enemyMon, playerMoveData, true);
    }

    const finalState = get();
    const currentEnemy = finalState.battle.enemy;
    const currentPlayer = finalState.playerParty[finalState.battle.playerActiveIndex];

    // End of turn processing (Weather & Status Damage)
    if (currentEnemy && currentEnemy.currentHp > 0 && currentPlayer && currentPlayer.currentHp > 0) {
        // Weather
        if (finalState.weather !== 'None') {
             set(produce((state: GameState) => {
                 state.weatherDuration--;
                 if (state.weatherDuration <= 0) {
                     state.weather = 'None';
                     state.logs.push(createLogEntry('天气恢复了原状。'));
                 } else {
                     if (state.weather === 'Sandstorm' || state.weather === 'Hail') {
                         // Buffeting logic (simplified)
                         state.logs.push(createLogEntry(`${state.weather === 'Sandstorm' ? '沙暴' : '冰雹'} 正在袭击！`, 'info'));
                     }
                 }
             }));
        }

        // Status Damage
        const applyStatusDamage = async (p: Pokemon, isPlayer: boolean) => {
            if (p.status === 'BRN' || p.status === 'PSN') {
                const dmg = Math.floor(p.maxHp / 8);
                if (dmg > 0) {
                    set(produce((state: GameState) => {
                        const target = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                        if (target) {
                            target.currentHp = Math.max(0, target.currentHp - dmg);
                            const statusName = p.status === 'BRN' ? '灼伤' : '中毒';
                            state.logs.push(createLogEntry(`${target.speciesName} 受到了${statusName}的伤害！`, 'urgent'));
                        }
                    }));
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        };

        await applyStatusDamage(currentPlayer, true);
        // Check if player died from status
        const stateAfterPlayerDmg = get();
        if (stateAfterPlayerDmg.playerParty[stateAfterPlayerDmg.battle.playerActiveIndex].currentHp > 0) {
             await applyStatusDamage(currentEnemy, false);
        }
    }

    // Check Death (Re-fetch state because status dmg might have killed)
    const checkDeathState = get();
    const deadEnemy = checkDeathState.battle.enemy;
    const deadPlayer = checkDeathState.playerParty[checkDeathState.battle.playerActiveIndex];

    if (deadEnemy && deadEnemy.currentHp <= 0) {
        addLog(`敌方的 ${deadEnemy.speciesName} 倒下了！`);
        
        const expYield = Math.floor((currentEnemy.baseStats.hp + currentEnemy.baseStats.atk + currentEnemy.baseStats.spe) / 3); 
        const expAmount = Math.floor(expYield * currentEnemy.level / 5) + 10;
        
        set(produce((state: GameState) => {
            const p = state.playerParty[state.battle.playerActiveIndex];
            const { updatedPokemon, leveledUp, learnedMoves, evolutionCandidate } = gainExperience(p, expAmount);

            state.playerParty[state.battle.playerActiveIndex] = updatedPokemon;
            state.logs.push(createLogEntry(`获得了 ${expAmount} 点经验值。`));

            if (leveledUp) {
                state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 升到了 Lv.${updatedPokemon.level}！`, 'urgent'));

                if (learnedMoves && learnedMoves.length > 0) {
                    learnedMoves.forEach(m => {
                        state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 学会了 ${m}！`));
                    });
                }

                if (evolutionCandidate) {
                     state.logs.push(createLogEntry(`什么？ ${updatedPokemon.speciesName} 的样子...`, 'urgent'));
                     
                     state.evolution = {
                         isEvolving: true,
                         pokemon: updatedPokemon,
                         targetSpeciesId: evolutionCandidate.targetSpeciesId,
                         stage: 'START'
                     };
                }
            }

            if (state.battle.enemyParty.length > 0) {
                const nextEnemy = state.battle.enemyParty.shift();
                if (nextEnemy) {
                    state.battle.enemy = nextEnemy;
                    state.battle.turnCount = 1;
                    state.battle.phase = 'INPUT';
                    state.logs.push(createLogEntry(`${state.battle.trainerName} 派出了 ${nextEnemy.speciesName}！`, 'urgent'));
                    
                    const dexId = nextEnemy.speciesData.pokedexId;
                    if (state.pokedex[dexId] === 'UNKNOWN') {
                        state.pokedex[dexId] = 'SEEN';
                    }
                    return;
                }
            }
            
            if (state.battle.gymBadgeReward && state.battle.gymBadgeName) {
                if (!state.badges.includes(state.battle.gymBadgeReward)) {
                    state.badges.push(state.battle.gymBadgeReward);
                    state.logs.push(createLogEntry(`恭喜！你战胜了 ${state.battle.trainerName}！`, 'urgent'));
                    state.logs.push(createLogEntry(`获得了 ${state.battle.gymBadgeName}！`, 'urgent'));
                }
            }

            state.battle.active = false;
            state.battle.enemy = null;
            state.battle.enemyParty = [];
            state.battle.gymBadgeReward = undefined;
            state.battle.trainerName = undefined;
            state.playerMoney += 120;
            state.view = 'ROAM';
        }));
    } else if (currentPlayer.currentHp <= 0) {
        addLog(`${currentPlayer.speciesName} 倒下了！`);

        const hasAlivePokemon = finalState.playerParty.some(p => p.currentHp > 0);

        if (hasAlivePokemon) {
             addLog(`请选择下一个出场的宝可梦！`, 'urgent');
             set(produce((state: GameState) => {
                 state.battle.phase = 'FORCED_SWITCH';
             }));
        } else {
            addLog(`你眼前一黑...`);
            set(produce((state: GameState) => {
                 state.battle.active = false;
                 state.battle.enemy = null;
                 state.view = 'ROAM';
                 state.playerParty.forEach(p => p.currentHp = p.maxHp); 
                 state.playerMoney = Math.floor(state.playerMoney / 2);
            }));
        }
    } else {
        set(produce((state: GameState) => {
            state.battle.phase = 'INPUT';
            state.battle.turnCount++;
        }));
    }
  },

  useItem: (itemId, targetId) => set(produce((state: GameState) => {
      const itemIndex = state.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1 || state.inventory[itemIndex].quantity <= 0) return;

      const target = state.playerParty.find(p => p.id === targetId);
      if (!target) return;

      const item = state.inventory[itemIndex];

      if (item.id === 'potion') {
          const healAmount = 20;
          const oldHp = target.currentHp;
          target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
          const actualHeal = target.currentHp - oldHp;

          if (actualHeal > 0) {
              state.inventory[itemIndex].quantity--;
              state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，恢复了 ${actualHeal} 点HP！`));
          } else {
              state.logs.push(createLogEntry(`${target.speciesName} 的HP已经满了！`));
          }
      } else if (item.id === 'super-potion') {
          const healAmount = 50;
          const oldHp = target.currentHp;
          target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
          const actualHeal = target.currentHp - oldHp;
          if (actualHeal > 0) {
              state.inventory[itemIndex].quantity--;
              state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，恢复了 ${actualHeal} 点HP！`));
          } else {
              state.logs.push(createLogEntry(`${target.speciesName} 的HP已经满了！`));
          }
      } else if (item.id === 'hyper-potion') {
          const healAmount = 200;
          const oldHp = target.currentHp;
          target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
          const actualHeal = target.currentHp - oldHp;
          if (actualHeal > 0) {
              state.inventory[itemIndex].quantity--;
              state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，恢复了 ${actualHeal} 点HP！`));
          } else {
              state.logs.push(createLogEntry(`${target.speciesName} 的HP已经满了！`));
          }
      } else if (item.id === 'max-potion') {
          const oldHp = target.currentHp;
          target.currentHp = target.maxHp;
          const actualHeal = target.currentHp - oldHp;
          if (actualHeal > 0) {
              state.inventory[itemIndex].quantity--;
              state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，HP全部恢复了！`));
          } else {
              state.logs.push(createLogEntry(`${target.speciesName} 的HP已经满了！`));
          }
      } else if (item.category === 'POKEBALLS') {
          state.logs.push(createLogEntry(`${item.name}只能在战斗中使用！`, 'info'));
      } else if (item.effect) {
          item.effect(target);
          state.inventory[itemIndex].quantity--;
          state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}。`));
      }
  })),

  addItem: (itemId, quantity = 1) => set(produce((state: GameState) => {
      let existingItem = state.inventory.find(i => i.id === itemId);
      if (existingItem) {
          existingItem.quantity += quantity;
      } else {
          const newItems: Record<string, Partial<InventoryItem>> = {
              'super-potion': { name: '好伤药', description: '喷雾式伤药，能恢复宝可梦50点HP。', category: 'MEDICINE' },
              'hyper-potion': { name: '超高级伤药', description: '喷雾式伤药，能恢复宝可梦200点HP。', category: 'MEDICINE' },
              'max-potion': { name: '全满药', description: '能回复宝可梦全部HP。', category: 'MEDICINE' },
              'greatball': { name: '超级球', description: '比起精灵球更容易捉到宝可梦。', category: 'POKEBALLS' },
              'ultraball': { name: '高级球', description: '比起超级球更容易捉到宝可梦。', category: 'POKEBALLS' },
              'masterball': { name: '大师球', description: '必定能捉到野生宝可梦的终极球。', category: 'POKEBALLS' }
          };

          if (newItems[itemId]) {
              state.inventory.push({
                  id: itemId,
                  name: newItems[itemId].name!,
                  description: newItems[itemId].description!,
                  category: newItems[itemId].category!,
                  quantity: quantity
              });
              existingItem = state.inventory.find(i => i.id === itemId);
          }
      }
      state.logs.push(createLogEntry(`获得了 ${existingItem?.name || '物品'} x${quantity}！`));
  })),

  throwPokeball: async (ballId: string = 'pokeball') => {
      const { battle, playerParty, addLog } = get();
      if (!battle.active || !battle.enemy || battle.phase !== 'INPUT') return;

      const pokeballItem = get().inventory.find(i => i.id === ballId);
      if (!pokeballItem || pokeballItem.quantity <= 0) {
          addLog(`${pokeballItem?.name || '精灵球'}没有了！`, 'urgent');
          return;
      }

      set(produce((state: GameState) => { state.battle.phase = 'PROCESSING'; }));

      set(produce((state: GameState) => {
          const item = state.inventory.find(i => i.id === ballId);
          if (item) item.quantity--;
      }));

      const enemy = battle.enemy;
      const catchRate = enemy.speciesData.catchRate || 45;
      const hpRatio = enemy.currentHp / enemy.maxHp;

      let ballModifier = 1.0;
      if (ballId === 'greatball') ballModifier = 1.5;
      if (ballId === 'ultraball') ballModifier = 2.0;
      if (ballId === 'masterball') ballModifier = 255;

      const catchChance = (catchRate / 255) * (1 - hpRatio * 0.5) * ballModifier;
      const roll = Math.random();

      addLog(`扔出了${pokeballItem.name}！`, 'combat');
      await new Promise(r => setTimeout(r, 800));

      if (roll < catchChance) {
          set(produce((state: GameState) => {
               if (state.battle.enemy) {
                   const caughtPokemon = state.battle.enemy;
                   // Full heal on catch
                   caughtPokemon.currentHp = caughtPokemon.maxHp;
                   caughtPokemon.status = undefined;

                   state.pokedex[state.battle.enemy.speciesData.pokedexId!] = 'CAUGHT';

                   if (state.playerParty.length < 6) {
                       state.playerParty.push(caughtPokemon);
                   } else {
                       state.playerStorage.push(caughtPokemon);
                       state.logs.push(createLogEntry(`${caughtPokemon.speciesName} 已被传送至宝可梦盒子。`));
                   }

                   state.battle.caughtPokemonId = caughtPokemon.id;
               }
          }));

          await new Promise(r => setTimeout(r, 1200));

          set(produce((state: GameState) => {
              state.battle.phase = 'NICKNAME';
          }));
      } else {
          addLog(`${enemy.speciesName} 挣脱了精灵球！`, 'combat');
          await new Promise(r => setTimeout(r, 800));

          const playerMon = playerParty[battle.playerActiveIndex];
          if (enemy.currentHp > 0 && playerMon.currentHp > 0) {
              const enemyMoveData = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];

              addLog(`${enemy.speciesName} 使用了 ${enemyMoveData.move.name}！`, 'combat');
              await new Promise(r => setTimeout(r, 800));

              const result = calculateDamage(enemy, playerMon, enemyMoveData.move);

              if (result.damage > 0) {
                  let newHp = 0;
                  set(produce((state: GameState) => {
                      const p = state.playerParty[state.battle.playerActiveIndex];
                      p.currentHp = Math.max(0, p.currentHp - result.damage);
                      newHp = p.currentHp;
                  }));

                  let msg = `造成了 ${result.damage} 点伤害！`;
                  if (result.typeEffectiveness > 1) msg = `效果拔群！${msg}`;
                  if (result.typeEffectiveness < 1 && result.typeEffectiveness > 0) msg = `效果不理想...${msg}`;
                  if (result.isCritical) msg = `会心一击！${msg}`;

                  addLog(msg, 'combat');
                  await new Promise(r => setTimeout(r, 600));

                  if (newHp === 0) {
                      addLog(`${playerMon.speciesName} 失去了战斗能力！`, 'urgent');
                      await new Promise(r => setTimeout(r, 1000));

                      const currentState = get();
                      const hasAlivePokemon = currentState.playerParty.some(p => p.currentHp > 0);

                      if (hasAlivePokemon) {
                          addLog(`请选择下一个出场的宝可梦！`, 'urgent');
                          set(produce((state: GameState) => {
                              state.battle.phase = 'FORCED_SWITCH';
                          }));
                      } else {
                          set(produce((state: GameState) => {
                              state.battle.active = false;
                              state.battle.enemy = null;
                              state.battle.phase = 'ENDED';
                              state.view = 'ROAM';
                              state.playerMoney = Math.floor(state.playerMoney / 2);
                          }));
                          addLog(`失败了，损失了一半的金钱...`, 'urgent');
                      }
                      return;
                  }
              }
          }

          set(produce((state: GameState) => {
              state.battle.turnCount++;
              state.battle.phase = 'INPUT';
          }));
      }
  },

  buyItem: (itemId, price, quantity = 1) => {
      const state = get();
      const totalCost = price * quantity;

      if (state.playerMoney < totalCost) {
          set(produce((draft: GameState) => {
              draft.logs.push(createLogEntry('金钱不足！', 'urgent'));
          }));
          return false;
      }

      set(produce((draft: GameState) => {
          draft.playerMoney -= totalCost;
          
          let existingItem = draft.inventory.find(i => i.id === itemId);
          if (existingItem) {
              existingItem.quantity += quantity;
          } else {
              const newItems: Record<string, Partial<InventoryItem>> = {
                'super-potion': { name: '好伤药', description: '恢复 50 点 HP', category: 'MEDICINE' },
                'hyper-potion': { name: '超高级伤药', description: '恢复 200 点 HP', category: 'MEDICINE' },
                'max-potion': { name: '全满药', description: '完全恢复 HP', category: 'MEDICINE' },
                'greatball': { name: '超级球', description: '更容易捉到宝可梦', category: 'POKEBALLS' },
                'ultraball': { name: '高级球', description: '捕获率更高的球', category: 'POKEBALLS' },
                'masterball': { name: '大师球', description: '必定能捉到的终极球', category: 'POKEBALLS' }
              };
              
              const itemData = newItems[itemId];
              if (itemData) {
                draft.inventory.push({
                    id: itemId,
                    name: itemData.name!,
                    description: itemData.description!,
                    category: itemData.category || (itemId.includes('ball') ? 'POKEBALLS' : 'MEDICINE'),
                    quantity: quantity
                });
                existingItem = draft.inventory.find(i => i.id === itemId);
              }
          }
          draft.logs.push(createLogEntry(`购买了 ${existingItem?.name || '物品'} x${quantity}，花费 ¥${totalCost}`));
      }));
      return true;
  },

  healParty: () => set(produce((state: GameState) => {
      state.playerParty.forEach(p => {
          p.currentHp = p.maxHp;
          p.moves.forEach(m => m.ppCurrent = m.move.ppMax);
          delete p.status;
      });
      state.logs.push(createLogEntry('你的队伍已恢复健康。'));
  })),

  manualSave: () => {
      get().addLog('游戏已实时存档！', 'urgent');
  },

  switchPokemon: (pokemonId: string) => set(produce((state: GameState) => {
      const currentIndex = state.battle.playerActiveIndex;
      const targetIndex = state.playerParty.findIndex(p => p.id === pokemonId);

      if (targetIndex === -1 || targetIndex === currentIndex) return;

      const targetPokemon = state.playerParty[targetIndex];

      if (targetPokemon.currentHp <= 0) {
          state.logs.push(createLogEntry(`${targetPokemon.speciesName} 已倒下，无法出场！`, 'urgent'));
          return;
      }

      const temp = state.playerParty[currentIndex];
      state.playerParty[currentIndex] = targetPokemon;
      state.playerParty[targetIndex] = temp;

      state.logs.push(createLogEntry(`去吧！${targetPokemon.speciesName}！`, 'combat'));

      if (state.battle.phase === 'FORCED_SWITCH') {
          state.battle.phase = 'INPUT';
      }
  })),

  setFirstPokemon: (pokemonId: string) => set(produce((state: GameState) => {
      const targetIndex = state.playerParty.findIndex(p => p.id === pokemonId);
      if (targetIndex <= 0) return;

      const targetPokemon = state.playerParty[targetIndex];
      
      state.playerParty.splice(targetIndex, 1);
      state.playerParty.unshift(targetPokemon);
      
      state.logs.push(createLogEntry(`${targetPokemon.speciesName} 被设置为了首发宝可梦。`));
  })),

  depositPokemon: (pokemonId: string) => {
      const state = get();
      if (state.playerParty.length <= 1) {
          state.addLog("不能存入最后一只宝可梦！", 'urgent');
          return false;
      }
      const index = state.playerParty.findIndex(p => p.id === pokemonId);
      if (index === -1) return false;

      const pokemon = state.playerParty[index];

      set(produce((state: GameState) => {
          state.playerParty.splice(index, 1);
          state.playerStorage.push(pokemon);
          if (state.selectedPokemonId === pokemonId) {
             state.selectedPokemonId = null;
          }
          state.logs.push(createLogEntry(`${pokemon.speciesName} 被存入了宝可梦盒子。`));
      }));
      return true;
  },

  withdrawPokemon: (pokemonId: string) => {
      const state = get();
      if (state.playerParty.length >= 6) {
          state.addLog("队伍已经满了！", 'urgent');
          return false;
      }

      const index = state.playerStorage.findIndex(p => p.id === pokemonId);
      if (index === -1) return false;

      const pokemon = state.playerStorage[index];

      set(produce((state: GameState) => {
          state.playerStorage.splice(index, 1);
          state.playerParty.push(pokemon);
          state.logs.push(createLogEntry(`从盒子中取出了 ${pokemon.speciesName}。`));
      }));
      return true;
  },

  releasePokemon: (pokemonId: string) => {
      const state = get();
      if (state.playerParty.length <= 1) {
          state.addLog("不能放逐最后一只宝可梦！", 'urgent');
          return false;
      }

      const pokemonIndex = state.playerParty.findIndex(p => p.id === pokemonId);
      if (pokemonIndex === -1) return false;

      const pokemon = state.playerParty[pokemonIndex];

      set(produce((state: GameState) => {
          state.playerParty.splice(pokemonIndex, 1);
          if (state.selectedPokemonId === pokemonId) {
              state.selectedPokemonId = null;
          }
          state.logs.push(createLogEntry(`再见了，${pokemon.nickname || pokemon.speciesName}！希望你一切安好。`));
      }));
      return true;
  },

  renamePokemon: (id: string, name: string) => set(produce((state: GameState) => {
      const inParty = state.playerParty.find(p => p.id === id);
      if (inParty) {
          inParty.nickname = name;
          state.logs.push(createLogEntry(`${inParty.speciesName} 的名字改成了 ${name}！`));
          return;
      }

      const inStorage = state.playerStorage.find(p => p.id === id);
      if (inStorage) {
          inStorage.nickname = name;
          state.logs.push(createLogEntry(`${inStorage.speciesName} 的名字改成了 ${name}！`));
          return;
      }
  })),

  confirmNickname: (name?: string) => set(produce((state: GameState) => {
      const caughtId = state.battle.caughtPokemonId;
      if (caughtId && name) {
          const inParty = state.playerParty.find(p => p.id === caughtId);
          if (inParty) inParty.nickname = name;
          
          const inStorage = state.playerStorage.find(p => p.id === caughtId);
          if (inStorage) inStorage.nickname = name;
          
          state.logs.push(createLogEntry(`给宝可梦取名为 ${name}。`));
      }

      state.battle.active = false;
      state.battle.enemy = null;
      state.battle.phase = 'ENDED';
      state.battle.caughtPokemonId = undefined;
      state.view = 'ROAM';
  })),

  loadGame: async (userId: string) => {
      set({ isGameLoading: true });
      
      const token = getToken();
      if (!token) {
        set({ isGameLoading: false });
        return;
      }
    
      try {
        const response = await fetch(`${API_URL}/save`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        const result = await response.json();
    
        if (result.success && result.data) {
          const save = result.data;
          set({
            playerParty: save.team || [],
            playerStorage: save.pcBox || [],
            playerLocationId: save.currentLocation || 'pallet-town',
            badges: save.badges || [],
            pokedex: save.pokedex || {},
            inventory: save.inventory || get().inventory,
            playerMoney: save.money ?? 3000,
            hasSelectedStarter: (save.team?.length > 0),
            view: 'ROAM',
            isGameLoading: false
          });
          get().addLog('已从云端加载存档。');
        } else {
          get().resetGame();
          set({ isGameLoading: false });
        }
      } catch (error) {
        console.error('Failed to load game:', error);
        set({ isGameLoading: false });
      }
  },

  saveGame: async (userId: string) => {
      const token = getToken();
      if (!token) return;

      const state = get();
      
      try {
        const response = await fetch(`${API_URL}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            team: state.playerParty,
            pcBox: state.playerStorage,
            currentLocationId: state.playerLocationId,
            badges: state.badges,
            pokedex: state.pokedex,
            inventory: state.inventory.map(item => {
                const { effect, ...rest } = item;
                return rest;
            }),
            money: state.playerMoney
          })
        });
    
        const result = await response.json();
        
        if (!result.success) {
          console.error('Save failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to save game:', error);
      }
  },

  triggerEvolution: (pokemon: Pokemon, targetSpeciesId: string) => set({
    evolution: {
      isEvolving: true,
      pokemon,
      targetSpeciesId,
      stage: 'START'
    }
  }),

  advanceEvolutionStage: (stage: EvolutionState['stage']) => set(produce((state: GameState) => {
    state.evolution.stage = stage;
  })),

  completeEvolution: () => set(produce((state: GameState) => {
    const { pokemon, targetSpeciesId } = state.evolution;
    
    if (!pokemon || !targetSpeciesId) {
        state.evolution.isEvolving = false;
        return;
    }
    
    // 执行真正的进化计算
    const evolvedMon = evolvePokemon(pokemon, targetSpeciesId);
    
    // 更新队伍中的宝可梦
    const idx = state.playerParty.findIndex(p => p.id === pokemon.id);
    if (idx !== -1) {
        state.playerParty[idx] = evolvedMon;
        state.logs.push(createLogEntry(`恭喜！你的 ${pokemon.speciesName} 进化成了 ${evolvedMon.speciesName}！`, 'urgent'));
        
        // 更新图鉴
        const newDexId = evolvedMon.speciesData.pokedexId;
        if (newDexId !== undefined) {
             state.pokedex[newDexId] = 'CAUGHT';
        }
    }
    
    // 重置状态
    state.evolution = {
        isEvolving: false,
        pokemon: null,
        targetSpeciesId: null,
        stage: 'START'
    };
  })),
})
);

// --- DEBUG CHEATS ---
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.cheat_charmander = () => {
    useGameStore.setState(produce((state) => {
      // Find charmander (Pokedex #4) in party
      const charmander = state.playerParty.find((p: any) => p.speciesData.pokedexId === 4);
      
      if (!charmander) {
        console.log('未在队伍中找到小火龙！');
        return;
      }

      console.log('正在修改小火龙数据...');
      
      // Target: Lv 15, Exp close to Lv 16
      const targetLevel = 15;
      const lv15BaseExp = Math.pow(15, 3); // 3375
      const lv16BaseExp = Math.pow(16, 3); // 4096
      
      // Set Exp to be 10 points away from Lv 16
      // In the game logic, 'exp' field is relative to current level base?
      // Let's check shared/utils/experience.ts again.
      // Yes: const totalExp = currentBaseExp + newPokemon.exp;
      // So newPokemon.exp = (Total Exp) - (Current Level Base Exp)
      
      const targetTotalExp = lv16BaseExp - 10;
      const relativeExp = targetTotalExp - lv15BaseExp; // 4096 - 10 - 3375 = 711
      
      charmander.level = targetLevel;
      charmander.exp = relativeExp;
      charmander.nextLevelExp = lv16BaseExp; // Absolute value for next level threshold
      
      // Recalculate stats
      const { stats, maxHp } = calculateStats(
        charmander.baseStats, 
        charmander.ivs, 
        charmander.evs, 
        targetLevel
      );
      
      charmander.stats = stats;
      charmander.maxHp = maxHp;
      charmander.currentHp = maxHp; // Full heal
      
      state.logs.push({
        id: crypto.randomUUID(),
        message: '作弊生效：小火龙已调整至 Lv.15 (经验值 99%)',
        timestamp: Date.now(),
        type: 'urgent'
      });
      
      console.log('修改完成！请查看游戏日志。');
    }));
  };

  // @ts-ignore
  window.cheat_charmander_lv35 = () => {
    useGameStore.setState(produce((state) => {
      // @ts-ignore
      const index = state.playerParty.findIndex((p: any) => p.speciesData.pokedexId === 4);
      
      if (index === -1) {
        console.log('未在队伍中找到小火龙！');
        return;
      }

      const charmander = state.playerParty[index];
      console.log('正在为小火龙注入大量经验...');

      const lv36BaseExp = Math.pow(36, 3);
      const targetTotalExp = lv36BaseExp - 10;
      const currentTotalExp = Math.pow(charmander.level, 3) + charmander.exp;
      const expNeeded = targetTotalExp - currentTotalExp;
      
      if (expNeeded <= 0) {
        console.log('小火龙等级过高，无需调整。');
        return;
      }

      const result = gainExperience(charmander, expNeeded);
      
      state.playerParty[index] = result.updatedPokemon;
      state.playerParty[index].currentHp = state.playerParty[index].maxHp;
      state.playerParty[index].moves.forEach((m: any) => m.ppCurrent = m.move.ppMax);

      state.logs.push({
        id: crypto.randomUUID(),
        message: `作弊生效：小火龙已升至 Lv.${result.updatedPokemon.level} (Exp 99%)`,
        timestamp: Date.now(),
        type: 'urgent'
      });

      if (result.learnedMoves.length > 0) {
        state.logs.push({
          id: crypto.randomUUID(),
          message: `习得新技能：${result.learnedMoves.join(', ')}`,
          timestamp: Date.now(),
          type: 'urgent'
        });
      }
      
      console.log('修改完成！Lv.35 达成，技能已更新。');
    }));
  };
}
