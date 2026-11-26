// src/modules/mini-app/technician/technician.controller.ts
import { Controller, Get, Put, Body, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { AppGuard } from '../auth/app.guard';

@Controller('app/technician')
@UseGuards(AppGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  /**
   * 获取电工个人信息详情
   */
  @Get('detail')
  async getDetail(@Request() req) {
    const technicianId = req.user.technicianId;
    const data = await this.technicianService.getTechnicianDetail(technicianId);
    return { code: 200, message: '获取成功', data };
  }

  /**
   * 更新电工个人信息
   */
  @Put('update')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Request() req, @Body() dto: UpdateTechnicianDto) {
    const technicianId = req.user.technicianId;
    const data = await this.technicianService.updateTechnician(technicianId, dto);
    return { code: 200, message: '更新成功', data };
  }
}