import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { bodyLimit } from 'hono/body-limit';
import type { Context, Next } from 'hono';

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

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少环境变量 ${name}，请检查 server/.env 或运行环境配置`);
  }
  return value;
}

requireEnv('DATABASE_URL');
requireEnv('JWT_SECRET');

// CORS origin 根据环境区分
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins: string[] = [
  'https://pkm.kaiyan.net',
  'https://ky-pokemon.vercel.app',
];
if (!isProduction) {
  corsOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// 内存速率限制
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

function rateLimit(windowMs: number, max: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown';
    const key = `${ip}:${c.req.path}:${max}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    entry.count++;
    return next();
  };
}

const app = new Hono();

// 安全响应头
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '0');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

app.use('*', logger());
app.use('*', cors({ origin: corsOrigins, credentials: true }));
app.use('*', bodyLimit({ maxSize: 1024 * 1024 }));

// 速率限制
app.use('/api/auth/login', rateLimit(60_000, 10));
app.use('/api/auth/register', rateLimit(60_000, 10));
app.use('/api/internal/*', rateLimit(60_000, 5));
app.use('/api/*', rateLimit(60_000, 100));

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
