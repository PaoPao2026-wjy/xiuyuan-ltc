// src/modules/admin/equipment-template/equipment-template.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Query, Request, UseGuards, ValidationPipe, Put } from '@nestjs/common';
import { EquipmentTemplateService } from './equipment-template.service';
import { CreateEquipmentTemplateDto } from './dto/create-equipment-template.dto';
import { UpdateEquipmentTemplateDto } from './dto/update-equipment-template.dto';
import { QueryEquipmentTemplateDto } from './dto/query-equipment-template.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/equipment-templates')
@UseGuards(AdminGuard)
export class EquipmentTemplateController {
  constructor(private readonly equipmentTemplateService: EquipmentTemplateService) {}

  // 创建模板
  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) createDto: CreateEquipmentTemplateDto, @Request() req) {
    // 从请求中获取管理员ID
    const adminId = req.user.adminId;
    return {
      code: 200,
      message: '模板创建成功',
      data: await this.equipmentTemplateService.create(createDto, adminId),
    };
  }

  // 分页查询
  @Get()
  async findAll(@Query(new ValidationPipe({ 
      transform: true,
      whitelist: true, 
    })) query: QueryEquipmentTemplateDto
  ) {
    return {
      code: 200,
      message: '查询成功',
      data: await this.equipmentTemplateService.findAll(query),
    };
  }

  // 查单个
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      code: 200,
      message: '查询成功',
      data: await this.equipmentTemplateService.findOne(+id),
    };
  }

  // 更新
  @Put(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe({ whitelist: true })) updateDto: UpdateEquipmentTemplateDto) {
    return {
      code: 200,
      message: '更新成功',
      data: await this.equipmentTemplateService.update(+id, updateDto),
    };
  }

  // 删除
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return {
      code: 200,
      message: '删除成功',
      data: await this.equipmentTemplateService.remove(+id),
    };
  }
}