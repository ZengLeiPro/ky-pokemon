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
    // 在 FC 环境中，当前目录是 /code，node_modules 在 /code/node_modules
    const command = './node_modules/.bin/prisma migrate deploy';
    
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
