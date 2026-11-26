import { Controller, Post, Body, Request, UseGuards, Get, Query, ValidationPipe, Put, Param, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { AppGuard } from '../auth/app.guard';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { UpdateEquipmentDto } from 'src/modules/admin/equipment/dto/update-equipment.dto';
import { QueryDefaultEquipmentTemplateDto } from './dto/query-default-template.dto';
import { PrismaService } from '../../../prisma/prisma.service'; 

@Controller('app/equipments')
@UseGuards(AppGuard) 
export class EquipmentController {

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * 私有方法：校验企业用户身份 + 获取绑定的企业ID
   * @param wechatUserId 微信用户ID
   * @returns 绑定的企业ID
   */
  private async validateEnterpriseUser(wechatUserId: number): Promise<number> {
    // 查询微信用户信息（角色 + 绑定的企业ID）
    const wechatUser = await this.prisma.wechatUser.findUnique({
      where: { wechatId: wechatUserId, isDeleted: false },
      select: {
        loginRole: true, // 用户角色（ENTERPRISE/TECHNICIAN/ADMIN）
        enterpriseId: true // 绑定的企业ID（企业用户才会有）
      }
    });

    //  校验用户存在
    if (!wechatUser) {
      throw new BadRequestException('微信用户不存在');
    }

    //  校验角色为企业用户，防止跨角色调用
    if (wechatUser.loginRole !== 'ENTERPRISE') {
      throw new ForbiddenException('仅企业账号可操作设备管理功能');
    }

    //  校验已绑定企业，防止未绑定就创建设备
    if (!wechatUser.enterpriseId) {
      throw new BadRequestException('当前账号未绑定企业，请先完成企业绑定');
    }

    //  二次校验企业是否有效（防止企业被删除）
    const enterprise = await this.prisma.enterprise.findUnique({
      where: { id: wechatUser.enterpriseId, isDeleted: false }
    });
    if (!enterprise) {
      throw new BadRequestException('绑定的企业已被删除，请重新绑定企业');
    }

    return wechatUser.enterpriseId;
  }

  /**
 * 获取当前微信用户绑定的企业ID（若未绑定则返回 null）
 * @param wechatUserId 微信用户ID
 * @returns 绑定的企业ID 或 null
 */
private async getEnterpriseIdIfBound(wechatUserId: number): Promise<number | null> {
  const wechatUser = await this.prisma.wechatUser.findUnique({
    where: { wechatId: wechatUserId, isDeleted: false },
    select: {
      loginRole: true,
      enterpriseId: true,
    },
  });

  // 用户不存在 or 不是企业角色 → 无企业权限
  if (!wechatUser || wechatUser.loginRole !== 'ENTERPRISE') {
    return null;
  }

  // 未绑定企业
  if (!wechatUser.enterpriseId) {
    return null;
  }

  // 企业已被删除
  const enterprise = await this.prisma.enterprise.findUnique({
    where: { id: wechatUser.enterpriseId, isDeleted: false },
  });
  if (!enterprise) {
    return null;
  }

  return wechatUser.enterpriseId;
}

  // 企业创建设备
  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) createDto: CreateEquipmentDto, @Request() req) {
    // 从Token中获取微信用户ID
    const wechatUserId = req.user.sub;
    // 校验身份并获取企业ID
    const enterpriseId = await this.validateEnterpriseUser(wechatUserId);
    
    return {
      code: 200,
      message: '设备创建成功',
      data: await this.equipmentService.create(createDto, enterpriseId),
    };
  }

  // 分页查询当前企业的设备
 @Get()
async findMyEquipments(
  @Query(new ValidationPipe({ whitelist: true })) query: QueryEquipmentDto,
  @Request() req
) {
  const wechatUserId = req.user.sub;
  const enterpriseId = await this.getEnterpriseIdIfBound(wechatUserId);

  // 如果未绑定企业，直接返回空分页数据
  if (enterpriseId === null) {
    return {
      code: 200,
      message: '查询成功',
      data: {
        list: [],
        pagination: {
          total: 0,
          page: Number(query.page) || 1,
          pageSize: Number(query.pageSize) || 10,
          totalPages: 0,
        },
      },
    };
  }

  // 否则正常查询
  const data = await this.equipmentService.findMyEquipments(query, enterpriseId);
  return {
    code: 200,
    message: '查询成功',
    data,
  };
}

  // 查询单个设备
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const wechatUserId = req.user.sub;
    const enterpriseId = await this.validateEnterpriseUser(wechatUserId);
    
    return {
      code: 200,
      message: '设备查询成功',
      data: await this.equipmentService.findOne(+id, enterpriseId),
    };
  }

  /**
   * 更新设备信息
   * @param id 设备ID
   * @param updateDto 待更新信息
   */
  @Put(':id')
  async update(
    @Request() req, 
    @Param('id') id: string, 
    @Body(new ValidationPipe({ whitelist: true })) updateDto: UpdateEquipmentDto
  ) {  
    const wechatUserId = req.user.sub;
    const enterpriseId = await this.validateEnterpriseUser(wechatUserId);
    
    return {
      code: 200,
      message: '设备更新成功',
      data: await this.equipmentService.update(enterpriseId, +id, updateDto),
    };
  }

  // 根据类型查询默认设备模板
  @Get('default/template')
  async getDefaultTemplate(
    @Query(new ValidationPipe({ 
      whitelist: true, 
      transform: true // 启用类型转换，确保枚举参数正确解析
    })) query: QueryDefaultEquipmentTemplateDto,
    @Request() req
  ) {
    // 即使是查模板，也校验角色（防止非企业用户调用）
    const wechatUserId = req.user.sub;
    await this.validateEnterpriseUser(wechatUserId);
    
    const template = await this.equipmentService.getTemplatesByType(query.type);
    return {
      code: 200,
      message: '默认设备模板查询成功',
      data: template,
    };
  }
}