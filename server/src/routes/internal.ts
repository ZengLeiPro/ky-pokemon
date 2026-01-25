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
    const nodePath = process.execPath;
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

// 解决失败的迁移记录
internal.post('/db-migrate-resolve', async (c) => {
  try {
    const body = await c.req.json();
    const { migration, action } = body;

    if (!migration || !action) {
      return c.json({ success: false, error: 'Missing migration or action parameter' }, 400);
    }

    if (!['rolled-back', 'applied'].includes(action)) {
      return c.json({ success: false, error: 'Action must be "rolled-back" or "applied"' }, 400);
    }

    console.log(`Resolving migration ${migration} as ${action}...`);
    const nodePath = process.execPath;
    const prismaCliPath = './node_modules/prisma/build/index.js';

    const command = `${nodePath} ${prismaCliPath} migrate resolve --${action} ${migration}`;

    const { stdout, stderr } = await execAsync(command);
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

export default internal;
