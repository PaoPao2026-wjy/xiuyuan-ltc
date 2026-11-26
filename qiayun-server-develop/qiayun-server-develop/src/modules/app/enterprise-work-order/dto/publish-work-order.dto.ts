import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, IsBoolean, Min, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority, WorkOrderType } from '@prisma/client';

export class PublishWorkOrderDto {
  @IsNotEmpty({ message: '草稿标题不能为空' })
   @IsString({ message: '标题必须是字符串' })
   title: string;
 
   @IsEnum(WorkOrderType, { message: '工单类型无效' })
   type: WorkOrderType;
 
   @IsInt({ message: '预计工时必须是整数' })
   @Min(1, { message: '预计工时至少为1小时' })
   estimatedHours: number;
 
   @IsEnum(Priority, { message: '优先级无效' })
   priority: Priority;
 
  //  @IsInt({ message: '企业ID必须是整数' })
  //  enterpriseId: number;
 
   @IsNotEmpty({ message: '联系电话不能为空' })
   @IsString({ message: '联系电话必须是字符串' })
   contactPhone: string;

   @IsNotEmpty({ message: '联系人不能为空' })
   @IsString({ message: '联系人必须是字符串' })
   contactName: string;
 
   @IsNotEmpty({ message: '工作地址不能为空' })
   @IsString({ message: '工作地址必须是字符串' })
   workAddress: string;
 
   @IsString({ message: '描述类型必须是字符串' })
   @IsNotEmpty({ message: '描述类型不能为空（template/custom）' })
   descriptionType: string;
 
   @IsString({ message: '自定义描述必须是字符串' })
   @IsOptional()
   customDescription?: string;
 
   @IsOptional()
   selectedTemplateItems?: any; // JSON格式，存储模板选择项
 
   @IsString({ message: '具体要求必须是字符串' })
   @IsOptional()
   specificRequirements?: string;
 
   @IsOptional()
   plannedStartTime?: Date;
 
   @IsOptional()
   plannedEndTime?: Date;
 
   @IsOptional()
   specialRequirements?: string[]; // 特殊要求数组（前端传递，后端转JSON）
 
   @IsString({ message: '备注必须是字符串' })
   @IsOptional()
   remarks?: string;
 
   /** 关联草稿ID（可选） */
   @IsOptional()
   @IsInt({ message: '草稿ID需为整数' })
   draftId?: number;
 
   @IsOptional()
   images?: string[];
}