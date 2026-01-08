/**
 * PokeAPI 数据抓取脚本
 * 获取初代 151 只宝可梦的完整数据
 *
 * 运行方式: npx tsx scripts/fetch-pokemon-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============ 类型定义 ============

interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface PokemonMove {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
    version_group: { name: string };
  }[];
}

interface PokemonApiResponse {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStat[];
  moves: PokemonMove[];
}

interface SpeciesName {
  language: { name: string };
  name: string;
}

interface SpeciesApiResponse {
  id: number;
  name: string;
  capture_rate: number;
  names: SpeciesName[];
  evolution_chain: { url: string };
}

interface EvolutionDetail {
  min_level: number | null;
  item: { name: string } | null;
  trigger: { name: string };
}

interface EvolutionChainLink {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}

interface MoveApiResponse {
  id: number;
  name: string;
  names: { language: { name: string }; name: string }[];
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  flavor_text_entries: { flavor_text: string; language: { name: string }; version_group: { name: string } }[];
}

// ============ 输出数据结构 ============

interface SimplifiedPokemon {
  id: number;
  name: string;
  nameCN: string;
  types: string[];
  stats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  catchRate: number;
  evolution?: {
    targetId: number;
    targetName: string;
    level?: number;
    item?: string;
  };
  learnset: {
    moveId: string;
    level: number;
  }[];
}

interface SimplifiedMove {
  id: string;
  name: string;
  nameCN: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
}

// ============ 工具函数 ============

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  Retry ${i + 1}/${retries} for ${url}`);
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error('Unreachable');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapStatName(apiName: string): keyof SimplifiedPokemon['stats'] | null {
  const mapping: Record<string, keyof SimplifiedPokemon['stats']> = {
    hp: 'hp',
    attack: 'atk',
    defense: 'def',
    'special-attack': 'spa',
    'special-defense': 'spd',
    speed: 'spe',
  };
  return mapping[apiName] || null;
}

function mapTypeName(apiName: string): string {
  return capitalize(apiName);
}

function mapCategory(damageClass: string): string {
  const mapping: Record<string, string> = {
    physical: 'Physical',
    special: 'Special',
    status: 'Status',
  };
  return mapping[damageClass] || 'Physical';
}

function toMoveId(name: string): string {
  // thunder-shock -> thunderShock
  return name
    .split('-')
    .map((part, i) => (i === 0 ? part : capitalize(part)))
    .join('');
}

// ============ 数据抓取 ============

async function fetchPokemonData(id: number): Promise<{ pokemon: PokemonApiResponse; species: SpeciesApiResponse }> {
  const [pokemon, species] = await Promise.all([
    fetchWithRetry<PokemonApiResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchWithRetry<SpeciesApiResponse>(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);
  return { pokemon, species };
}

async function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return fetchWithRetry<EvolutionChainResponse>(url);
}

async function fetchMoveData(url: string): Promise<MoveApiResponse> {
  return fetchWithRetry<MoveApiResponse>(url);
}

// ============ 数据解析 ============

function parseEvolutionChain(
  chain: EvolutionChainLink,
  pokemonIdMap: Map<string, number>
): Map<string, { targetId: number; targetName: string; level?: number; item?: string }> {
  const evolutions = new Map<string, { targetId: number; targetName: string; level?: number; item?: string }>();

  function traverse(node: EvolutionChainLink) {
    const fromName = node.species.name;

    for (const evo of node.evolves_to) {
      const toName = evo.species.name;
      const toId = pokemonIdMap.get(toName);

      // 只处理初代宝可梦的进化
      if (toId && toId <= 151) {
        const detail = evo.evolution_details[0];
        const evolution: { targetId: number; targetName: string; level?: number; item?: string } = {
          targetId: toId,
          targetName: toName,
        };

        if (detail) {
          if (detail.min_level) {
            evolution.level = detail.min_level;
          }
          if (detail.item) {
            evolution.item = detail.item.name;
          }
        }

        evolutions.set(fromName, evolution);
      }

      traverse(evo);
    }
  }

  traverse(chain);
  return evolutions;
}

function selectLearnset(
  moves: PokemonMove[],
  maxMoves = 4
): { moveId: string; moveName: string; moveUrl: string; level: number }[] {
  // 筛选红蓝版本中通过升级学习的招式
  const levelUpMoves: { moveId: string; moveName: string; moveUrl: string; level: number }[] = [];

  for (const move of moves) {
    for (const detail of move.version_group_details) {
      // 优先选择 red-blue 或 firered-leafgreen 版本
      if (
        (detail.version_group.name === 'red-blue' ||
          detail.version_group.name === 'firered-leafgreen' ||
          detail.version_group.name === 'yellow') &&
        detail.move_learn_method.name === 'level-up' &&
        detail.level_learned_at > 0
      ) {
        levelUpMoves.push({
          moveId: toMoveId(move.move.name),
          moveName: move.move.name,
          moveUrl: move.move.url,
          level: detail.level_learned_at,
        });
        break;
      }
    }
  }

  // 按等级排序，取前 maxMoves 个
  levelUpMoves.sort((a, b) => a.level - b.level);

  // 去重（同一招式可能出现多次）
  const seen = new Set<string>();
  const unique = levelUpMoves.filter((m) => {
    if (seen.has(m.moveId)) return false;
    seen.add(m.moveId);
    return true;
  });

  return unique.slice(0, maxMoves);
}

// ============ 主流程 ============

async function main() {
  console.log('🚀 开始抓取 PokeAPI 数据...\n');

  const pokemonList: SimplifiedPokemon[] = [];
  const moveUrlsToFetch = new Set<string>();
  const pokemonIdMap = new Map<string, number>();
  const evolutionChainUrls = new Set<string>();

  // 第一阶段：抓取所有宝可梦基础数据
  console.log('📦 阶段 1/4: 抓取 151 只宝可梦基础数据...');

  for (let id = 1; id <= 151; id++) {
    process.stdout.write(`  [${id}/151] 抓取中...`);

    try {
      const { pokemon, species } = await fetchPokemonData(id);

      pokemonIdMap.set(pokemon.name, id);
      evolutionChainUrls.add(species.evolution_chain.url);

      // 解析种族值
      const stats: SimplifiedPokemon['stats'] = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      for (const stat of pokemon.stats) {
        const key = mapStatName(stat.stat.name);
        if (key) stats[key] = stat.base_stat;
      }

      // 解析属性
      const types = pokemon.types.sort((a, b) => a.slot - b.slot).map((t) => mapTypeName(t.type.name));

      // 解析中文名
      const cnName = species.names.find((n) => n.language.name === 'zh-Hans')?.name || pokemon.name;

      // 选择招式（暂存 URL，稍后批量抓取）
      const selectedMoves = selectLearnset(pokemon.moves);
      for (const move of selectedMoves) {
        moveUrlsToFetch.add(move.moveUrl);
      }

      const simplified: SimplifiedPokemon = {
        id,
        name: pokemon.name,
        nameCN: cnName,
        types,
        stats,
        catchRate: species.capture_rate,
        learnset: selectedMoves.map((m) => ({ moveId: m.moveId, level: m.level })),
      };

      pokemonList.push(simplified);
      process.stdout.write(` ✅ ${cnName}\n`);
    } catch (error) {
      console.error(` ❌ 失败: ${error}`);
    }

    // API 限速：每 10 只暂停一下
    if (id % 10 === 0) {
      await sleep(500);
    }
  }

  // 第二阶段：抓取进化链数据
  console.log(`\n🔗 阶段 2/4: 抓取 ${evolutionChainUrls.size} 条进化链数据...`);

  const allEvolutions = new Map<string, { targetId: number; targetName: string; level?: number; item?: string }>();
  let chainCount = 0;

  for (const url of evolutionChainUrls) {
    chainCount++;
    process.stdout.write(`  [${chainCount}/${evolutionChainUrls.size}] 抓取中...`);

    try {
      const chain = await fetchEvolutionChain(url);
      const evolutions = parseEvolutionChain(chain.chain, pokemonIdMap);

      for (const [from, to] of evolutions) {
        allEvolutions.set(from, to);
      }

      process.stdout.write(` ✅\n`);
    } catch (error) {
      console.error(` ❌ 失败: ${error}`);
    }

    if (chainCount % 5 === 0) {
      await sleep(300);
    }
  }

  // 将进化数据合并到宝可梦列表
  for (const pokemon of pokemonList) {
    const evo = allEvolutions.get(pokemon.name);
    if (evo) {
      pokemon.evolution = evo;
    }
  }

  // 第三阶段：抓取招式详情
  console.log(`\n⚔️ 阶段 3/4: 抓取 ${moveUrlsToFetch.size} 个招式详情...`);

  const moveDataMap = new Map<string, SimplifiedMove>();
  let moveCount = 0;

  for (const url of moveUrlsToFetch) {
    moveCount++;
    process.stdout.write(`  [${moveCount}/${moveUrlsToFetch.size}] 抓取中...`);

    try {
      const move = await fetchMoveData(url);
      const moveId = toMoveId(move.name);

      // 获取中文名
      const cnName = move.names.find((n) => n.language.name === 'zh-Hans')?.name || move.name;

      // 获取中文描述（优先火红叶绿版本）
      let description = '';
      const cnDesc = move.flavor_text_entries.find(
        (e) => e.language.name === 'zh-Hans'
      );
      if (cnDesc) {
        description = cnDesc.flavor_text.replace(/\n/g, ' ');
      }

      const simplified: SimplifiedMove = {
        id: moveId,
        name: move.name,
        nameCN: cnName,
        type: mapTypeName(move.type.name),
        category: mapCategory(move.damage_class.name),
        power: move.power || 0,
        accuracy: move.accuracy || 100,
        pp: move.pp || 20,
        description,
      };

      moveDataMap.set(moveId, simplified);
      process.stdout.write(` ✅ ${cnName}\n`);
    } catch (error) {
      console.error(` ❌ 失败: ${error}`);
    }

    if (moveCount % 10 === 0) {
      await sleep(300);
    }
  }

  // 第四阶段：保存数据
  console.log('\n💾 阶段 4/4: 保存数据文件...');

  const outputDir = path.join(process.cwd(), 'scripts', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 保存宝可梦数据
  const pokemonOutput = path.join(outputDir, 'gen1-pokemon.json');
  fs.writeFileSync(pokemonOutput, JSON.stringify(pokemonList, null, 2), 'utf-8');
  console.log(`  ✅ 宝可梦数据: ${pokemonOutput}`);

  // 保存招式数据
  const movesArray = Array.from(moveDataMap.values());
  const movesOutput = path.join(outputDir, 'gen1-moves.json');
  fs.writeFileSync(movesOutput, JSON.stringify(movesArray, null, 2), 'utf-8');
  console.log(`  ✅ 招式数据: ${movesOutput}`);

  // 统计信息
  console.log('\n📊 抓取完成统计:');
  console.log(`  - 宝可梦: ${pokemonList.length} 只`);
  console.log(`  - 进化链: ${allEvolutions.size} 条`);
  console.log(`  - 招式: ${moveDataMap.size} 个`);
  console.log('\n✨ 全部完成！');
}

main().catch(console.error);
