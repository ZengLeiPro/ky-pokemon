import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import auth from './routes/auth.js';
import game from './routes/game.js';
import friend from './routes/friend.js';
import chat from './routes/chat.js';
import trade from './routes/trade.js';
import battle from './routes/battle.js';
import presence from './routes/presence.js';
import internal from './routes/internal.js';
import gift from './routes/gift.js';
import pokedex from './routes/pokedex.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://pkm.kaiyan.net',
    'http://pkm.kaiyan.net',
    'https://ky-pokemon.vercel.app'
  ],
  credentials: true
}));

app.route('/api/auth', auth);
app.route('/api/game', game);
app.route('/api/friend', friend);
app.route('/api/chat', chat);
app.route('/api/trade', trade);
app.route('/api/battle', battle);
app.route('/api/presence', presence);
app.route('/api/internal', internal);
app.route('/api/gift', gift);
app.route('/api/pokedex', pokedex);

app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3001;

console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
