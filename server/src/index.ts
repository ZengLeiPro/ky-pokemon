import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import auth from './routes/auth';
import game from './routes/game';
import internal from './routes/internal';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.route('/api/auth', auth);
app.route('/api/game', game);
app.route('/api/internal', internal);

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3001;

console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
