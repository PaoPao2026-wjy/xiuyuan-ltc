// src/modules/admin/enterprises/enterprises.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UsePipes, ValidationPipe, Query, Req } from '@nestjs/common';
import { EnterprisesService } from './enterprises.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { AdminGuard } from '../auth/admin.guard'; // 后台权限守卫
import { FindEnterprisesDto } from './dto/find-enterprises.dto';
import { AuditEnterpriseDto } from './dto/audit-enterprise.dto';
import { BadRequestException } from 'src/exceptions/bad-request.exception';


@Controller('admin/enterprises') // 路由前缀：/api/admin/enterprises（结合全局/api前缀）
@UseGuards(AdminGuard) 
export class EnterprisesController {
  constructor(private readonly enterprisesService: EnterprisesService) {}

  // 创建企业
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  async create(@Body() createDto: CreateEnterpriseDto) {
    const data = await this.enterprisesService.create(createDto);
    return { code: 200, message: '企业创建成功', data };
  }

  // 查询所有企业(审核通过)
  @Get('all')
  async findAll() {
    const data = await this.enterprisesService.findAll();
    return { code: 200, data };
  }

  // 分页查询企业
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) 
  async findAllWithPagination(
    @Query() queryDto: FindEnterprisesDto, 
  ) {
    const data = await this.enterprisesService.findAllWithPagination(queryDto);
    return { code: 200, data }; 
  }

  // 查询单个企业
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '企业ID必须是正整数' };
    }
    const data = await this.enterprisesService.findOne(numericId);
    return { code: 200, data };
  }

  // 更新企业
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEnterpriseDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '企业ID必须是正整数' };
    }
    const data = await this.enterprisesService.update(numericId, updateDto);
    return { code: 200, message: '企业更新成功', data };
  }

  // 删除企业
 @Delete(':id')
  async remove(@Param('id') id: string) {
    //  校验企业ID格式
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '企业ID必须是正整数' };
    }

    try {
      // 调用服务层删除逻辑
      await this.enterprisesService.remove(numericId);
      return { code: 200, message: '企业删除成功' };
    } catch (error) {
      //捕获业务异常，返回对应提示
      if (error instanceof BadRequestException) {
        return { code: 400, message: error.message };
      }
      // 其他异常返回服务器错误
      return { code: 500, message: '删除失败：' + error.message };
    }
  }

  /**
   * 审核企业实名认证
   * @param id 企业ID
   * @param auditDto 审核参数（状态+驳回原因）
   */
  @Put(':id/auth')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async auditEnterprise(
    @Req() req,
    @Param('id') id: string,
    @Body() auditDto: AuditEnterpriseDto,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      return { code: 400, message: '企业ID必须是正整数' };
    }
    const data = await this.enterprisesService.auditEnterprise(req.user.adminId, numericId, auditDto);
    const message = auditDto.enterpriseRealAuthStatus === 'AUTHORIZED' 
      ? '企业审核通过' 
      : auditDto.enterpriseRealAuthStatus === 'REJECTED' 
        ? '企业审核驳回' 
        : '企业审核状态更新为审核中';
    return { code: 200, message, data };
  }

}