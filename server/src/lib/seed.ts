import { db } from './db.js';

export async function seedDatabase() {
  console.log('Starting database seed...');
  
  try {
    // 验证数据库连接
    const userCount = await db.user.count();
    console.log(`Current user count: ${userCount}`);

    // 这里可以添加更多初始化逻辑
    // 例如：创建管理员账号、初始化配置表等
    // 目前项目结构中 Pokemon 数据是静态文件，所以不需要 Seed 宝可梦数据

    console.log('Database seed completed successfully.');
    return { success: true, message: 'Seeding completed', stats: { userCount } };
  } catch (error: any) {
    console.error('Seeding failed:', error);
    throw error;
  }
}
