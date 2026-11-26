import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './modules/admin/admin.module'; // 后台管理模块
import { MiniAppModule } from './modules/app/app.module'; // 小程序模块
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      load: [configuration],
    }),
    AdminModule,
    MiniAppModule
  ],
  providers: [PrismaService],
})
export class AppModule {}
