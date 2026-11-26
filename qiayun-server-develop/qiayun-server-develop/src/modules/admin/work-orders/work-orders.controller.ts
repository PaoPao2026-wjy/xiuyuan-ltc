import { Controller, Get, Put, Param, UseGuards, UsePipes, ValidationPipe, Query, Request, Body, Post, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { FindWorkOrdersDto } from './dto/find-work-orders.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { AdminGuard } from '../auth/admin.guard';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Controller('admin/work-orders')
@UseGuards(AdminGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  /**
   * 工单分页查询
   */
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAllWithPagination(@Query() queryDto: FindWorkOrdersDto) {
    try {
      const data = await this.workOrdersService.findAllWithPagination(queryDto);
      return { code: 200, data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 获取工单详情
   */
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    try {
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        return { code: 400, message: '工单ID必须是正整数' };
      }
      const data = await this.workOrdersService.findOne(numericId);
      return { code: 200, data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 编辑工单
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    try {
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        return { code: 400, message: '工单ID必须是正整数' };
      }
      const data = await this.workOrdersService.update(numericId, updateDto);
      return { code: 200, message: '工单更新成功', data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 指派工程师
   */
  @Post(':id/assign')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async assignTechnician(
    @Param('id') id: string,
    @Body() assignDto: AssignTechnicianDto,
    @Request() req,
  ) {
    try {
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        return { code: 400, message: '工单ID必须是正整数' };
      }
      const adminId = req.user.adminId;
      const data = await this.workOrdersService.assignTechnician(numericId, assignDto, adminId);
      return { code: 200, message: '工程师指派成功', data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 工单逻辑删除接口
   */
  @Delete(':id') 
  async remove(@Param('id') id: string) {
    try {
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        return { code: 400, message: '工单ID必须是正整数' };
      }

      await this.workOrdersService.remove(numericId);
      return { code: 200, message: '工单已逻辑删除（关联指派记录同步标记）' };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 工单状态统计
   */
  @Get('statistics')
  async getWorkOrderStatistics() {
    try {
      const data = await this.workOrdersService.countWorkOrdersByStatus();
      return { code: 200, data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 新增工单
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createDto: CreateWorkOrderDto,
    @Request() req,
  ) {
    try {
      const adminId = req.user.adminId;
      const data = await this.workOrdersService.create(createDto, adminId);
      return { code: 200, message: '工单创建成功', data };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 指派工程师并自动接单
   */
  @Post(':id/assign-auto-accept')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async assignTechnicianAutoAccept(
    @Param('id') id: string,
    @Body() assignDto: AssignTechnicianDto,
    @Request() req,
  ) {
    try {
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        return { code: 400, message: '工单ID必须是正整数' };
      }
      const adminId = req.user.adminId;
      const { assignment, workOrder, technicianRecord } = await this.workOrdersService.assignTechnicianAutoAccept(
        numericId, 
        assignDto, 
        adminId
      );
      return { 
        code: 200, 
        message: '工程师指派并自动接单成功', 
        data: { assignment, workOrder, technicianRecord } 
      };
    } catch (error) {
      throw new HttpException({ code: HttpStatus.BAD_REQUEST, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}