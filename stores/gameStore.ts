import { create } from 'zustand';
import { produce } from 'immer';
import { LogEntry, Pokemon, ViewState, InventoryItem, PokedexStatus } from '../types';
import { MOVES, SPECIES_DATA, WORLD_MAP } from '../constants';
import { createPokemon, calculateDamage } from '../lib/mechanics';

// Initial State Setup
const starter = createPokemon('charmander', 5, [MOVES.scratch, MOVES.ember]);

// Initialize Pokedex
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
  playerLocationId: string; // Changed from playerLocation string name to ID
  pokedex: Record<number, PokedexStatus>;
  
  // Battle State
  battle: {
    active: boolean;
    turnCount: number;
    enemy: Pokemon | null;
    playerActiveIndex: number;
    phase: 'INPUT' | 'PROCESSING' | 'ENDED';
  };

  // Actions
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
  moveTo: (locationId: string) => void; // New Action
}

export const useGameStore = create<GameState>((set, get) => ({
  view: 'ROAM',
  selectedPokemonId: null,
  logs: [{ id: 'init', message: '欢迎来到关都传说。', timestamp: Date.now() }],
  playerParty: [starter],
  playerMoney: 3000,
  playerLocationId: 'pallet-town', // Start at Pallet Town ID
  pokedex: initialPokedex,
  inventory: [
    { 
        id: 'potion', 
        name: '伤药', 
        description: '喷雾式伤药，能恢复宝可梦20点HP。', 
        category: 'MEDICINE',
        quantity: 5, 
        effect: (p) => { p.currentHp = Math.min(p.maxHp, p.currentHp + 20); } 
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

  setView: (view) => set({ view }),
  setSelectedPokemon: (id) => set({ selectedPokemonId: id }),

  addLog: (message, type: LogEntry['type'] = 'info') => set(produce((state: GameState) => {
    state.logs.push({
      id: crypto.randomUUID(),
      message,
      timestamp: Date.now(),
      type
    });
    if (state.logs.length > 50) state.logs.shift();
  })),

  moveTo: (locationId) => {
      const target = WORLD_MAP[locationId];
      if (!target) return;

      set(produce((state: GameState) => {
          state.playerLocationId = locationId;
          state.logs.push({
              id: crypto.randomUUID(),
              message: `抵达了 ${target.name}。`,
              timestamp: Date.now(),
              type: 'info'
          });
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
      state.logs.push({
        id: crypto.randomUUID(),
        message: `野生的 ${enemy.speciesName} 出现了！`,
        timestamp: Date.now(),
        type: 'urgent'
      });
      
      // Update Pokedex Status to SEEN if currently UNKNOWN
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
      state.logs.push({
         id: crypto.randomUUID(),
         message: '成功逃跑了！',
         timestamp: Date.now()
      });
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

    // 1. Determine Turn Order (Speed check)
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
        addLog(`获得了 50 点经验值。`);
        set(produce((state: GameState) => {
            state.battle.active = false;
            state.battle.enemy = null;
            state.playerMoney += 120; // Win money
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
             state.playerMoney = Math.floor(state.playerMoney / 2); // Lose money
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
      if (item.effect) {
          item.effect(target);
          state.inventory[itemIndex].quantity--;
          state.logs.push({
              id: crypto.randomUUID(),
              message: `对 ${target.speciesName} 使用了 ${item.name}。`,
              timestamp: Date.now()
          });
      }
  })),

  addItem: (itemId, quantity = 1) => set(produce((state: GameState) => {
      const existingItem = state.inventory.find(i => i.id === itemId);
      if (existingItem) {
          existingItem.quantity += quantity;
      }
      // If item doesn't exist in inventory, we could add it here
      // But for now, we only increment existing items
      state.logs.push({
          id: crypto.randomUUID(),
          message: `获得了 ${existingItem?.name || '物品'} x${quantity}！`,
          timestamp: Date.now(),
          type: 'info'
      });
  })),

  throwPokeball: async () => {
      const { battle, playerParty, addLog } = get();
      if (!battle.active || !battle.enemy || battle.phase !== 'INPUT') return;

      const pokeballItem = get().inventory.find(i => i.id === 'pokeball');
      if (!pokeballItem || pokeballItem.quantity <= 0) {
          addLog('没有精灵球了！', 'urgent');
          return;
      }

      // Set to processing
      set(produce((state: GameState) => { state.battle.phase = 'PROCESSING'; }));

      // Use pokeball
      set(produce((state: GameState) => {
          const item = state.inventory.find(i => i.id === 'pokeball');
          if (item) item.quantity--;
      }));

      const enemy = battle.enemy;
      const catchRate = enemy.speciesData.catchRate || 45;
      const hpRatio = enemy.currentHp / enemy.maxHp;

      // Catch formula: higher chance when HP is lower
      const catchChance = (catchRate / 255) * (1 - hpRatio * 0.5);
      const roll = Math.random();

      addLog(`扔出了精灵球！`, 'combat');
      await new Promise(r => setTimeout(r, 800));

      if (roll < catchChance) {
          // Successful catch
          set(produce((state: GameState) => {
              if (state.battle.enemy) {
                  state.playerParty.push(state.battle.enemy);
                  state.pokedex[state.battle.enemy.speciesData.pokedexId!] = 'CAUGHT';
              }
          }));

          addLog(`成功捕获了 ${enemy.speciesName}！`, 'urgent');
          await new Promise(r => setTimeout(r, 1200));

          // End battle
          set(produce((state: GameState) => {
              state.battle.active = false;
              state.battle.enemy = null;
              state.battle.phase = 'ENDED';
              state.view = 'ROAM';
          }));
      } else {
          // Failed catch
          addLog(`${enemy.speciesName} 挣脱了精灵球！`, 'combat');
          await new Promise(r => setTimeout(r, 800));

          // Enemy counter-attack
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
                  if (result.effectiveness > 1) msg = `效果拔群！${msg}`;
                  if (result.effectiveness < 1 && result.effectiveness > 0) msg = `效果不理想...${msg}`;
                  if (result.isCritical) msg = `会心一击！${msg}`;

                  addLog(msg, 'combat');
                  await new Promise(r => setTimeout(r, 600));

                  // Check if player fainted
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

          // Back to input phase
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
              draft.logs.push({
                  id: crypto.randomUUID(),
                  message: '金钱不足！',
                  timestamp: Date.now(),
                  type: 'urgent'
              });
          }));
          return false;
      }

      set(produce((draft: GameState) => {
          draft.playerMoney -= totalCost;
          const existingItem = draft.inventory.find(i => i.id === itemId);
          if (existingItem) {
              existingItem.quantity += quantity;
          }
          draft.logs.push({
              id: crypto.randomUUID(),
              message: `购买了 ${existingItem?.name || '物品'} x${quantity}，花费 ¥${totalCost}`,
              timestamp: Date.now(),
              type: 'info'
          });
      }));
      return true;
  },

  healParty: () => set(produce((state: GameState) => {
      state.playerParty.forEach(p => {
          p.currentHp = p.maxHp;
          p.moves.forEach(m => m.ppCurrent = m.move.ppMax);
      });
      state.logs.push({
          id: crypto.randomUUID(),
          message: '你的队伍已恢复健康。',
          timestamp: Date.now(),
          type: 'info'
      });
  }))

}));
