export type JsonObject = Record<string, unknown>;

export interface InventoryItemSnapshot {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
}

export function parseJsonOrThrow<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`存档数据损坏：${label} 不是有效的 JSON`);
  }
}

export function cloneWithNewId<T extends { id?: string }>(value: T): T {
  const cloned = structuredClone(value);
  cloned.id = crypto.randomUUID();
  return cloned;
}

export function findPokemonById(
  team: Array<{ id?: string }>,
  pcBox: Array<{ id?: string }>,
  pokemonId: string
): { location: 'team' | 'pcBox'; index: number; pokemon: { id?: string } } | null {
  const teamIndex = team.findIndex((p) => p.id === pokemonId);
  if (teamIndex >= 0) return { location: 'team', index: teamIndex, pokemon: team[teamIndex] };

  const pcIndex = pcBox.findIndex((p) => p.id === pokemonId);
  if (pcIndex >= 0) return { location: 'pcBox', index: pcIndex, pokemon: pcBox[pcIndex] };

  return null;
}

export function removePokemonById(
  team: Array<{ id?: string }>,
  pcBox: Array<{ id?: string }>,
  pokemonId: string
): { removed: { id?: string }; team: Array<{ id?: string }>; pcBox: Array<{ id?: string }> } | null {
  const found = findPokemonById(team, pcBox, pokemonId);
  if (!found) return null;

  if (found.location === 'team') {
    // 队伍中至少保留 1 只宝可梦
    if (team.length <= 1) return null;
    const removed = team.splice(found.index, 1)[0];
    return { removed, team, pcBox };
  }

  const removed = pcBox.splice(found.index, 1)[0];
  return { removed, team, pcBox };
}

export function addPokemonToPcBox(pcBox: Array<{ id?: string }>, pokemon: { id?: string }) {
  const cloned = cloneWithNewId(pokemon);
  pcBox.push(cloned);
  return cloned;
}

export function findInventoryItem(
  inventory: InventoryItemSnapshot[],
  itemId: string
): InventoryItemSnapshot | null {
  return inventory.find((item) => item.id === itemId) ?? null;
}

export function removeInventoryItem(
  inventory: InventoryItemSnapshot[],
  itemId: string,
  quantity: number
): boolean {
  const index = inventory.findIndex((item) => item.id === itemId);
  if (index < 0) return false;

  const item = inventory[index];
  if (item.quantity < quantity) return false;

  item.quantity -= quantity;
  if (item.quantity <= 0) inventory.splice(index, 1);
  return true;
}

export function addInventoryItem(
  inventory: InventoryItemSnapshot[],
  item: Omit<InventoryItemSnapshot, 'quantity'>,
  quantity: number
) {
  const existing = inventory.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
    return;
  }
  inventory.push({ ...item, quantity });
}

