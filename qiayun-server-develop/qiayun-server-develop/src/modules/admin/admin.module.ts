import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLocalStrategy } from './auth/local.strategy';
import { AdminAuthController } from './auth/auth.controller';
import { AdminAuthService } from './auth/auth.service';
import { AdminGuard } from './auth/admin.guard';
import { AdminUserController } from './user/user.controller';
import { AdminUserService } from './user/user.service';
import { EnterprisesController } from './enterprise/enterprises.controller';
import { EnterprisesService } from './enterprise/enterprises.service';
import { WorkOrdersController } from './work-orders/work-orders.controller';
import { WorkOrdersService } from './work-orders/work-orders.service';
import { WorkOrderDraftsController } from './wok-order-drafts/work-order-drafts.controller';
import { WorkOrderDraftsService } from './wok-order-drafts/work-order-drafts.service';
import { MaintenanceTemplatesController } from './maintenance-templates/maintenance-templates.controller';
import { MaintenanceTemplatesService } from './maintenance-templates/maintenance-templates.service';
import { InspectionItemsController } from './inspection-items/inspection-items.controller';
import { InspectionItemsService } from './inspection-items/inspection-items.service';
import { OperationItemsController } from './operation-items/operation-items.controller';
import { OperationItemsService } from './operation-items/operation-items.service';
import { OssController } from './oss/oss.controller';
import { OssService } from './oss/oss.service';
import { TechniciansController } from './technicians/technicians.controller';
import { TechniciansService } from './technicians/technicians.service';
import { WorkOrderTemplatesController } from './work-order-templates/work-order-templates.controller';
import { WorkOrderTemplatesService } from './work-order-templates/work-order-templates.service';
import { AdminEquipmentController } from './equipment/equipment.controller';
import { AdminEquipmentService } from './equipment/equipment.service';
import { EquipmentTemplateController } from './equipment-template/equipment-template.controller';
import { EquipmentTemplateService } from './equipment-template/equipment-template.service';



@Module({
  imports: [
    PassportModule,
    // JWT模块（从环境变量读取密钥和过期时间）
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('ADMIN_JWT_SECRET'),
        signOptions: { expiresIn: configService.get('ADMIN_JWT_EXPIRES_IN') || '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController, 
    AdminUserController, EnterprisesController, WorkOrdersController, WorkOrderDraftsController,
    MaintenanceTemplatesController, InspectionItemsController, OperationItemsController, OssController, TechniciansController, WorkOrderTemplatesController,
    AdminEquipmentController, EquipmentTemplateController],
  providers: [PrismaService, AdminAuthService, AdminLocalStrategy, AdminGuard, AdminUserService, EnterprisesService, WorkOrdersService, WorkOrderDraftsService,
    MaintenanceTemplatesService, InspectionItemsService, OperationItemsService, OssService, TechniciansService, WorkOrderTemplatesService,
    AdminEquipmentService, EquipmentTemplateService],
  exports: [JwtModule], // 导出JWT模块供守卫使用
})
export class AdminModule {}