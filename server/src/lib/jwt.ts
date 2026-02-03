import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error('缺少环境变量 JWT_SECRET，请在 server/.env 或运行环境中配置');
  }
  return new TextEncoder().encode(raw);
}

export async function signToken(payload: { userId: string; username: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; username: string };
  } catch {
    return null;
  }
}
