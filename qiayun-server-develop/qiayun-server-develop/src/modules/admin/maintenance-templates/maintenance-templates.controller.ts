// src/modules/admin/maintenance-templates/maintenance-templates.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MaintenanceTemplatesService } from './maintenance-templates.service';
import { CreateMaintenanceTemplateDto } from './dto/create-maintenance-template.dto';
import { UpdateMaintenanceTemplateDto } from './dto/update-maintenance-template.dto';
import { FindMaintenanceTemplatesDto } from './dto/find-maintenance-templates.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/maintenance-templates')
@UseGuards(AdminGuard) 
export class MaintenanceTemplatesController {
  constructor(private readonly templatesService: MaintenanceTemplatesService) {}

  /**
   * 模板列表（分页+关键词搜索）
   * 支持按模板名称模糊搜索
   */
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAllByPage(@Query() queryDto: FindMaintenanceTemplatesDto) {
    const data = await this.templatesService.findAllByPage(queryDto);
    return { code: 200, data };
  }

   /**
   * 无分页的带检查项+操作项模板列表
   */
  @Get('list')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAllWithItemsNoPagination(
    @Query('keyword') keyword?: string,
  ) {
    const data = await this.templatesService.findAllWithItemsNoPagination(keyword);
    return { code: 200, data }; // data直接是模板数组
  }

  /**
   * 模板详情（关联检查项+关联操作项）
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
   * 创建维保模板（关联创建者ID）
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Body() createDto: CreateMaintenanceTemplateDto,
    @Request() req, // 从请求中获取创建者ID（AdminGuard已验证）
  ) {
    const adminId = req.user.adminId;
    const data = await this.templatesService.create(createDto, adminId);
    return { code: 200, message: '模板创建成功', data };
  }

  /**
   * 更新维保模板
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMaintenanceTemplateDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    const data = await this.templatesService.update(numericId, updateDto);
    return { code: 200, message: '模板更新成功', data };
  }

  /**
   * 逻辑删除模板（级联标记检查项+操作项为已删除）
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    await this.templatesService.remove(numericId);
    return { code: 200, message: '模板已逻辑删除（关联检查项/操作项同步标记）' };
  }
}