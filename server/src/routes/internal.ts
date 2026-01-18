import { Hono } from 'hono';
import { exec } from 'child_process';
import { promisify } from 'util';
import { seedDatabase } from '../lib/seed.js';

const execAsync = promisify(exec);
const internal = new Hono();

// 中间件：验证 Token
internal.use('/*', async (c, next) => {
  const token = c.req.header('x-migration-token');
  if (!process.env.MIGRATION_TOKEN || token !== process.env.MIGRATION_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

internal.post('/db-migrate', async (c) => {
  try {
    console.log('Starting database migration...');
    // 在 FC custom runtime (Debian) 中，node 可执行文件路径通常是 /var/fc/lang/nodejs22/bin/node
    // 但 Prisma CLI 内部使用 /usr/bin/env node，这可能找不到 node。
    // 我们显式使用 node 执行 prisma
    // Prisma CLI 入口通常是 node_modules/prisma/build/index.js (如果安装了 prisma 包)
    // 或者 node_modules/.bin/prisma (这是个 shell 脚本)
    
    // 方案：显式指定 node 路径和 prisma JS 入口
    // 查找 prisma cli 的 JS 入口。通常在 node_modules/prisma/build/index.js
    const nodePath = process.execPath; // 当前运行的 node 路径
    const prismaCliPath = './node_modules/prisma/build/index.js';
    
    const command = `${nodePath} ${prismaCliPath} migrate deploy`;
    
    const { stdout, stderr } = await execAsync(command);
    console.log('Migration stdout:', stdout);
    if (stderr) console.error('Migration stderr:', stderr);
    
    return c.json({ success: true, stdout, stderr });
  } catch (error: any) {
    console.error('Migration failed:', error);
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

export default internal;
