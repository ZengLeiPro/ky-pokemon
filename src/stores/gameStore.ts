import { create } from 'zustand';
import { produce } from 'immer';
import { LogEntry, Pokemon, ViewState, InventoryItem, PokedexStatus, Weather, EvolutionState, GymData, LegendaryProgress } from '@/types';
import { MOVES, SPECIES_DATA, WORLD_MAP } from '@/constants';
import { createPokemon, calculateDamage, gainExperience, evolvePokemon, MOVE_EFFECTS, calculateStats, expForLevel } from '@/lib/mechanics';
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
  playerSpriteIndex: number;
  weather: Weather;
  weatherDuration: number;
  isGameLoading: boolean;
  legendaryProgress: Record<string, LegendaryProgress>;  // 传说宝可梦捕获进度

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
    phase: 'INPUT' | 'PROCESSING' | 'ENDED' | 'FORCED_SWITCH' | 'NICKNAME' | 'MOVE_LEARN';
    caughtPokemonId?: string;
    isLegendary?: boolean;  // 是否是传说宝可梦战斗
    legendarySpeciesId?: string;  // 传说宝可梦的物种ID
    pendingMoveLearn?: {
      pokemonIndex: number;
      moveId: string;
      remainingMoves: string[]; // 剩余待学的招式 moveId 列表
    };
  };

  gameMode: 'NORMAL' | 'CHEAT';
  setGameMode: (mode: 'NORMAL' | 'CHEAT') => void;

  setPlayerSpriteIndex: (index: number) => void;
  setView: (view: ViewState) => void;
  setSelectedPokemon: (id: string | null) => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
  startBattle: (enemyId: string) => void;
  startLegendaryBattle: (speciesId: string, level: number) => void;
  startGymBattle: (gym: GymData) => void;
  runAway: () => void;
  executeMove: (moveIndex: number) => Promise<void>;
  applyItem: (itemId: string, targetId: string) => void;
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

  // 招式管理
  learnPendingMove: (forgetIndex: number | null) => void;
  forgetMove: (pokemonId: string, moveIndex: number) => void;
  learnMove: (pokemonId: string, moveId: string, forgetIndex?: number) => void;
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
  playerSpriteIndex: 0,
  weather: 'None',
  weatherDuration: 0,
  isGameLoading: false,
  legendaryProgress: {},
    inventory: initialInventory,
    gameMode: 'NORMAL',

    setGameMode: (mode) => set({ gameMode: mode }),

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
      playerSpriteIndex: 0,
      weather: 'None',
      weatherDuration: 0,
      inventory: initialInventory,
      legendaryProgress: {},
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

  setPlayerSpriteIndex: (index) => set({ playerSpriteIndex: index }),
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

    const defaultStages = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 });

    set(produce((state: GameState) => {
      enemy.statStages = defaultStages();
      state.battle.active = true;
      state.battle.enemy = enemy;
      state.battle.enemyParty = [];
      state.battle.turnCount = 1;
      state.battle.phase = 'INPUT';
      state.battle.gymBadgeReward = undefined;
      state.battle.trainerName = undefined;
      state.battle.isLegendary = false;
      state.battle.legendarySpeciesId = undefined;
      state.view = 'BATTLE';
      // 初始化玩家出战宝可梦的能力等级
      state.playerParty[state.battle.playerActiveIndex].statStages = defaultStages();
      state.logs.push(createLogEntry(`野生的 ${enemy.speciesName} 出现了！`, 'urgent'));

      const dexId = enemyData.pokedexId!;
      if (state.pokedex[dexId] === 'UNKNOWN') {
          state.pokedex[dexId] = 'SEEN';
      }
    }));
  },

  startLegendaryBattle: (speciesId: string, level: number) => {
    const enemyData = SPECIES_DATA[speciesId];
    if (!enemyData) return;

    const enemy = createPokemon(speciesId, level, []);
    const defaultStages = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 });

    set(produce((state: GameState) => {
      enemy.statStages = defaultStages();
      state.battle.active = true;
      state.battle.enemy = enemy;
      state.battle.enemyParty = [];
      state.battle.turnCount = 1;
      state.battle.phase = 'INPUT';
      state.battle.gymBadgeReward = undefined;
      state.battle.trainerName = undefined;
      state.battle.isLegendary = true;
      state.battle.legendarySpeciesId = speciesId;
      state.view = 'BATTLE';
      state.playerParty[state.battle.playerActiveIndex].statStages = defaultStages();
      state.logs.push(createLogEntry(`传说的 ${enemy.speciesName} 出现了！`, 'urgent'));

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

      const defaultStages = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 });

      set(produce((state: GameState) => {
          firstEnemy.statStages = defaultStages();
          state.battle.active = true;
          state.battle.enemy = firstEnemy;
          state.battle.enemyParty = enemyParty;
          state.battle.turnCount = 1;
          state.battle.phase = 'INPUT';
          state.battle.trainerName = `${gym.leaderName}`;
          state.battle.gymBadgeReward = gym.badgeId;
          state.battle.gymBadgeName = gym.badgeName;
          state.view = 'BATTLE';
          state.playerParty[state.battle.playerActiveIndex].statStages = defaultStages();

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
      // 如果是传说宝可梦战斗，逃跑后也会消失
      if (state.battle.isLegendary && state.battle.legendarySpeciesId) {
        state.legendaryProgress[state.battle.legendarySpeciesId] = {
          captured: false,
          defeated: true
        };
        state.logs.push(createLogEntry('传说的宝可梦消失在了远方...', 'urgent'));
      }

      state.battle.active = false;
      state.battle.enemy = null;
      state.battle.isLegendary = false;
      state.battle.legendarySpeciesId = undefined;
      state.view = 'ROAM';
      state.playerParty.forEach(p => { p.statStages = undefined; });
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
    
    // 速度计算：考虑能力等级和麻痹
    const getSpeed = (p: Pokemon) => {
        let spe = p.stats.spe;
        if (p.statStages) {
            const stage = p.statStages.spe;
            if (stage >= 0) spe = Math.floor(spe * (2 + stage) / 2);
            else spe = Math.floor(spe * 2 / (2 - stage));
        }
        if (p.status === 'PAR') spe = Math.floor(spe * 0.25);
        return spe;
    };

    const playerSpeed = getSpeed(playerMon);
    const enemySpeed = getSpeed(enemyMon);
    
    // 先制判断：优先度 > 速度
    const playerPriority = playerMoveData.move.priority || 0;
    const enemyPriority = enemyMoveData.move.priority || 0;
    const playerGoesFirst = playerPriority !== enemyPriority
        ? playerPriority > enemyPriority
        : playerSpeed >= enemySpeed;
    
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
        await new Promise(r => setTimeout(r, 800));

        // 命中判定（考虑命中/闪避等级）
        let moveAccuracy = moveData.move.accuracy;
        if (moveAccuracy < 100) {
            const atkAcc = attacker.statStages?.accuracy || 0;
            const defEva = defender.statStages?.evasion || 0;
            const accStage = atkAcc - defEva;
            const accMod = accStage >= 0 ? (3 + accStage) / 3 : 3 / (3 - accStage);
            moveAccuracy = Math.floor(moveAccuracy * accMod);
            if (Math.random() * 100 >= moveAccuracy) {
                addLog(`${attacker.speciesName} 的攻击没有命中！`);
                await new Promise(r => setTimeout(r, 600));
                return;
            }
        }

        const effects = MOVE_EFFECTS[moveData.move.id];

        // 检查是否为固定伤害招式
        const fixedDmgEffect = effects?.find(e => e.type === 'fixed_damage');
        const falseSwipeEffect = effects?.find(e => e.type === 'false_swipe');
        const drainEffect = effects?.find(e => e.type === 'drain');
        const recoilEffect = effects?.find(e => e.type === 'recoil');

        let actualDamage = 0;

        if (fixedDmgEffect) {
            // 固定伤害：音爆=20，黑夜魔影/地球上投=等级
            actualDamage = fixedDmgEffect.value === -1 ? attacker.level : (fixedDmgEffect.value || 0);
            const typeMod = moveData.move.type === 'Ghost' ?
                (defender.types.includes('Normal') ? 0 : 1) :
                (moveData.move.type === 'Normal' ? (defender.types.includes('Ghost') ? 0 : 1) :
                (moveData.move.type === 'Fighting' ? (defender.types.includes('Ghost') ? 0 : 1) : 1));
            if (typeMod === 0) {
                addLog("似乎没有效果。", 'info');
                actualDamage = 0;
            }
        } else if (moveData.move.category !== 'Status') {
            const result = calculateDamage(attacker, defender, moveData.move, currentState.weather);
            actualDamage = result.damage;

            if (result.isCritical) addLog("击中要害！", 'urgent');
            if (result.typeEffectiveness > 1) addLog("效果绝佳！", 'info');
            if (result.typeEffectiveness < 1 && result.typeEffectiveness > 0) addLog("效果不理想...", 'info');
            if (result.typeEffectiveness === 0) { addLog("似乎没有效果。", 'info'); actualDamage = 0; }
        }

        // 点到为止：至少留 1 HP
        if (falseSwipeEffect && actualDamage > 0) {
            if (defender.currentHp - actualDamage < 1) {
                actualDamage = Math.max(0, defender.currentHp - 1);
            }
        }

        // 扣血
        if (actualDamage > 0) {
            if (isPlayer) {
                set(produce((state: GameState) => {
                    if (state.battle.enemy) {
                        state.battle.enemy.currentHp = Math.max(0, state.battle.enemy.currentHp - actualDamage);
                    }
                }));
            } else {
                set(produce((state: GameState) => {
                    const p = state.playerParty[state.battle.playerActiveIndex];
                    p.currentHp = Math.max(0, p.currentHp - actualDamage);
                }));
            }
            addLog(`造成了 ${actualDamage} 点伤害！`, 'combat');
        } else if (moveData.move.category !== 'Status' && !fixedDmgEffect) {
            addLog("但是失败了！");
        }

        // 吸血回复
        if (drainEffect && actualDamage > 0) {
            const healAmount = Math.floor(actualDamage * (drainEffect.value || 0.5));
            if (healAmount > 0) {
                set(produce((state: GameState) => {
                    const self = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                    if (self) {
                        self.currentHp = Math.min(self.maxHp, self.currentHp + healAmount);
                    }
                }));
                addLog(`${attacker.speciesName} 吸收了对手的体力！`);
            }
        }

        // 反伤
        if (recoilEffect && actualDamage > 0) {
            const recoilDmg = Math.floor(actualDamage * (recoilEffect.value || 0.25));
            if (recoilDmg > 0) {
                set(produce((state: GameState) => {
                    const self = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                    if (self) {
                        self.currentHp = Math.max(0, self.currentHp - recoilDmg);
                    }
                }));
                addLog(`${attacker.speciesName} 受到了反作用力伤害！`);
            }
        }

        // 应用招式效果
        if (effects) {
            for (const effect of effects) {
                const roll = Math.random();
                if (roll >= effect.chance) continue;

                if (effect.type === 'status') {
                    const targetHasStatus = defender.status !== undefined;
                    let immune = false;
                    if (effect.id === 'PSN' && (defender.types.includes('Poison') || defender.types.includes('Steel'))) immune = true;
                    if (effect.id === 'BRN' && defender.types.includes('Fire')) immune = true;
                    if (effect.id === 'FRZ' && defender.types.includes('Ice')) immune = true;
                    if (effect.id === 'PAR' && defender.types.includes('Electric')) immune = true;

                    if (!targetHasStatus && !immune && defender.currentHp > 0) {
                        set(produce((state: GameState) => {
                            const target = isPlayer ? state.battle.enemy : state.playerParty[state.battle.playerActiveIndex];
                            if (target) {
                                target.status = effect.id as any;
                                const msgs: Record<string, string> = {
                                    'BRN': `${target.speciesName} 灼伤了！`,
                                    'PSN': `${target.speciesName} 中毒了！`,
                                    'PAR': `${target.speciesName} 麻痹了！`,
                                    'SLP': `${target.speciesName} 睡着了！`,
                                    'FRZ': `${target.speciesName} 冻结了！`,
                                };
                                state.logs.push(createLogEntry(msgs[effect.id!] || '', 'urgent'));
                            }
                        }));
                    }
                } else if (effect.type === 'self_status') {
                    // 自我施加状态（如睡觉）
                    set(produce((state: GameState) => {
                        const self = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                        if (self) {
                            self.status = effect.id as any;
                            if (effect.id === 'SLP') state.logs.push(createLogEntry(`${self.speciesName} 睡着了！`));
                        }
                    }));
                } else if (effect.type === 'weather') {
                    set(produce((state: GameState) => {
                        state.weather = effect.id as any;
                        state.weatherDuration = 5;
                        const msgs: Record<string, string> = {
                            'Sunny': '阳光变得强烈了！',
                            'Rain': '开始下雨了！',
                            'Sandstorm': '刮起了沙暴！',
                            'Hail': '开始下冰雹了！',
                        };
                        state.logs.push(createLogEntry(msgs[effect.id!] || '', 'info'));
                    }));
                } else if (effect.type === 'stat') {
                    // 能力变化
                    const targetIsOpponent = effect.target === 'opponent';
                    set(produce((state: GameState) => {
                        const target = targetIsOpponent
                            ? (isPlayer ? state.battle.enemy : state.playerParty[state.battle.playerActiveIndex])
                            : (isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy);
                        if (!target || target.currentHp <= 0) return;

                        if (!target.statStages) {
                            target.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
                        }

                        const stat = effect.stat as keyof typeof target.statStages;
                        const stages = effect.stages || 0;
                        const oldVal = target.statStages[stat];
                        target.statStages[stat] = Math.max(-6, Math.min(6, oldVal + stages));
                        const newVal = target.statStages[stat];

                        if (newVal !== oldVal) {
                            const statNames: Record<string, string> = {
                                atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度',
                                accuracy: '命中率', evasion: '闪避率'
                            };
                            const change = stages > 0
                                ? (stages >= 2 ? '大幅提高' : '提高')
                                : (stages <= -2 ? '大幅降低' : '降低');
                            state.logs.push(createLogEntry(
                                `${target.speciesName} 的${statNames[stat] || stat}${change}了！`, 'info'
                            ));
                        } else {
                            const direction = stages > 0 ? '已经无法再提高了' : '已经无法再降低了';
                            state.logs.push(createLogEntry(
                                `${target.speciesName} 的能力${direction}！`, 'info'
                            ));
                        }
                    }));
                } else if (effect.type === 'heal') {
                    // 回复（自我再生、睡觉等）
                    const healRatio = effect.value || 0.5;
                    set(produce((state: GameState) => {
                        const self = isPlayer ? state.playerParty[state.battle.playerActiveIndex] : state.battle.enemy;
                        if (self) {
                            const healAmount = Math.floor(self.maxHp * healRatio);
                            const oldHp = self.currentHp;
                            self.currentHp = Math.min(self.maxHp, self.currentHp + healAmount);
                            const actual = self.currentHp - oldHp;
                            if (actual > 0) {
                                state.logs.push(createLogEntry(`${self.speciesName} 回复了 ${actual} 点HP！`, 'info'));
                            }
                            // 睡觉招式同时清除异常状态
                            if (healRatio >= 1.0) {
                                delete self.status;
                            }
                        }
                    }));
                }
                // drain、recoil、fixed_damage、false_swipe 已在上方处理
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
            // === 经验共享：参战宝可梦100%，其他存活宝可梦50% ===
            const activeIdx = state.battle.playerActiveIndex;

            // 1. 参战宝可梦获得完整经验
            const p = state.playerParty[activeIdx];
            const { updatedPokemon, leveledUp, learnedMoves, pendingMoves, evolutionCandidate } = gainExperience(p, expAmount);

            state.playerParty[activeIdx] = updatedPokemon;
            state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 获得了 ${expAmount} 点经验值。`));

            if (leveledUp) {
                state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 升到了 Lv.${updatedPokemon.level}！`, 'urgent'));

                if (learnedMoves && learnedMoves.length > 0) {
                    learnedMoves.forEach(m => {
                        state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 学会了 ${m}！`));
                    });
                }

                // 有待学习的招式（招式已满4个），进入选择界面
                if (pendingMoves && pendingMoves.length > 0) {
                    const firstMoveId = pendingMoves[0];
                    const firstMove = MOVES[firstMoveId];
                    if (firstMove) {
                        state.logs.push(createLogEntry(`${updatedPokemon.speciesName} 想学会 ${firstMove.name}...`, 'urgent'));
                        state.logs.push(createLogEntry(`但是，${updatedPokemon.speciesName} 已经学会了4个招式。`, 'urgent'));
                    }
                    state.battle.pendingMoveLearn = {
                        pokemonIndex: activeIdx,
                        moveId: firstMoveId,
                        remainingMoves: pendingMoves.slice(1),
                    };
                    state.battle.phase = 'MOVE_LEARN';
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

            // 2. 其他存活的宝可梦获得50%经验
            const sharedExp = Math.floor(expAmount / 2);
            if (sharedExp > 0) {
                for (let i = 0; i < state.playerParty.length; i++) {
                    if (i === activeIdx) continue; // 跳过参战宝可梦
                    const mon = state.playerParty[i];
                    if (mon.currentHp <= 0) continue; // 跳过已倒下的

                    const result = gainExperience(mon, sharedExp);
                    state.playerParty[i] = result.updatedPokemon;
                    state.logs.push(createLogEntry(`${result.updatedPokemon.speciesName} 也获得了 ${sharedExp} 点经验值！`, 'info'));

                    if (result.leveledUp) {
                        state.logs.push(createLogEntry(`${result.updatedPokemon.speciesName} 升到了 Lv.${result.updatedPokemon.level}！`, 'urgent'));
                        if (result.learnedMoves && result.learnedMoves.length > 0) {
                            result.learnedMoves.forEach(m => {
                                state.logs.push(createLogEntry(`${result.updatedPokemon.speciesName} 学会了 ${m}！`));
                            });
                        }
                        // 非参战宝可梦：招式满了自动跳过，不弹选择界面
                        // 进化留到参战宝可梦的进化结束后（如果没有参战宝可梦进化，则触发第一个）
                        if (result.evolutionCandidate && !state.evolution.isEvolving) {
                            state.logs.push(createLogEntry(`什么？ ${result.updatedPokemon.speciesName} 的样子...`, 'urgent'));
                            state.evolution = {
                                isEvolving: true,
                                pokemon: result.updatedPokemon,
                                targetSpeciesId: result.evolutionCandidate.targetSpeciesId,
                                stage: 'START'
                            };
                        }
                    }
                }
            }

            if (state.battle.enemyParty.length > 0) {
                const nextEnemy = state.battle.enemyParty.shift();
                if (nextEnemy) {
                    nextEnemy.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
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

            // 记录传说宝可梦击败状态
            if (state.battle.isLegendary && state.battle.legendarySpeciesId) {
                state.legendaryProgress[state.battle.legendarySpeciesId] = {
                    captured: false,
                    defeated: true
                };
                state.logs.push(createLogEntry(`传说的宝可梦逃走了...`, 'urgent'));
            }

            state.battle.active = false;
            state.battle.enemy = null;
            state.battle.enemyParty = [];
            state.battle.gymBadgeReward = undefined;
            state.battle.trainerName = undefined;
            state.battle.isLegendary = false;
            state.battle.legendarySpeciesId = undefined;
            state.playerMoney += 120;
            state.view = 'ROAM';
            // 战斗结束，清除所有宝可梦的能力等级
            state.playerParty.forEach(p => { p.statStages = undefined; });
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
                 state.playerParty.forEach(p => { p.currentHp = p.maxHp; p.statStages = undefined; });
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

  applyItem: (itemId, targetId) => set(produce((state: GameState) => {
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
      } else if (item.id === 'exp-candy-s') {
          const expAmount = 800;
          const { updatedPokemon, leveledUp, learnedMoves, pendingMoves, evolutionCandidate } = gainExperience(target, expAmount);
          Object.assign(target, updatedPokemon);
          state.inventory[itemIndex].quantity--;
          state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，获得了 ${expAmount} 点经验值！`));
          if (leveledUp) {
              state.logs.push(createLogEntry(`${target.speciesName} 升到了 Lv.${target.level}！`, 'urgent'));
              if (learnedMoves && learnedMoves.length > 0) {
                  learnedMoves.forEach(m => state.logs.push(createLogEntry(`${target.speciesName} 学会了 ${m}！`)));
              }
              if (evolutionCandidate) {
                  state.evolution = { isEvolving: true, pokemon: target, targetSpeciesId: evolutionCandidate.targetSpeciesId, stage: 'START' };
              }
          }
      } else if (item.id === 'exp-candy-m') {
          const expAmount = 3000;
          const { updatedPokemon, leveledUp, learnedMoves, pendingMoves, evolutionCandidate } = gainExperience(target, expAmount);
          Object.assign(target, updatedPokemon);
          state.inventory[itemIndex].quantity--;
          state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，获得了 ${expAmount} 点经验值！`));
          if (leveledUp) {
              state.logs.push(createLogEntry(`${target.speciesName} 升到了 Lv.${target.level}！`, 'urgent'));
              if (learnedMoves && learnedMoves.length > 0) {
                  learnedMoves.forEach(m => state.logs.push(createLogEntry(`${target.speciesName} 学会了 ${m}！`)));
              }
              if (evolutionCandidate) {
                  state.evolution = { isEvolving: true, pokemon: target, targetSpeciesId: evolutionCandidate.targetSpeciesId, stage: 'START' };
              }
          }
      } else if (item.id === 'exp-candy-l') {
          const expAmount = 10000;
          const { updatedPokemon, leveledUp, learnedMoves, pendingMoves, evolutionCandidate } = gainExperience(target, expAmount);
          Object.assign(target, updatedPokemon);
          state.inventory[itemIndex].quantity--;
          state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}，获得了 ${expAmount} 点经验值！`));
          if (leveledUp) {
              state.logs.push(createLogEntry(`${target.speciesName} 升到了 Lv.${target.level}！`, 'urgent'));
              if (learnedMoves && learnedMoves.length > 0) {
                  learnedMoves.forEach(m => state.logs.push(createLogEntry(`${target.speciesName} 学会了 ${m}！`)));
              }
              if (evolutionCandidate) {
                  state.evolution = { isEvolving: true, pokemon: target, targetSpeciesId: evolutionCandidate.targetSpeciesId, stage: 'START' };
              }
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
              'exp-candy-s': { name: '经验糖果S', description: '给宝可梦喂下后，能获得800点经验值。', category: 'MEDICINE' },
              'exp-candy-m': { name: '经验糖果M', description: '给宝可梦喂下后，能获得3000点经验值。', category: 'MEDICINE' },
              'exp-candy-l': { name: '经验糖果L', description: '给宝可梦喂下后，能获得10000点经验值。', category: 'MEDICINE' },
              'greatball': { name: '超级球', description: '比起精灵球更容易捉到宝可梦。', category: 'POKEBALLS' },
              'ultraball': { name: '高级球', description: '比起超级球更容易捉到宝可梦。', category: 'POKEBALLS' },
              'masterball': { name: '大师球', description: '必定能捉到野生宝可梦的终极球。', category: 'POKEBALLS' },
              'levelball': { name: '等级球', description: '我方等级越高于对方，越容易捕捉。', category: 'POKEBALLS' }
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
      if (ballId === 'levelball') {
          const playerMon = playerParty[battle.playerActiveIndex];
          const levelRatio = playerMon.level / enemy.level;
          if (levelRatio > 4) ballModifier = 8.0;
          else if (levelRatio > 2) ballModifier = 4.0;
          else if (levelRatio > 1) ballModifier = 2.0;
          else ballModifier = 1.0;
      }

      // 状态异常修正（Gen V+ 官方公式）
      let statusModifier = 1.0;
      if (enemy.status === 'SLP' || enemy.status === 'FRZ') {
          statusModifier = 2.5;
      } else if (enemy.status === 'PAR' || enemy.status === 'PSN' || enemy.status === 'BRN') {
          statusModifier = 1.5;
      }

      // 全局捕捉率倍数（2.0 = 捕捉成功率翻倍）
      const globalCatchMultiplier = 2.0;
      const catchChance = Math.min(1, (catchRate / 255) * (1 - hpRatio * 0.5) * ballModifier * statusModifier * globalCatchMultiplier);
      const roll = Math.random();

      addLog(`扔出了${pokeballItem.name}！`, 'combat');
      if (statusModifier > 1) {
          const statusNames: Record<string, string> = { SLP: '睡眠', FRZ: '冰冻', PAR: '麻痹', PSN: '中毒', BRN: '灼伤' };
          addLog(`${enemy.speciesName} 处于${statusNames[enemy.status!]}状态，更容易捕捉！(x${statusModifier})`, 'info');
      }
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
                'exp-candy-s': { name: '经验糖果S', description: '获得800点经验值', category: 'MEDICINE' },
                'exp-candy-m': { name: '经验糖果M', description: '获得3000点经验值', category: 'MEDICINE' },
                'exp-candy-l': { name: '经验糖果L', description: '获得10000点经验值', category: 'MEDICINE' },
                'greatball': { name: '超级球', description: '更容易捉到宝可梦', category: 'POKEBALLS' },
                'ultraball': { name: '高级球', description: '捕获率更高的球', category: 'POKEBALLS' },
                'masterball': { name: '大师球', description: '必定能捉到的终极球', category: 'POKEBALLS' },
                'levelball': { name: '等级球', description: '我方等级越高于对方，越容易捕捉', category: 'POKEBALLS' }
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

      // 清除旧宝可梦的能力等级
      state.playerParty[currentIndex].statStages = undefined;

      const temp = state.playerParty[currentIndex];
      state.playerParty[currentIndex] = targetPokemon;
      state.playerParty[targetIndex] = temp;

      // 给新出场的宝可梦初始化能力等级
      state.playerParty[currentIndex].statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };

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

      // 记录传说宝可梦捕获状态
      if (state.battle.isLegendary && state.battle.legendarySpeciesId) {
          state.legendaryProgress[state.battle.legendarySpeciesId] = {
              captured: true,
              defeated: false
          };
      }

      state.battle.active = false;
      state.battle.enemy = null;
      state.battle.phase = 'ENDED';
      state.battle.caughtPokemonId = undefined;
      state.battle.isLegendary = false;
      state.battle.legendarySpeciesId = undefined;
      state.view = 'ROAM';
      state.playerParty.forEach(p => { p.statStages = undefined; });
  })),

  loadGame: async (userId: string) => {
      set({ isGameLoading: true });
      
      const token = getToken();
      if (!token) {
        set({ isGameLoading: false });
        return;
      }
    
      try {
        const mode = get().gameMode;
        const response = await fetch(`${API_URL}/save?mode=${mode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        const result = await response.json();
    
        if (result.success && result.data) {
          const save = result.data;
          const currentView = get().view;
          set({
            playerParty: save.team || [],
            playerStorage: save.pcBox || [],
            playerLocationId: save.currentLocation || 'pallet-town',
            badges: save.badges || [],
            pokedex: save.pokedex || {},
            inventory: save.inventory || get().inventory,
            playerMoney: save.money ?? 3000,
            legendaryProgress: save.legendaryProgress || {},
            playerSpriteIndex: save.playerSpriteIndex ?? 0,
            hasSelectedStarter: (save.team?.length > 0),
            view: currentView === 'INTRO' ? 'INTRO' : 'ROAM',
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

      const saveData = {
        mode: state.gameMode,
        team: state.playerParty,
        pcBox: state.playerStorage,
        currentLocationId: state.playerLocationId,
        badges: state.badges,
        pokedex: state.pokedex,
        inventory: state.inventory.map(item => {
            const { effect, ...rest } = item;
            return rest;
        }),
        money: state.playerMoney,
        legendaryProgress: state.legendaryProgress,
        playerSpriteIndex: state.playerSpriteIndex
      };

      console.log('Saving game data:', saveData);

      try {
        const response = await fetch(`${API_URL}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(saveData)
        });

        const result = await response.json();

        if (!result.success) {
          console.error('Save failed:', result.error);
          if (result.details) {
            console.error('Validation errors:', result.details);
          }
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

  // ===== 招式管理 =====

  learnPendingMove: (forgetIndex: number | null) => set(produce((state: GameState) => {
    const pending = state.battle.pendingMoveLearn;
    if (!pending) return;

    const pokemon = state.playerParty[pending.pokemonIndex];
    const moveData = MOVES[pending.moveId];
    if (!pokemon || !moveData) return;

    if (forgetIndex !== null && forgetIndex >= 0 && forgetIndex < pokemon.moves.length) {
      const forgotten = pokemon.moves[forgetIndex].move.name;
      pokemon.moves[forgetIndex] = { move: moveData, ppCurrent: moveData.ppMax };
      state.logs.push(createLogEntry(`${pokemon.speciesName} 忘记了 ${forgotten}，学会了 ${moveData.name}！`));
    } else {
      state.logs.push(createLogEntry(`${pokemon.speciesName} 放弃了学习 ${moveData.name}。`));
    }

    // 检查是否还有剩余待学的招式
    const remaining = pending.remainingMoves;
    if (remaining.length > 0) {
      const nextMoveId = remaining[0];
      const nextMove = MOVES[nextMoveId];
      state.battle.pendingMoveLearn = {
        pokemonIndex: pending.pokemonIndex,
        moveId: nextMoveId,
        remainingMoves: remaining.slice(1),
      };
      if (nextMove) {
        // 如果已有空位就直接学
        if (pokemon.moves.length < 4) {
          pokemon.moves.push({ move: nextMove, ppCurrent: nextMove.ppMax });
          state.logs.push(createLogEntry(`${pokemon.speciesName} 学会了 ${nextMove.name}！`));
          // 继续检查下一个
          const stillRemaining = state.battle.pendingMoveLearn.remainingMoves;
          if (stillRemaining.length === 0) {
            state.battle.pendingMoveLearn = undefined;
            state.battle.phase = 'ENDED';
          }
        }
        // 否则保持 MOVE_LEARN phase
      }
    } else {
      state.battle.pendingMoveLearn = undefined;
      state.battle.phase = 'ENDED';
    }
  })),

  forgetMove: (pokemonId: string, moveIndex: number) => set(produce((state: GameState) => {
    const pokemon = state.playerParty.find(p => p.id === pokemonId)
      || state.playerStorage.find(p => p.id === pokemonId);
    if (!pokemon) return;
    if (moveIndex < 0 || moveIndex >= pokemon.moves.length) return;
    if (pokemon.moves.length <= 1) {
      state.logs.push(createLogEntry(`${pokemon.speciesName} 至少需要保留一个招式！`, 'urgent'));
      return;
    }
    const forgotten = pokemon.moves[moveIndex].move.name;
    pokemon.moves.splice(moveIndex, 1);
    state.logs.push(createLogEntry(`${pokemon.speciesName} 忘记了 ${forgotten}。`));
  })),

  learnMove: (pokemonId: string, moveId: string, forgetIndex?: number) => set(produce((state: GameState) => {
    const pokemon = state.playerParty.find(p => p.id === pokemonId)
      || state.playerStorage.find(p => p.id === pokemonId);
    if (!pokemon) return;
    const moveData = MOVES[moveId];
    if (!moveData) return;

    // 检查是否已经学会了这个招式
    if (pokemon.moves.find(m => m.move.id === moveData.id)) {
      state.logs.push(createLogEntry(`${pokemon.speciesName} 已经会 ${moveData.name} 了！`));
      return;
    }

    if (pokemon.moves.length < 4) {
      pokemon.moves.push({ move: moveData, ppCurrent: moveData.ppMax });
      state.logs.push(createLogEntry(`${pokemon.speciesName} 学会了 ${moveData.name}！`));
    } else if (forgetIndex !== undefined && forgetIndex >= 0 && forgetIndex < pokemon.moves.length) {
      const forgotten = pokemon.moves[forgetIndex].move.name;
      pokemon.moves[forgetIndex] = { move: moveData, ppCurrent: moveData.ppMax };
      state.logs.push(createLogEntry(`${pokemon.speciesName} 忘记了 ${forgotten}，学会了 ${moveData.name}！`));
    }
  })),
})
);

