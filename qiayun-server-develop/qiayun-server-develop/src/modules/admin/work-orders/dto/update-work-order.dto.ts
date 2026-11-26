import { IsEnum, IsInt, IsMobilePhone, IsOptional, IsString, Min } from 'class-validator';
import { WorkOrderType, Priority, WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsString({ message: '标题必须是字符串' })
  @IsOptional()
  title?: string;

  @IsEnum(WorkOrderType, { message: '工单类型无效' })
  @IsOptional()
  type?: WorkOrderType;

  @IsInt({ message: '预计工时必须是整数' })
  @Min(1, { message: '预计工时至少为1小时' })
  @IsOptional()
  estimatedHours?: number;

  @IsEnum(Priority, { message: '优先级无效' })
  @IsOptional()
  priority?: Priority;

  @IsInt({ message: '企业ID必须是整数' })
  @IsOptional()
  enterpriseId?: number;
   
  @IsString({ message: '联系电话必须是字符串' })
  @IsOptional()
  contactPhone?: string;

  @IsString({ message: '联系人必须是字符串' })
  @IsOptional()
  contactName?: string;

  @IsString({ message: '工作地址必须是字符串' })
  @IsOptional()
  workAddress?: string;

  @IsString({ message: '描述类型必须是字符串' })
  @IsOptional()
  descriptionType?: string;

  @IsString({ message: '自定义描述必须是字符串' })
  @IsOptional()
  customDescription?: string;

  @IsOptional()
  selectedTemplateItems?: any;

  @IsString({ message: '具体要求必须是字符串' })
  @IsOptional()
  specificRequirements?: string;

  @IsOptional()
  plannedStartTime?: Date;

  @IsOptional()
  plannedEndTime?: Date;

  @IsOptional()
  specialRequirements?: string[];

  @IsString({ message: '备注必须是字符串' })
  @IsOptional()
  remarks?: string;

  @IsEnum(WorkOrderStatus, { message: '工单状态无效' })
  @IsOptional()
  status?: WorkOrderStatus;

  @IsOptional()
  images?: string[];
}