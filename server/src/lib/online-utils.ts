const ONLINE_THRESHOLD_MS = 30 * 1000; // 30 秒

export function isUserOnline(lastSeenAt: Date | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - lastSeenAt.getTime() < ONLINE_THRESHOLD_MS;
}
