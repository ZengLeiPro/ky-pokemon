import { PrismaClient, PokedexStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface PokedexData {
  [key: string]: string;
}

async function migratePokedexData() {
  console.log('开始迁移图鉴数据...\n');

  // 1. 获取所有 GameSave 记录（仅 NORMAL 模式）
  const gameSaves = await prisma.gameSave.findMany({
    where: { mode: 'NORMAL' },
    select: {
      userId: true,
      pokedex: true,
      createdAt: true
    }
  });

  console.log(`找到 ${gameSaves.length} 个游戏存档需要迁移\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const save of gameSaves) {
    try {
      const pokedex = JSON.parse(save.pokedex) as PokedexData;
      const entries: {
        userId: string;
        speciesId: number;
        status: PokedexStatus;
        firstSeenAt: Date;
        firstCaughtAt: Date | null;
      }[] = [];

      for (const [speciesIdStr, status] of Object.entries(pokedex)) {
        if (status === 'UNKNOWN') continue;

        entries.push({
          userId: save.userId,
          speciesId: parseInt(speciesIdStr),
          status: status as PokedexStatus,
          firstSeenAt: save.createdAt,
          firstCaughtAt: status === 'CAUGHT' ? save.createdAt : null
        });
      }

      if (entries.length === 0) {
        console.log(`用户 ${save.userId}: 无有效图鉴数据，跳过`);
        totalSkipped++;
        continue;
      }

      // 批量插入，忽略已存在的记录
      const result = await prisma.pokedexEntry.createMany({
        data: entries,
        skipDuplicates: true
      });

      console.log(`用户 ${save.userId}: 迁移了 ${result.count}/${entries.length} 条记录`);
      totalMigrated += result.count;
    } catch (error) {
      console.error(`用户 ${save.userId} 迁移失败:`, error);
      totalFailed++;
    }
  }

  console.log('\n========== 迁移完成 ==========');
  console.log(`总存档数: ${gameSaves.length}`);
  console.log(`成功迁移记录数: ${totalMigrated}`);
  console.log(`跳过用户数: ${totalSkipped}`);
  console.log(`失败用户数: ${totalFailed}`);
}

async function verifyMigration() {
  console.log('\n========== 验证迁移结果 ==========\n');

  // 统计新表数据
  const totalEntries = await prisma.pokedexEntry.count();
  const caughtEntries = await prisma.pokedexEntry.count({ where: { status: 'CAUGHT' } });
  const seenEntries = await prisma.pokedexEntry.count({ where: { status: 'SEEN' } });
  const uniqueUsers = await prisma.pokedexEntry.groupBy({ by: ['userId'] });

  console.log(`PokedexEntry 表统计:`);
  console.log(`  - 总记录数: ${totalEntries}`);
  console.log(`  - CAUGHT 状态: ${caughtEntries}`);
  console.log(`  - SEEN 状态: ${seenEntries}`);
  console.log(`  - 涉及用户数: ${uniqueUsers.length}`);

  // 抽样验证：随机选择一个用户进行对比
  const sampleSave = await prisma.gameSave.findFirst({
    where: { mode: 'NORMAL' }
  });

  if (sampleSave) {
    const originalPokedex = JSON.parse(sampleSave.pokedex) as PokedexData;
    const migratedEntries = await prisma.pokedexEntry.findMany({
      where: { userId: sampleSave.userId }
    });

    const originalNonUnknown = Object.entries(originalPokedex).filter(([_, s]) => s !== 'UNKNOWN').length;
    console.log(`\n抽样验证 (用户 ${sampleSave.userId}):`);
    console.log(`  - 原始非UNKNOWN记录数: ${originalNonUnknown}`);
    console.log(`  - 迁移后记录数: ${migratedEntries.length}`);
    console.log(`  - 数据一致: ${originalNonUnknown === migratedEntries.length ? '✓' : '✗'}`);
  }
}

async function main() {
  try {
    await migratePokedexData();
    await verifyMigration();
  } catch (error) {
    console.error('迁移过程发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
