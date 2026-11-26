import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // 注册 PrismaService 为提供者
  exports: [PrismaService],   // 必须导出！否则其他模块无法注入
})
export class PrismaModule {}