if (typeof window !== 'undefined') {
  (window as any).cheat_charmander_lv35 = () => {
    const currentState = useGameStore.getState();
    if (currentState.gameMode !== 'CHEAT') {
      console.warn("作弊指令仅在 CHEAT 模式下可用。请在登录界面切换模式。");
      return;
    }

	    useGameStore.setState(produce((state) => {
	      const index = state.playerParty.findIndex((p: any) => p.speciesData.pokedexId === 4);
	      
	      if (index === -1) {
	        console.log('未在队伍中找到小火龙！');
	        return;
      }

      const charmander = state.playerParty[index];
      console.log('正在为小火龙注入大量经验 (Target: Lv.35)...');

      const lv36BaseExp = expForLevel(36);
      const targetTotalExp = lv36BaseExp - 10;
      const currentTotalExp = expForLevel(charmander.level) + charmander.exp;
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

      if (result.evolutionCandidate) {
        state.logs.push(createLogEntry(`什么？ ${result.updatedPokemon.speciesName} 的样子...`, 'urgent'));
        state.evolution = {
          isEvolving: true,
          pokemon: result.updatedPokemon,
          targetSpeciesId: result.evolutionCandidate.targetSpeciesId,
          stage: 'START'
        };
      }
      
      console.log('修改完成！Lv.35 达成，技能已更新。');
    }));
  };
  console.log("CHEAT LOADED: window.cheat_charmander_lv35()");
}
