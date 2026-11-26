// src/modules/admin/equipment/equipment.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Query, Request, UseGuards, Put, ValidationPipe } from '@nestjs/common';
import { AdminEquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { AdminGuard } from '../auth/admin.guard';
import { QueryDefaultEquipmentTemplateDto } from 'src/modules/app/equipment/dto/query-default-template.dto';
import { EquipmentTemplateService } from '../equipment-template/equipment-template.service';

@Controller('admin/equipments')
@UseGuards(AdminGuard)
export class AdminEquipmentController {
  constructor(private readonly adminEquipmentService: AdminEquipmentService
    ,private readonly adminEquipmentTemplateService: EquipmentTemplateService
  ) {}

  /**
   * 创建设备
   * @param createDto 设备信息
   * @param req 请求对象
   */
  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) createDto: CreateEquipmentDto, @Request() req) {
    // 此处可添加管理员权限校验
    // const { role } = req.user;
    // if (role !== 'SUPER_ADMIN') throw new ForbiddenException('无权限创建设备');
    return {
      code: 200,
      message: '设备创建成功',
      data: await this.adminEquipmentService.create(createDto),
    };
  }

  /**
   * 分页查询设备
   * @param query 分页及筛选参数
   */
  @Get()
  async findAll(@Query(new ValidationPipe({ whitelist: true })) query: QueryEquipmentDto) {
    return {
      code: 200,
      message: '设备查询成功',
      data: await this.adminEquipmentService.findAll(query),
    };
  }

  /**
   * 查询默认设备模板
   * @param query 设备类型查询参数
   */
    @Get('default/template')
    async getDefaultTemplate(
      @Query(new ValidationPipe({ 
        whitelist: true, 
        transform: true // 启用类型转换，确保枚举参数正确解析
      })) query: QueryDefaultEquipmentTemplateDto
    ) {
      const template = await this.adminEquipmentTemplateService.getTemplatesListByType(query.type);
      return {
        code: 200,
        message: '设备模板查询成功',
        data: template,
      };
    }

  /**
   * 查询单个设备详情
   * @param id 设备ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      code: 200,
      message: '设备查询成功',
      data: await this.adminEquipmentService.findOne(+id),
    };
  }

  /**
   * 更新设备信息
   * @param id 设备ID
   * @param updateDto 待更新信息
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe({ whitelist: true })) updateDto: UpdateEquipmentDto) {  
    return {
      code: 200,
      message: '设备更新成功',
      data: await this.adminEquipmentService.update(+id, updateDto),
    };
  }

  /**
   * 删除设备（逻辑删除）
   * @param id 设备ID
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return {
      code: 200,
      message: '设备删除成功',
      data: await this.adminEquipmentService.remove(+id),
    };
  }

}