import { z } from 'zod';

export const UsernameSchema = z
  .string()
  .min(2, '用户名至少2个字符')
  .max(20, '用户名最多20个字符')
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文');

export const PasswordSchema = z
  .string()
  .min(6, '密码至少6个字符')
  .max(100, '密码最多100个字符');

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: UsernameSchema,
  createdAt: z.number().int().positive(),
});

export const UserCredentialsSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

export const RegisterDataSchema = UserCredentialsSchema;

// 类型推导
export type UserInput = z.input<typeof UserSchema>;
export type UserCredentialsInput = z.input<typeof UserCredentialsSchema>;
