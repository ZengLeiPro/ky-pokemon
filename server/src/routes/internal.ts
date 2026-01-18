import { Hono } from 'hono';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const internal = new Hono();

internal.post('/db-migrate', async (c) => {
  const token = c.req.header('x-migration-token');
  if (!process.env.MIGRATION_TOKEN || token !== process.env.MIGRATION_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('Starting database migration...');
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

export default internal;
