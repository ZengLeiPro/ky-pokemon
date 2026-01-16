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
  users: {
    key: string;
    value: PokemonUser;
  };
  saves: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<KyPokemonDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<KyPokemonDB>> {
  if (db) return db;
  
  db = await openDB<KyPokemonDB>('ky-pokemon-db', 1, {
    upgrade(database) {
      database.createObjectStore('users', { keyPath: 'id' });
      database.createObjectStore('saves', { keyPath: 'key' });
    },
  });
  
  return db;
}

export async function saveGame(key: string, data: any): Promise<void> {
  const database = await initDB();
  await database.put('saves', {
    key,
    data,
    timestamp: Date.now()
  });
}

export async function loadGame(key: string): Promise<any | null> {
  const database = await initDB();
  const result = await database.get('saves', key);
  return result?.data ?? null;
}

export async function getSaveTimestamp(key: string): Promise<number> {
  const database = await initDB();
  const result = await database.get('saves', key);
  return result?.timestamp ?? 0;
}

export async function deleteSave(key: string): Promise<void> {
  const database = await initDB();
  await database.delete('saves', key);
}

export async function getAllSaves(): Promise<Record<string, number>> {
  const database = await initDB();
  const saves: Record<string, number> = {};
  const tx = database.transaction('saves', 'readonly');
  const cursor = await tx.store.openCursor();
  
  while (cursor) {
    saves[cursor.key] = cursor.value.timestamp;
    await cursor.continue();
  }
  
  return saves;
}

export async function registerUser(username: string, password: string, initialData: any): Promise<string> {
  const database = await initDB();
  const id = crypto.randomUUID();
  
  await database.put('users', {
    id,
    username,
    passwordHash: password,
    party: initialData.playerParty,
    inventory: initialData.inventory,
    money: initialData.playerMoney,
    pokedex: initialData.pokedex,
    locationId: initialData.playerLocationId,
    timestamp: Date.now()
  });
  
  return id;
}

export async function validateUser(username: string, password: string): Promise<PokemonUser | null> {
  const database = await initDB();
  const tx = database.transaction('users', 'readonly');
  const cursor = await tx.store.openCursor();
  
  while (cursor) {
    const user = cursor.value;
    if (user.username === username && user.passwordHash === password) {
      return user;
    }
    await cursor.continue();
  }
  
  return null;
}

export async function getUserByUsername(username: string): Promise<PokemonUser | null> {
  const database = await initDB();
  const tx = database.transaction('users', 'readonly');
  const cursor = await tx.store.openCursor();
  
  while (cursor) {
    const user = cursor.value;
    if (user.username === username) {
      return user;
    }
    await cursor.continue();
  }
  
  return null;
}
