import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkOrderTemplatesService } from './work-order-templates.service';
import { CreateWorkOrderTemplateDto } from './dto/create-work-order-template.dto';
import { UpdateWorkOrderTemplateDto } from './dto/update-work-order-template.dto';
import { FindWorkOrderTemplatesDto } from './dto/find-work-order-templates.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/work-order-templates')
@UseGuards(AdminGuard) 
export class WorkOrderTemplatesController {
  constructor(private readonly templatesService: WorkOrderTemplatesService) {}

  /**
   * 新增工单模板
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createDto: CreateWorkOrderTemplateDto,
    @Request() req, 
  ) {
    const adminId = req.user.adminId;
    const data = await this.templatesService.create(createDto, adminId);
    return { code: 200, message: '工单模板创建成功', data };
  }

  /**
   * 更新工单模板
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderTemplateDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    const data = await this.templatesService.update(numericId, updateDto);
    return { code: 200, message: '工单模板更新成功', data };
  }

  /**
   * 逻辑删除工单模板
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    await this.templatesService.remove(numericId);
    return { code: 200, message: '工单模板已逻辑删除' };
  }

  /**
   * 分页查询工单模板（支持关键词搜索和状态筛选）
   */
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAllByPage(@Query() queryDto: FindWorkOrderTemplatesDto) {
    const data = await this.templatesService.findAllByPage(queryDto);
    return { code: 200, data };
  }

  /**
   * 获取模板详情（含完整组合数据）
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    const data = await this.templatesService.findOne(numericId);
    return { code: 200, data };
  }

  /**
   * 获取全量模板列表（无分页，用于前端下拉选择等场景）
   */
  @Get('list/all')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async findAll(
    @Query('status') status?: string, // 可选：筛选状态
  ) {
    const data = await this.templatesService.findAll(status);
    return { code: 200, data };
  }
}