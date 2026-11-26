import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Request } from '@nestjs/common';
import { WorkOrderDraftsService } from './work-order-drafts.service';
import { CreateWorkOrderDraftDto } from './dto/create-work-order-draft.dto';
import { UpdateWorkOrderDraftDto } from './dto/update-work-order-draft.dto';
import { FindWorkOrderDraftsDto } from './dto/find-work-order-drafts.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/work-order-drafts')
@UseGuards(AdminGuard) // 仅管理员可访问
export class WorkOrderDraftsController {
  constructor(private readonly workOrderDraftsService: WorkOrderDraftsService) {}

  /**
   * 创建工单草稿
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createDto: CreateWorkOrderDraftDto,
    @Request() req, // 从请求中获取登录管理员信息
  ) {
    const adminId = req.user.adminId; 
    const data = await this.workOrderDraftsService.create(createDto, adminId);
    return { code: 200, message: '工单草稿创建成功', data };
  }

  /**
   * 草稿分页查询
   */
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAllWithPagination(@Query() queryDto: FindWorkOrderDraftsDto) {
    const data = await this.workOrderDraftsService.findAllWithPagination(queryDto);
    return { code: 200, data };
  }

  /**
   * 获取草稿详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '草稿ID必须是正整数' };
    }
    const data = await this.workOrderDraftsService.findOne(numericId);
    return { code: 200, data };
  }

  /**
   * 编辑草稿
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDraftDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '草稿ID必须是正整数' };
    }
    const data = await this.workOrderDraftsService.update(numericId, updateDto);
    return { code: 200, message: '工单草稿更新成功', data };
  }

  /**
   * 删除草稿
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '草稿ID必须是正整数' };
    }
    await this.workOrderDraftsService.remove(numericId);
    return { code: 200, message: '工单草稿删除成功' };
  }

  /**
   * 作废草稿
   */
  @Put(':id/invalidate')
  async invalidate(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '草稿ID必须是正整数' };
    }
    const data = await this.workOrderDraftsService.invalidate(numericId);
    return { code: 200, message: '工单草稿已作废', data };
  }

  /**
   * 确认生成工单
   */
  @Post(':id/generate')
  async generateWorkOrder(
    @Param('id') id: string,
    @Request() req,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '草稿ID必须是正整数' };
    }
    const adminId = req.user.adminId;
    const data = await this.workOrderDraftsService.generateWorkOrder(numericId, adminId);
    return { code: 200, message: '工单生成成功', data };
  }
}