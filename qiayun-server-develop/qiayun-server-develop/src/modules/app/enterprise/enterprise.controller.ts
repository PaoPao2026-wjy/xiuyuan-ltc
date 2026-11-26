// src/modules/app/enterprise/enterprise.controller.ts
import { Controller, Post, Body, Request, UseGuards, Get, ValidationPipe, Put } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { AppGuard } from '../auth/app.guard'; // 小程序鉴权Guard（解析Token获取wechatId）
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { UpdateWechatUserDto } from './dto/update-wechat-user.dto';

// 小程序企业接口前缀（区分后台）
@Controller('app/enterprises')
@UseGuards(AppGuard) 
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  /**
   * 小程序企业用户创建/绑定企业
   * 逻辑：营业执照编号存在则绑定，不存在则新建
   */
  @Post('bind')
  async createOrBind(
    @Body(new ValidationPipe({ whitelist: true })) createDto: CreateEnterpriseDto,
    @Request() req
  ) {
    const wechatId = req.user.sub; // 从Token解析的小程序用户wechatId
    const result = await this.enterpriseService.createOrBindEnterprise(createDto, wechatId);
    return {
      code: 200,
      message: result.isNew ? '企业创建并绑定成功' : '企业绑定成功',
      data: result,
    };
  }

  /**
   * 小程序企业用户查询自己绑定的企业信息
   */
  @Get('my')
  async findMyEnterprise(@Request() req) {
    const wechatId = req.user.sub;
    const enterprise = await this.enterpriseService.findMyEnterprise(wechatId);
    return {
      code: 200,
      message: '查询成功',
      data: enterprise,
    };
  }

  /**
   * 小程序企业用户更新绑定的企业信息
   */
  @Put('my')
  async updateMyEnterprise(
    @Body(new ValidationPipe({ whitelist: true })) updateDto: UpdateEnterpriseDto,
    @Request() req
  ) {
    const wechatId = req.user.sub;
    const updated = await this.enterpriseService.updateMyEnterprise(updateDto, wechatId);
    return {
      code: 200,
      message: '企业信息更新成功',
      data: updated,
    };
  }

  /**
   * 新增：企业端用户查询自身微信信息详情
   */
  @Get('my-wechat')
  async findMyWechatInfo(@Request() req) {
    const wechatId = req.user.sub; // 从Token解析的小程序用户wechatId
    const wechatUser = await this.enterpriseService.findWechatUserDetail(wechatId);
    return {
      code: 200,
      message: '查询微信信息成功',
      data: wechatUser,
    };
  }

  /**
   * 新增：企业端用户更新自身微信信息
   */
  @Put('my-wechat')
  async updateMyWechatInfo(
    @Body(new ValidationPipe({ whitelist: true })) updateDto: UpdateWechatUserDto,
    @Request() req
  ) {
    const wechatId = req.user.sub;
    const updated = await this.enterpriseService.updateWechatUserInfo(updateDto, wechatId);
    return {
      code: 200,
      message: '微信信息更新成功',
      data: updated,
    };
  }
}