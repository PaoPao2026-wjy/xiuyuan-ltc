import { 
  IsEnum, 
  IsInt, 
  IsMobilePhone, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Min, 
  IsArray, 
  IsObject, 
  IsDateString, 
  MaxLength, 
  ValidateIf 
} from 'class-validator';
import { WorkOrderType, Priority, WorkOrderDraftStatus } from '@prisma/client';

export class CreateWorkOrderDraftDto {
  /**
   * 草稿标题（必填）
   * @example "海淀区电力设备检修"
   */
  @IsNotEmpty({ message: '草稿标题不能为空' })
  @IsString({ message: '标题必须是字符串' })
  @MaxLength(255, { message: '标题长度不能超过255个字符' })
  title: string;

  /**
   * 工单类型（必填，枚举）
   * @example "EQUIPMENT_MAINTENANCE"
   * INSPECTION        /// 巡检
  MAINTENANCE       /// 保养
  REPAIR            /// 维修
  ELECTRICAL_TEST   /// 电试（电气试验）
  TRANSFORMATION    /// 改造（设备改造）
  EMERGENCY_REPAIR  /// 抢修
  DAILY_PURCHASE    /// 日常采购
  TECHNICAL_GUIDANCE /// 技术指导
  OTHER             /// 其他
   */
  @IsNotEmpty({ message: '工单类型不能为空' })
  @IsEnum(WorkOrderType, { message: '工单类型无效，仅支持：INSPECTION/MAINTENANCE/REPAIR/ELECTRICAL_TEST/TRANSFORMATION/EMERGENCY_REPAIR/DAILY_PURCHASE/TECHNICAL_GUIDANCE/OTHER' })
  type: WorkOrderType;

  /**
   * 预计工时（必填，整数，至少1小时）
   * @example 4
   */
  @IsNotEmpty({ message: '预计工时不能为空' })
  @IsInt({ message: '预计工时必须是整数' })
  @Min(1, { message: '预计工时至少为1小时' })
  estimatedHours: number;

  /**
   * 优先级（必填，枚举）
   * @example "HIGH"
   *  URGENT   /// 紧急
  NORMAL   /// 一般
  LOW      /// 普通
   */
  @IsNotEmpty({ message: '优先级不能为空' })
  @IsEnum(Priority, { message: '优先级无效，仅支持：LOW/NORMAL/URGENT' })
  priority: Priority;

  /**
   * 关联企业ID（必填）
   * @example 1
   */
  @IsNotEmpty({ message: '企业ID不能为空' })
  @IsInt({ message: '企业ID必须是整数' })
  enterpriseId: number;

  /**
   * 企业联系人姓名（可选）
   * @example "张三"
   */
  @IsOptional()
  @IsString({ message: '企业联系人姓名必须是字符串' })
  @MaxLength(50, { message: '企业联系人姓名长度不能超过50个字符' })
  enterpriseContactName?: string;

  /**
   * 企业联系人电话（可选，支持手机号格式校验）
   * @example "13800138000"
   */
  @IsOptional()
  @IsString({ message: '企业联系人电话必须是字符串' })
  @IsMobilePhone('zh-CN', {}, { message: '企业联系人电话格式无效（仅支持中国大陆手机号）' })
  @MaxLength(50, { message: '企业联系人电话长度不能超过50个字符' })
  enterpriseContactPhone?: string;

  /**
   * 联系电话（必填，支持手机号格式校验）
   * @example "13900139000"
   */
  @IsNotEmpty({ message: '联系电话不能为空' })
  @IsString({ message: '联系电话必须是字符串' })
  @IsMobilePhone('zh-CN', {}, { message: '联系电话格式无效（仅支持中国大陆手机号）' })
  @MaxLength(50, { message: '联系电话长度不能超过50个字符' })
  contactPhone: string;

  /**
   * 工作地址（必填）
   * @example "北京市海淀区中关村南大街5号"
   */
  @IsNotEmpty({ message: '工作地址不能为空' })
  @IsString({ message: '工作地址必须是字符串' })
  workAddress: string;

  /**
   * 描述类型（必填，仅支持template/custom）
   * @example "custom"
   */
  @IsNotEmpty({ message: '描述类型不能为空' })
  @IsString({ message: '描述类型必须是字符串' })
  @IsEnum(['template', 'custom'], { message: '描述类型仅支持：template（模板）/custom（自定义）' })
  descriptionType: string;

  /**
   * 自定义描述（可选，仅描述类型为custom时必填）
   * @example "需要检修高压配电柜，要求持证电工操作"
   */
  @ValidateIf(o => o.descriptionType === 'custom')
  @IsNotEmpty({ message: '自定义描述不能为空（描述类型为custom时）' })
  @IsString({ message: '自定义描述必须是字符串' })
  customDescription?: string;

  /**
   * 图片URL数组（可选）
   * @example ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
   */
  @IsOptional()
  @IsArray({ message: '图片必须是URL数组' })
  @IsString({ each: true, message: '每张图片必须是有效的URL字符串' })
  images?: string[];

  /**
   * 选中的模板项（JSON对象，可选，仅描述类型为template时必填）
   * @example {"item1": "设备外观检查", "item2": "线路通断测试"}
   */
  @ValidateIf(o => o.descriptionType === 'template')
  @IsNotEmpty({ message: '模板选择项不能为空（描述类型为template时）' })
  @IsObject({ message: '模板选择项必须是JSON对象' })
  selectedTemplateItems?: Record<string, any>;

  /**
   * 具体要求（可选）
   * @example "需在2024-12-10前完成，需携带绝缘工具"
   */
  @IsOptional()
  @IsString({ message: '具体要求必须是字符串' })
  specificRequirements?: string;

  /**
   * 计划开始时间（可选，ISO日期格式）
   * @example "2024-12-01T08:00:00Z"
   */
  @IsOptional()
  @IsDateString({}, { message: '计划开始时间格式无效（需为ISO日期，如2024-12-01T08:00:00Z）' })
  plannedStartTime?: string;

  /**
   * 计划结束时间（可选，ISO日期格式，需晚于开始时间）
   * @example "2024-12-01T12:00:00Z"
   */
  @IsOptional()
  @IsDateString({}, { message: '计划结束时间格式无效（需为ISO日期，如2024-12-01T12:00:00Z）' })
  plannedEndTime?: string;

  /**
   * 特殊要求数组（可选）
   * @example ["需高压电工证", "夜间作业"]
   */
  @IsOptional()
  @IsArray({ message: '特殊要求必须是字符串数组' })
  @IsString({ each: true, message: '每个特殊要求必须是字符串' })
  specialRequirements?: string[];

  /**
   * 草稿备注（可选）
   * @example "该工单需提前预约企业负责人"
   */
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;

  /**
   * 草稿状态（可选，默认PENDING_SUBMIT）
   * @example "PENDING_SUBMIT"
   */
  @IsOptional()
  @IsEnum(WorkOrderDraftStatus, { message: '草稿状态无效，仅支持：PENDING_SUBMIT/SUBMITTED/CANCELLED' })
  draftStatus?: WorkOrderDraftStatus;

  /**
   * 关联正式工单ID（可选，唯一）
   * @example 1001
   */
  @IsOptional()
  @IsInt({ message: '关联工单ID必须是整数' })
  workOrderId?: number;

  
}