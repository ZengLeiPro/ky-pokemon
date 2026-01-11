import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { LogEntry, Pokemon, ViewState, InventoryItem, PokedexStatus } from '@/types';
import { MOVES, SPECIES_DATA, WORLD_MAP } from '@/constants';
import { createPokemon, calculateDamage, gainExperience, evolvePokemon } from '@/lib/mechanics';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PokemonUser {
  id: string;
  username: string;
  passwordHash: string;
  party: any[];
  inventory: any[];
  money: number;
  pokedex: Record<number, string>;
  locationId: string;
  timestamp: number;
}

interface KyPokemonDB extends DBSchema {
  users: { key: string; value: PokemonUser; };
  gameState: { key: string; value: any; };
}

let dbPromise: Promise<IDBPDatabase<KyPokemonDB>> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<KyPokemonDB>('ky-pokemon-db', 4, {
      upgrade(database, oldVersion, newVersion, transaction) {
        if (!database.objectStoreNames.contains('users')) {
          database.createObjectStore('users', { keyPath: 'id' });
        }

        if (database.objectStoreNames.contains('gameState')) {
          database.deleteObjectStore('gameState');
        }
        database.createObjectStore('gameState');
      },
    });
  }
  return dbPromise;
}

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await getDB();
      const result = await db.get('gameState', name);
      return result ? JSON.stringify(result) : null;
    } catch (e) {
      console.error('Failed to load game state:', e);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.put('gameState', JSON.parse(value), name);
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.delete('gameState', name);
    } catch (e) {
      console.error('Failed to remove game state:', e);
    }
  },
};

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

interface GameState {
  view: ViewState;
  selectedPokemonId: string | null;
  logs: LogEntry[];
  playerParty: Pokemon[];
  inventory: InventoryItem[];
  playerMoney: number;
  playerLocationId: string;
  pokedex: Record<number, PokedexStatus>;
  
  battle: {
    active: boolean;
    turnCount: number;
    enemy: Pokemon | null;
    playerActiveIndex: number;
    phase: 'INPUT' | 'PROCESSING' | 'ENDED';
  };

