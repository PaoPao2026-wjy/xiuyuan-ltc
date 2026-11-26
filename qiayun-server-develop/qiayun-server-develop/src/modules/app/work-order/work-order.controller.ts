// src/modules/app/work-order/work-order.controller.ts
import { Body, Controller, Get, Query, Request, UseGuards, UsePipes, ValidationPipe, Post, Param, BadRequestException } from '@nestjs/common';
import { AppGuard } from '../auth/app.guard';
import { WorkOrderService } from './work-order.service';
import { WorkOrderListDto } from './dto/work-order-list.dto';
import { AcceptWorkOrderDto } from './dto/accept-work-order.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { UpdateTechnicianStatusDto } from './dto/update-technician-status.dto';
import { RejectWorkOrderDto } from './dto/reject-work-order.dto';
import { QueryTechWorkOrderDetailDto } from './dto/query-tech-work-order-detail.dto';
import { UpdateWorkOrderProcessingResultDto } from './dto/update-work-order-processing-result.dto';
import { LoginRole } from '@prisma/client';

@Controller('app/work-order')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  /**
   * 我的工单列表
   */
  @UseGuards(AppGuard)
  @Get('my-list')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyList(@Request() req, @Query() dto: WorkOrderListDto) {
    const technicianId = req.user.technicianId;
    if(!technicianId) {
      throw new BadRequestException('用户未绑定电工账号');
    }
    if(req.user.loginRole !== LoginRole.INDIVIDUAL) {
      throw new BadRequestException('非电工用户，不能查看工单列表');
    }
    const data = await this.workOrderService.getMyWorkOrders(technicianId, dto);
    return { code: 200, message: '获取成功', data };
  }

  /**
   * 工单详情
   */
  @UseGuards(AppGuard)
  @Get('detail')
  async getDetail(@Request() req, @Query('workOrderId') workOrderId: number) {
    const technicianId = req.user.technicianId;
    if(!technicianId) {
      throw new BadRequestException('用户未绑定电工账号');
    }
    if(req.user.loginRole !== LoginRole.INDIVIDUAL) {
      throw new BadRequestException('非电工用户，不能查看工单详情');
    }
    const data = await this.workOrderService.getWorkOrderDetail(Number(workOrderId), technicianId);
    return { code: 200, message: '获取成功', data };
  }

  /**
   * 统计我的工单
   */
  @UseGuards(AppGuard)
  @Get('count')
  async getCount(@Request() req) {
    const technicianId = req.user.technicianId;
    if(!technicianId) {
      throw new BadRequestException('用户未绑定电工账号');
    }
    const data = await this.workOrderService.countMyWorkOrders(technicianId);
    return { code: 200, message: '获取成功', data };
  }

  /**
   * 工单广场（可抢单列表）
   */
  @Get('plaza')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getPlaza(@Query() dto: WorkOrderListDto) {
    const data = await this.workOrderService.getWorkOrderPlaza(dto);
    return { code: 200, message: '获取成功', data };
  }

  /**
   * 工单接单接口（从工单广场抢单）
   */
  @UseGuards(AppGuard)
  @Post('accept')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async acceptWorkOrder(@Request() req, @Body() dto: AcceptWorkOrderDto) {
    const technicianId = req.user.technicianId; // 从JWT获取电工ID
    const data = await this.workOrderService.acceptWorkOrder(technicianId, dto.workOrderId);
    return { code: 200, message: '接单成功', data };
  }

  /**
   * 工程师提交完成工单
   */
  @UseGuards(AppGuard)
  @Post('complete')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async completeWorkOrder(
    @Request() req,
    @Body() dto: CompleteWorkOrderDto,
  ) {
    const technicianId = req.user.technicianId; // 从JWT获取当前工程师ID
    const data = await this.workOrderService.completeWorkOrder(technicianId, dto);
    return { code: 200, message: '工单已提交完成', data };
  }

  /**
   * 新增：更新电工执行状态（如“已出发”“已到达”“完成自检”等）
   */
  @UseGuards(AppGuard)
  @Post('update-status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateTechnicianStatus(
    @Request() req,
    @Body() dto: UpdateTechnicianStatusDto,
  ) {
    const technicianId = req.user.technicianId;
    const data = await this.workOrderService.updateTechnicianStatus(technicianId, dto);
    return { code: 200, message: '状态更新成功', data };
  }

   /**
   * 电工拒绝工单（专属接口）
   */
  @UseGuards(AppGuard)
  @Post('reject')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async rejectWorkOrder(
    @Request() req,
    @Body() dto: RejectWorkOrderDto,
  ) {
    const technicianId = req.user.technicianId;
    const data = await this.workOrderService.rejectWorkOrder(technicianId, dto);
    return { code: 200, message: '工单拒绝成功', data };
  }

  /**
 * 查询当前电工指定工单的处理详情
 */
@UseGuards(AppGuard)
@Get('queryByWorkOrderId/:workOrderId')
async getTechWorkOrderDetail(
  @Request() req,
  @Param('workOrderId') workOrderId: number,
) {
  const technicianId = req.user.technicianId;
  const data = await this.workOrderService.queryTechWorkOrderDetail(technicianId, { workOrderId });
  return { code: 200, message: '查询成功', data };
}

/**
 * 更新当前电工指定工单的处理结果
 */
@UseGuards(AppGuard)
@Post('update-result')
@UsePipes(new ValidationPipe({ whitelist: true }))
async updateWorkOrderProcessingResult(
  @Request() req,
  @Body() dto: UpdateWorkOrderProcessingResultDto,
) {
  const technicianId = req.user.technicianId;
  const data = await this.workOrderService.updateWorkOrderProcessingResult(technicianId, dto);
  return { code: 200, message: '更新成功', data };
}
}