import { Hono } from 'hono';
import { cors } from 'hono/cors';

const device = new Hono();

// 允许跨域（ESP32 会来请求）
device.use('/*', cors());

// 内存中存放最新的传送请求
let pendingTransfer: number | null = null;

// POST /transfer - 游戏发送传送请求
device.post('/transfer', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.pokedexId !== 'number' || body.pokedexId < 0 || body.pokedexId > 251) {
    return c.json({ success: false, error: 'Invalid pokedexId' }, 400);
  }
  // pokedexId = 0 means "clear device / return pokemon to game"
  pendingTransfer = body.pokedexId;
  return c.json({ success: true, pokedexId: pendingTransfer });
});

// GET /transfer - ESP32 查询待传送的宝可梦（读后清除）
device.get('/transfer', (c) => {
  const id = pendingTransfer;
  pendingTransfer = null;
  return c.json({ pokedexId: id });
});

export default device;
