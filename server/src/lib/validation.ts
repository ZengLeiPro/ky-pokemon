import type { Context } from 'hono';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export function validateUUIDParam(c: Context, id: string) {
  if (!isValidUUID(id)) {
    return c.json({ success: false, error: '无效的ID格式' }, 400);
  }
  return null;
}
