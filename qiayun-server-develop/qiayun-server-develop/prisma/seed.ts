import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子数据初始化...');

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const adminUser = await prisma.adminUser.upsert({
    where: { phone: '15250980933' },
    update: {},
    create: {
      phone: '15250980933',
      password: hashedPassword,
      username: 'admin',
      realName: '超级管理员',
      role: 'ADMIN',
    },
  });

  console.log('种子数据创建完成:');
  console.log({ adminUser });
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 