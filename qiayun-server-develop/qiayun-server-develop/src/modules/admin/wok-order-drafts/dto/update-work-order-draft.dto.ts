import { 
  IsEnum, 
  IsInt, 
  IsMobilePhone, 
  IsOptional, 
  IsString, 
  Min, 
  IsArray, 
  IsObject, 
  IsDateString, 
  MaxLength, 
  ValidateIf, 
  IsNotEmpty
} from 'class-validator';
import { WorkOrderType, Priority, WorkOrderDraftStatus } from '@prisma/client';

export class UpdateWorkOrderDraftDto {
  /**
   * 草稿标题（可选）
   * @example "海淀区电力设备检修（更新）"
   */
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(255, { message: '标题长度不能超过255个字符' })
  title?: string;

  /**
   * 工单类型（可选，枚举）
   * @example "EQUIPMENT_MAINTENANCE"
   */
  @IsOptional()
  @IsEnum(WorkOrderType, { message: '工单类型无效，仅支持：EQUIPMENT_MAINTENANCE/FAULT_REPAIR/INSTALLATION' })
  type?: WorkOrderType;

  /**
   * 预计工时（可选，整数，至少1小时）
   * @example 5
   */
  @IsOptional()
  @IsInt({ message: '预计工时必须是整数' })
  @Min(1, { message: '预计工时至少为1小时' })
  estimatedHours?: number;

  /**
   * 优先级（可选，枚举）
   * @example "MEDIUM"
   */
  @IsOptional()
  @IsEnum(Priority, { message: '优先级无效，仅支持：LOW/MEDIUM/HIGH/URGENT' })
  priority?: Priority;

  /**
   * 关联企业ID（可选）
   * @example 2
   */
  @IsOptional()
  @IsInt({ message: '企业ID必须是整数' })
  enterpriseId?: number;

  /**
   * 企业联系人姓名（可选）
   * @example "李四"
   */
  @IsOptional()
  @IsString({ message: '企业联系人姓名必须是字符串' })
  @MaxLength(50, { message: '企业联系人姓名长度不能超过50个字符' })
  enterpriseContactName?: string;

  /**
   * 企业联系人电话（可选，支持手机号格式校验）
   * @example "13700137000"
   */
  @IsOptional()
  @IsString({ message: '企业联系人电话必须是字符串' })
  @IsMobilePhone('zh-CN', {}, { message: '企业联系人电话格式无效（仅支持中国大陆手机号）' })
  @MaxLength(50, { message: '企业联系人电话长度不能超过50个字符' })
  enterpriseContactPhone?: string;

  /**
   * 联系电话（可选，支持手机号格式校验）
   * @example "13600136000"
   */
  @IsOptional()
  @IsString({ message: '联系电话必须是字符串' })
  @IsMobilePhone('zh-CN', {}, { message: '联系电话格式无效（仅支持中国大陆手机号）' })
  @MaxLength(50, { message: '联系电话长度不能超过50个字符' })
  contactPhone?: string;

  /**
   * 工作地址（可选）
   * @example "北京市海淀区中关村南大街6号"
   */
  @IsOptional()
  @IsString({ message: '工作地址必须是字符串' })
  workAddress?: string;

  /**
   * 描述类型（可选，仅支持template/custom）
   * @example "template"
   */
  @IsOptional()
  @IsString({ message: '描述类型必须是字符串' })
  @IsEnum(['template', 'custom'], { message: '描述类型仅支持：template（模板）/custom（自定义）' })
  descriptionType?: string;

  /**
   * 自定义描述（可选，仅描述类型为custom时必填）
   * @example "需要更换配电柜开关，要求2名电工配合"
   */
  @ValidateIf(o => o.descriptionType === 'custom')
  @IsNotEmpty({ message: '自定义描述不能为空（描述类型为custom时）' })
  @IsString({ message: '自定义描述必须是字符串' })
  customDescription?: string;

  /**
   * 图片URL数组（可选）
   * @example ["https://example.com/photo3.jpg"]
   */
  @IsOptional()
  @IsArray({ message: '图片必须是URL数组' })
  @IsString({ each: true, message: '每张图片必须是有效的URL字符串' })
  images?: string[];

  /**
   * 选中的模板项（JSON对象，可选，仅描述类型为template时必填）
   * @example {"item1": "设备接地测试", "item2": "绝缘电阻测试"}
   */
  @ValidateIf(o => o.descriptionType === 'template')
  @IsNotEmpty({ message: '模板选择项不能为空（描述类型为template时）' })
  @IsObject({ message: '模板选择项必须是JSON对象' })
  selectedTemplateItems?: Record<string, any>;

  /**
   * 具体要求（可选）
   * @example "需在2024-12-15前完成，需携带检测报告模板"
   */
  @IsOptional()
  @IsString({ message: '具体要求必须是字符串' })
  specificRequirements?: string;

  /**
   * 计划开始时间（可选，ISO日期格式）
   * @example "2024-12-02T08:00:00Z"
   */
  @IsOptional()
  @IsDateString({}, { message: '计划开始时间格式无效（需为ISO日期，如2024-12-02T08:00:00Z）' })
  plannedStartTime?: string;

  /**
   * 计划结束时间（可选，ISO日期格式，需晚于开始时间）
   * @example "2024-12-02T13:00:00Z"
   */
  @IsOptional()
  @IsDateString({}, { message: '计划结束时间格式无效（需为ISO日期，如2024-12-02T13:00:00Z）' })
  plannedEndTime?: string;

  /**
   * 特殊要求数组（可选）
   * @example ["需低压电工证", "需开具增值税发票"]
   */
  @IsOptional()
  @IsArray({ message: '特殊要求必须是字符串数组' })
  @IsString({ each: true, message: '每个特殊要求必须是字符串' })
  specialRequirements?: string[];

  /**
   * 草稿备注（可选）
   * @example "该工单需提前确认电工资质"
   */
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;

  /**
   * 草稿状态（可选）
   * @example "SUBMITTED"
   */
  @IsOptional()
  @IsEnum(WorkOrderDraftStatus, { message: '草稿状态无效，仅支持：PENDING_SUBMIT/SUBMITTED/CANCELLED' })
  draftStatus?: WorkOrderDraftStatus;

  /**
   * 关联正式工单ID（可选，唯一）
   * @example 1002
   */
  @IsOptional()
  @IsInt({ message: '关联工单ID必须是整数' })
  workOrderId?: number;

  
}