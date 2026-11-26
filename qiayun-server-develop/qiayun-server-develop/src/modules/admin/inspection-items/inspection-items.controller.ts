// src/modules/admin/inspection-items/inspection-items.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { InspectionItemsService } from './inspection-items.service';
import { CreateInspectionItemDto } from './dto/create-inspection-item.dto';
import { UpdateInspectionItemDto } from './dto/update-inspection-item.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/inspection-items')
@UseGuards(AdminGuard)
export class InspectionItemsController {
  constructor(private readonly itemsService: InspectionItemsService) {}

  /**
   * 模板下的检查项列表（按模板ID查询）
   */
  @Get('template/:templateId')
  async findByTemplate(@Param('templateId') templateId: string) {
    const numericTemplateId = Number(templateId);
    if (isNaN(numericTemplateId) || numericTemplateId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    const data = await this.itemsService.findByTemplate(numericTemplateId);
    return { code: 200, data };
  }

   /**
   * 检查项详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '检查项ID必须是正整数' };
    }
    const data = await this.itemsService.findOne(numericId);
    return { code: 200, data };
  }


  /**
   * 为模板创建检查项
   */
  @Post('template/:templateId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(
    @Param('templateId') templateId: string,
    @Body() createDto: CreateInspectionItemDto,
    @Request() req,
  ) {
    const numericTemplateId = Number(templateId);
    if (isNaN(numericTemplateId) || numericTemplateId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' };
    }
    const adminId = req.user.adminId; // 记录创建者
    const data = await this.itemsService.create(numericTemplateId, createDto, adminId);
    return { code: 200, message: '检查项创建成功', data };
  }

  /**
   * 更新检查项
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInspectionItemDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '检查项ID必须是正整数' };
    }
    const data = await this.itemsService.update(numericId, updateDto);
    return { code: 200, message: '检查项更新成功', data };
  }

  /**
   * 逻辑删除检查项
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '检查项ID必须是正整数' };
    }
    await this.itemsService.remove(numericId);
    return { code: 200, message: '检查项已逻辑删除' }; // 移除操作项同步标记的描述
  }
}