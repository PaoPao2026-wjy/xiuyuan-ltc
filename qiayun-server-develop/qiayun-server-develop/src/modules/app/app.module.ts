import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WechatStrategy } from './auth/wechat.strategy';
import { WechatAuthController } from './auth/app-auth.controller';
import { WechatAuthService } from './auth/app-auth.service';
import { AppGuard } from './auth/app.guard';
import { OssController } from './oss/oss.controller';
import { OssService } from './oss/oss.service';
import { WechatCryptoService } from './auth/wechat-crypto.service';
import { WechatPhoneService } from './auth/wechat-phone.service';
import { TechnicianController } from './technician/technician.controller';
import { TechnicianService } from './technician/technician.service';
import { AssignmentController } from './assignment/assignment.controller';
import { AssignmentService } from './assignment/assignment.service';
import { WorkOrderController } from './work-order/work-order.controller';
import { WorkOrderService } from './work-order/work-order.service';
import { EnterpriseController } from './enterprise/enterprise.controller';
import { EnterpriseService } from './enterprise/enterprise.service';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import {EnterpriseWorkOrderService} from './enterprise-work-order/enterprise-work-order.service';
import {EnterpriseWorkOrderController} from './enterprise-work-order/enterprise-work-order.controller'; 





@Module({
  imports: [
    PassportModule,
    HttpModule, // 用于调用微信接口
    // JWT模块（从环境变量读取配置）
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('APP_JWT_SECRET'),
        signOptions: { expiresIn: configService.get('APP_JWT_EXPIRES_IN') || '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    WechatAuthController, OssController, TechnicianController, AssignmentController, WorkOrderController, EnterpriseController, EquipmentController, EnterpriseWorkOrderController],
  providers: [
    PrismaService,
    WechatAuthService,
    EnterpriseService,
    EquipmentService,
    WechatStrategy,
    AppGuard,
    OssService,
    WechatPhoneService,
    WechatCryptoService,
    TechnicianService,
    AssignmentService,
    WorkOrderService,
    EnterpriseWorkOrderService,
  ],
  exports: [JwtModule], // 导出JWT模块供守卫使用
})
export class MiniAppModule {}