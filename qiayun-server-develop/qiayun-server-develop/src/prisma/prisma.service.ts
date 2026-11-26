import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. 调用父类 PrismaClient 构造函数，传入日志配置
    super({
      log: [
        {
          level: 'query', // 开启“查询级别”日志（仅打印执行的 SQL）
          emit: 'event',  // 以“事件”形式触发日志（而非直接打印）
        },
      ],
    });

    // 2. 监听 query 事件，打印 SQL 语句和参数（核心：查看是否显式传递时间字段）
    this.$on('query' as never, (event: Prisma.QueryEvent) => {
      // 打印执行的 SQL（关键：看 INSERT/UPDATE 中是否包含 createdAt/updatedAt）
      console.log(`[Prisma SQL] ${event.query}`);
      // 打印 SQL 参数（可选：帮助确认传递的具体值，如时间是否为 UTC 格式）
      console.log(`[Prisma Params] ${event.params}`);
      // 打印执行时间（可选：用于性能排查）
      // console.log(`[Prisma Duration] ${event.duration}ms`);
    });
  }

  // 保留原有：模块初始化时连接数据库
  async onModuleInit() {
    await this.$connect();
  }

  // 保留原有：模块销毁时断开数据库连接
  async onModuleDestroy() {
    await this.$disconnect();
  }
}