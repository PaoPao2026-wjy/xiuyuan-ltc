// src/modules/admin/operation-items/operation-items.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { OperationItemsService } from './operation-items.service';
import { CreateOperationItemDto } from './dto/create-operation-item.dto';
import { UpdateOperationItemDto } from './dto/update-operation-item.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/operation-items')
@UseGuards(AdminGuard)
export class OperationItemsController {
  constructor(private readonly itemsService: OperationItemsService) {}

/**
   * 模板下的操作项列表
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
   * 操作项详情（按ID查询）
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '操作项ID必须是正整数' };
    }
    const data = await this.itemsService.findOne(numericId);
    return { code: 200, data };
  }


   /**
   * 为模板创建操作项
   */
  @Post('template/:templateId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Param('templateId') templateId: string, 
    @Body() createDto: CreateOperationItemDto,
    @Request() req,
  ) {
    const numericTemplateId = Number(templateId);
    if (isNaN(numericTemplateId) || numericTemplateId <= 0) {
      return { code: 400, message: '模板ID必须是正整数' }; 
    }
    const adminId = req.user.adminId;
    const data = await this.itemsService.create(numericTemplateId, createDto, adminId);
    return { code: 200, message: '操作项创建成功', data };
  }

  /**
   * 更新操作项
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOperationItemDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '操作项ID必须是正整数' };
    }
    const data = await this.itemsService.update(numericId, updateDto);
    return { code: 200, message: '操作项更新成功', data };
  }

  /**
   * 逻辑删除操作项
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '操作项ID必须是正整数' };
    }
    await this.itemsService.remove(numericId);
    return { code: 200, message: '操作项已逻辑删除' };
  }
}