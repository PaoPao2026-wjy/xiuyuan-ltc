// src/modules/admin/technicians/technicians.controller.ts
import { Controller, Get, Param, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { FindTechniciansDto } from './dto/find-technicians.dto';
import { AdminGuard } from '../auth/admin.guard';
import { Technician } from '@prisma/client';
import { FindTechnicianPointsLogsDto } from './dto/find-technician-points-logs.dto';

@Controller('admin/technicians')
@UseGuards(AdminGuard) // 仅管理员可访问
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  /**
   * 电工列表（分页+筛选+关键词搜索）
   * 支持按工作状态、账号状态筛选，按姓名/手机号模糊搜索
   */
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) // 自动校验+转换参数类型
  async findAllWithPagination(@Query() queryDto: FindTechniciansDto) {
    const data = await this.techniciansService.findAllWithPagination(queryDto);
    return { code: 200, data };
  }

  /**
   * 电工详情（按ID查询）
   * 返回电工完整信息+关联的微信用户信息
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // 验证ID合法性（正整数）
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '电工ID必须是正整数' };
    }

    const data = await this.techniciansService.findOne(numericId);
    return { code: 200, data };
  }

  /**
   * 电工积分变动日志（分页+筛选）
   * @param id 电工ID（路径参数）
   * @param queryDto 分页+筛选参数（查询参数）
   */
  @Get(':technicianId/points-logs')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findTechnicianPointsLogs(
    @Param('technicianId') technicianId: string,
    @Query() queryDto: FindTechnicianPointsLogsDto,
  ) {
    //  校验电工ID合法性
    const numericId = Number(technicianId);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '电工ID必须是正整数' };
    }

    //  查询积分日志
    const data = await this.techniciansService.findTechnicianPointsLogsWithPagination(numericId, queryDto);
    return { code: 200, data };
  }
}