  setView: (view: ViewState) => void;
  setSelectedPokemon: (id: string | null) => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
  startBattle: (enemyId: string) => void;
  runAway: () => void;
  executeMove: (moveIndex: number) => Promise<void>;
  useItem: (itemId: string, targetId: string) => void;
  addItem: (itemId: string, quantity?: number) => void;
  throwPokeball: () => Promise<void>;
  buyItem: (itemId: string, price: number, quantity?: number) => boolean;
  healParty: () => void;
  switchPokemon: (pokemonId: string) => void;
  setFirstPokemon: (pokemonId: string) => void;
  moveTo: (locationId: string) => void;
  manualSave: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  view: 'ROAM',
  selectedPokemonId: null,
  logs: [{ id: 'init', message: '欢迎来到关都传说。', timestamp: Date.now() }],
  playerParty: [starter],
  playerMoney: 3000,
  playerLocationId: 'pallet-town',
  pokedex: initialPokedex,
  inventory: [
    { 
        id: 'potion', 
        name: '伤药', 
        description: '喷雾式伤药，能恢复宝可梦20点HP。', 
        category: 'MEDICINE',
        quantity: 5, 
        effect: (p: Pokemon) => { p.currentHp = Math.min(p.maxHp, p.currentHp + 20); } 
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
  ],
  battle: {
    active: false,
    turnCount: 0,
    enemy: null,
    playerActiveIndex: 0,
    phase: 'INPUT',
  },

  resetGame: () => {
    set({
      view: 'ROAM',
      selectedPokemonId: null,
      logs: [{ id: 'init', message: '欢迎来到关都传说。', timestamp: Date.now() }],
      playerParty: [starter],
      playerMoney: 3000,
      playerLocationId: 'pallet-town',
      pokedex: initialPokedex,
      inventory: [
        { 
            id: 'potion', 
            name: '伤药', 
            description: '喷雾式伤药，能恢复宝可梦20点HP。', 
            category: 'MEDICINE',
            quantity: 5, 
            effect: (p: Pokemon) => { p.currentHp = Math.min(p.maxHp, p.currentHp + 20); } 
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
      ],
      battle: {
        active: false,
        turnCount: 0,
        enemy: null,
        playerActiveIndex: 0,
        phase: 'INPUT',
      }
    });
  },

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
      }));
  },

  startBattle: (speciesKey) => {
    const enemyData = SPECIES_DATA[speciesKey];
    if (!enemyData) return;

    const enemy = createPokemon(speciesKey, 3 + Math.floor(Math.random() * 3), [MOVES.tackle, MOVES.growl]);

    set(produce((state: GameState) => {
      state.battle.active = true;
      state.battle.enemy = enemy;
      state.battle.turnCount = 1;
      state.battle.phase = 'INPUT';
      state.view = 'BATTLE';
      state.logs.push(createLogEntry(`野生的 ${enemy.speciesName} 出现了！`, 'urgent'));

      const dexId = enemyData.pokedexId!;
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
    const { battle, playerParty, addLog } = get();
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
    
    const playerSpeed = playerMon.stats.spe;
    const enemySpeed = enemyMon.stats.spe;
    
    const playerGoesFirst = playerSpeed >= enemySpeed; 
    
    const executeTurn = async (attacker: Pokemon, defender: Pokemon, moveData: any, isPlayer: boolean) => {
        if (attacker.currentHp <= 0 || defender.currentHp <= 0) return;

        if (isPlayer) {
             set(produce((state: GameState) => {
                 state.playerParty[state.battle.playerActiveIndex].moves[moveIndex].ppCurrent--;
             }));
        }

        addLog(`${attacker.speciesName} 使用了 ${moveData.move.name}！`, 'combat');
        await new Promise(r => setTimeout(r, 800));

        const result = calculateDamage(attacker, defender, moveData.move);
        
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
            addLog("但是失败了！");
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

    if (currentEnemy && currentEnemy.currentHp <= 0) {
        addLog(`敌方的 ${currentEnemy.speciesName} 倒下了！`);
        
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
                     const evolvedMon = evolvePokemon(updatedPokemon, evolutionCandidate.targetSpeciesId);
                     state.playerParty[state.battle.playerActiveIndex] = evolvedMon;
                     state.logs.push(createLogEntry(`什么？ ${updatedPokemon.speciesName} 的样子...`, 'urgent'));
                     state.logs.push(createLogEntry(`恭喜！你的 ${updatedPokemon.speciesName} 进化成了 ${evolvedMon.speciesName}！`, 'urgent'));
                }
            }

            state.battle.active = false;
            state.battle.enemy = null;
            state.playerMoney += 120;
            state.view = 'ROAM';
        }));
    } else if (currentPlayer.currentHp <= 0) {
        addLog(`${currentPlayer.speciesName} 倒下了！`);
        addLog(`你眼前一黑...`);
        set(produce((state: GameState) => {
             state.battle.active = false;
             state.battle.enemy = null;
             state.view = 'ROAM';
             state.playerParty.forEach(p => p.currentHp = p.maxHp); 
             state.playerMoney = Math.floor(state.playerMoney / 2);
        }));
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
      } else if (item.effect) {
          item.effect(target);
          state.inventory[itemIndex].quantity--;
          state.logs.push(createLogEntry(`对 ${target.speciesName} 使用了 ${item.name}。`));
      }
  })),

  addItem: (itemId, quantity = 1) => set(produce((state: GameState) => {
      const existingItem = state.inventory.find(i => i.id === itemId);
      if (existingItem) {
          existingItem.quantity += quantity;
      }
      state.logs.push(createLogEntry(`获得了 ${existingItem?.name || '物品'} x${quantity}！`));
  })),

  throwPokeball: async () => {
      const { battle, playerParty, addLog } = get();
      if (!battle.active || !battle.enemy || battle.phase !== 'INPUT') return;

      const pokeballItem = get().inventory.find(i => i.id === 'pokeball');
      if (!pokeballItem || pokeballItem.quantity <= 0) {
          addLog('没有精灵球了！', 'urgent');
          return;
      }

      set(produce((state: GameState) => { state.battle.phase = 'PROCESSING'; }));

      set(produce((state: GameState) => {
          const item = state.inventory.find(i => i.id === 'pokeball');
          if (item) item.quantity--;
      }));

      const enemy = battle.enemy;
      const catchRate = enemy.speciesData.catchRate || 45;
      const hpRatio = enemy.currentHp / enemy.maxHp;

      const catchChance = (catchRate / 255) * (1 - hpRatio * 0.5);
      const roll = Math.random();

      addLog(`扔出了精灵球！`, 'combat');
      await new Promise(r => setTimeout(r, 800));

      if (roll < catchChance) {
          set(produce((state: GameState) => {
              if (state.battle.enemy) {
                  state.playerParty.push(state.battle.enemy);
                  state.pokedex[state.battle.enemy.speciesData.pokedexId!] = 'CAUGHT';
              }
          }));

          addLog(`成功捕获了 ${enemy.speciesName}！`, 'urgent');
          await new Promise(r => setTimeout(r, 1200));

          set(produce((state: GameState) => {
              state.battle.active = false;
              state.battle.enemy = null;
              state.battle.phase = 'ENDED';
              state.view = 'ROAM';
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

                      set(produce((state: GameState) => {
                          state.battle.active = false;
                          state.battle.enemy = null;
                          state.battle.phase = 'ENDED';
                          state.view = 'ROAM';
                          state.playerMoney = Math.floor(state.playerMoney / 2);
                        }));
                      addLog(`失败了，损失了一半的金钱...`, 'urgent');
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
          const existingItem = draft.inventory.find(i => i.id === itemId);
          if (existingItem) {
              existingItem.quantity += quantity;
          }
          draft.logs.push(createLogEntry(`购买了 ${existingItem?.name || '物品'} x${quantity}，花费 ¥${totalCost}`));
      }));
      return true;
  },

  healParty: () => set(produce((state: GameState) => {
      state.playerParty.forEach(p => {
          p.currentHp = p.maxHp;
          p.moves.forEach(m => m.ppCurrent = m.move.ppMax);
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
  })),

  setFirstPokemon: (pokemonId: string) => set(produce((state: GameState) => {
      const targetIndex = state.playerParty.findIndex(p => p.id === pokemonId);
      if (targetIndex <= 0) return;

      const targetPokemon = state.playerParty[targetIndex];
      
      state.playerParty.splice(targetIndex, 1);
      state.playerParty.unshift(targetPokemon);
      
      state.logs.push(createLogEntry(`${targetPokemon.speciesName} 被设置为了首发宝可梦。`));
  })),
}),
    {
      name: 'ky-pokemon-save',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        view: state.view,
        selectedPokemonId: state.selectedPokemonId,
        logs: state.logs,
        playerParty: state.playerParty,
        inventory: state.inventory,
        playerMoney: state.playerMoney,
        playerLocationId: state.playerLocationId,
        pokedex: state.pokedex,
        battle: { ...state.battle, active: false, enemy: null, phase: 'INPUT' }
      })
    }
  )
);
