// src/modules/mini-app/assignment/assignment.controller.ts
import { Controller, Get, Post, Body, Request, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { AppGuard } from '../auth/app.guard';
import { AssignmentService } from './assignment.service';
import { HandleAssignmentDto } from './dto/handle-assignment.dto';
import { AssignmentListDto } from './dto/assignment-list.dto';

@Controller('app/assignment')
@UseGuards(AppGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  /**
   * 我的指派单列表
   */
@Get('my-list')
@UsePipes(new ValidationPipe({ whitelist: true })) // 启用参数校验
async getMyList(@Request() req, @Query() dto: AssignmentListDto) {
  const technicianId = req.user.technicianId;
  const data = await this.assignmentService.getMyAssignments(technicianId, dto);
  return { code: 200, message: '获取成功', data };
}

  /**
   * 接收指派单
   */
  @Post('accept')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async accept(@Request() req, @Body() dto: HandleAssignmentDto) {
    const technicianId = req.user.technicianId;
    const data = await this.assignmentService.acceptAssignment(technicianId, dto);
    return { code: 200, message: '操作成功', data };
  }

  /**
   * 拒绝指派单
   */
  @Post('reject')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async reject(@Request() req, @Body() dto: HandleAssignmentDto) {
    const technicianId = req.user.technicianId;
    const data = await this.assignmentService.rejectAssignment(technicianId, dto);
    return { code: 200, message: '操作成功', data };
  }
}