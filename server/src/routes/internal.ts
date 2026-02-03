import { Hono } from 'hono';
import { execFile } from 'child_process';
import { createRequire } from 'module';
import { promisify } from 'util';
import { z } from 'zod';
import { seedDatabase } from '../lib/seed.js';
import { db } from '../lib/db.js';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const prismaCliPath = require.resolve('prisma/build/index.js');

const ResolveMigrationSchema = z.object({
  migration: z
    .string('缺少 migration 参数')
    .regex(/^\d{14}_[a-z0-9_-]+$/, '迁移名称格式不正确'),
  action: z.enum(['rolled-back', 'applied'], 'action 参数不正确')
});
const internal = new Hono();

// 中间件：验证 Token
internal.use('/*', async (c, next) => {
  const token = c.req.header('x-migration-token');
  if (!process.env.MIGRATION_TOKEN || token !== process.env.MIGRATION_TOKEN) {
    return c.json({ success: false, error: '未授权' }, 401);
  }
  await next();
});

internal.post('/db-migrate', async (c) => {
  try {
    console.log('Starting database migration...');
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [prismaCliPath, 'migrate', 'deploy'],
      { timeout: 10 * 60 * 1000 }
    );
    console.log('Migration stdout:', stdout);
    if (stderr) console.error('Migration stderr:', stderr);

    return c.json({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return c.json({ success: false, error: error.message, stderr: error.stderr }, 500);
  }
});

// 解决失败的迁移记录
internal.post('/db-migrate-resolve', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const parsed = ResolveMigrationSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
    }
    const { migration, action } = parsed.data;

    console.log(`Resolving migration ${migration} as ${action}...`);
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [prismaCliPath, 'migrate', 'resolve', `--${action}`, migration],
      { timeout: 10 * 60 * 1000 }
    );
    console.log('Resolve stdout:', stdout);
    if (stderr) console.error('Resolve stderr:', stderr);

    return c.json({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error('Resolve failed:', error);
    return c.json({ success: false, error: error.message, stderr: error.stderr }, 500);
  }
});

internal.post('/db-seed', async (c) => {
  try {
    const result = await seedDatabase();
    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 迁移图鉴数据：从 GameSave.pokedex JSON 到 PokedexEntry 表
internal.post('/migrate-pokedex-data', async (c) => {
  try {
    console.log('开始迁移图鉴数据...');

    // 获取所有 NORMAL 模式的 GameSave 记录
    const gameSaves = await db.gameSave.findMany({
      where: { mode: 'NORMAL' },
      select: {
        userId: true,
        pokedex: true,
        createdAt: true
      }
    });

    console.log(`找到 ${gameSaves.length} 个游戏存档需要迁移`);

    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    for (const save of gameSaves) {
      try {
        const pokedex = JSON.parse(save.pokedex) as Record<string, string>;
        const entries: {
          userId: string;
          speciesId: number;
          status: string;
          firstSeenAt: Date;
          firstCaughtAt: Date | null;
        }[] = [];

        for (const [speciesIdStr, status] of Object.entries(pokedex)) {
          if (status === 'UNKNOWN') continue;

          entries.push({
            userId: save.userId,
            speciesId: parseInt(speciesIdStr),
            status,
            firstSeenAt: save.createdAt,
            firstCaughtAt: status === 'CAUGHT' ? save.createdAt : null
          });
        }

        if (entries.length === 0) {
          totalSkipped++;
          continue;
        }

        const result = await db.pokedexEntry.createMany({
          data: entries,
          skipDuplicates: true
        });

        totalMigrated += result.count;
      } catch (error: any) {
        totalFailed++;
        errors.push(`用户 ${save.userId}: ${error.message}`);
      }
    }

    // 验证结果
    const totalEntries = await db.pokedexEntry.count();
    const caughtEntries = await db.pokedexEntry.count({ where: { status: 'CAUGHT' } });
    const seenEntries = await db.pokedexEntry.count({ where: { status: 'SEEN' } });

    const result = {
      success: true,
      summary: {
        totalSaves: gameSaves.length,
        migratedRecords: totalMigrated,
        skippedUsers: totalSkipped,
        failedUsers: totalFailed
      },
      verification: {
        totalEntries,
        caughtEntries,
        seenEntries
      },
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('迁移完成:', result);
    return c.json(result);
  } catch (error: any) {
    console.error('迁移失败:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default internal;
