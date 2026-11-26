// src/modules/app/enterprise-work-order/enterprise-work-order.controller.ts
import { 
  Body, 
  Controller, 
  Get, 
  Query, 
  Request, 
  UseGuards, 
  UsePipes, 
  ValidationPipe, 
  Post, 
  BadRequestException,
  ForbiddenException,
  Param
} from '@nestjs/common';
import { AppGuard } from '../auth/app.guard'; // 复用小程序认证守卫
import { EnterpriseWorkOrderService } from './enterprise-work-order.service';
import { EnterpriseWorkOrderListDto } from './dto/enterprise-work-order-list.dto';
import { PublishWorkOrderDto } from './dto/publish-work-order.dto';
import { RepublishWorkOrderDto } from './dto/republish-work-order.dto';
import { PrismaService } from '../../../prisma/prisma.service'; 

@Controller('app/enterprise/work-order')
export class EnterpriseWorkOrderController {
  constructor(
    private readonly enterpriseWorkOrderService: EnterpriseWorkOrderService, 
    private readonly prisma: PrismaService) {}


   /**
     * 私有方法：校验企业用户身份 + 获取绑定的企业ID
     * @param wechatUserId 微信用户ID
     * @returns 绑定的企业ID
     */
    private async validateEnterpriseUser(wechatUserId: number): Promise<number> {
      // 查询微信用户信息（角色 + 绑定的企业ID）
      const wechatUser = await this.prisma.wechatUser.findUnique({
        where: { wechatId: wechatUserId, isDeleted: false },
        select: {
          loginRole: true, // 用户角色（ENTERPRISE/TECHNICIAN/ADMIN）
          enterpriseId: true // 绑定的企业ID（企业用户才会有）
        }
      });
  
      //  校验用户存在
      if (!wechatUser) {
        throw new BadRequestException('微信用户不存在');
      }
  
      //  校验角色为企业用户，防止跨角色调用
      if (wechatUser.loginRole !== 'ENTERPRISE') {
        throw new ForbiddenException('仅企业账号可操作设备管理功能');
      }
  
      //  校验已绑定企业，防止未绑定就创建设备
      if (!wechatUser.enterpriseId) {
        throw new BadRequestException('当前账号未绑定企业，请先完成企业绑定');
      }
  
      //  二次校验企业是否有效（防止企业被删除）
      const enterprise = await this.prisma.enterprise.findUnique({
        where: { id: wechatUser.enterpriseId, isDeleted: false }
      });
      if (!enterprise) {
        throw new BadRequestException('绑定的企业已被删除，请重新绑定企业');
      }
  
      return wechatUser.enterpriseId;
    }
  
  /**
   * 企业查询自身发布的工单列表（分页+筛选）
   */
  @UseGuards(AppGuard)
  @Get('list')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getEnterpriseWorkOrders(@Request() req, @Query() dto: EnterpriseWorkOrderListDto) {
    // 校验企业用户身份 + 获取绑定的企业ID
    const enterpriseId = await this.validateEnterpriseUser(req.user.sub);
    const data = await this.enterpriseWorkOrderService.getEnterpriseWorkOrders(enterpriseId, dto);
    return { code: 200, message: '获取工单列表成功', data };
  }

  /**
   * 企业查询工单详情
   */
  @UseGuards(AppGuard)
  @Get('detail/:workOrderId')
  async getEnterpriseWorkOrderDetail(@Request() req, @Param('workOrderId') workOrderId: number) {
    // 校验企业用户身份 + 获取绑定的企业ID
    const enterpriseId = await this.validateEnterpriseUser(req.user.sub);
    const data = await this.enterpriseWorkOrderService.getEnterpriseWorkOrderDetail(
      enterpriseId,
      Number(workOrderId)
    );
    return { code: 200, message: '获取工单详情成功', data };
  }

  /**
   * 企业发布新工单
   */
  @UseGuards(AppGuard)
  @Post('publish')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async publishWorkOrder(@Request() req, @Body() dto: PublishWorkOrderDto) {
    // 校验企业用户身份 + 获取绑定的企业ID
    const enterpriseId = await this.validateEnterpriseUser(req.user.sub);
    const data = await this.enterpriseWorkOrderService.publishWorkOrder(enterpriseId, dto);
    return { code: 200, message: '工单发布成功', data };
  }

  /**
   * 企业重新发布审核失败的工单
   */
  @UseGuards(AppGuard)
  @Post('republish')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async republishWorkOrder(@Request() req, @Body() dto: RepublishWorkOrderDto) {
    // 校验企业用户身份 + 获取绑定的企业ID
    const enterpriseId = await this.validateEnterpriseUser(req.user.sub);
    const data = await this.enterpriseWorkOrderService.republishWorkOrder(enterpriseId, dto);
    return { code: 200, message: '工单重新发布成功', data };
  }

    /**
   * 企业统计自身工单状态分布
   */
  @UseGuards(AppGuard)
  @Get('statistics')
  async getEnterpriseWorkOrderStatistics(@Request() req) {
    const enterpriseId = await this.validateEnterpriseUser(req.user.sub);
    const data = await this.enterpriseWorkOrderService.countEnterpriseWorkOrders(enterpriseId);
    return { code: 200, message: '工单统计成功', data };
  }
}