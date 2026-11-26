// src/modules/mini-app/assignment/dto/assignment-list.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max} from 'class-validator';

export class AssignmentListDto {
 @IsOptional()
  @IsInt()
  @Min(1) // 页码最小为1
  @Type(() => Number) // 自动将查询参数转为数字（避免字符串类型）
  page = 1; // 默认值：第1页

  @IsOptional()
  @IsInt()
  @Min(1) // 每页最小1条
  @Max(100) // 限制最大100条，避免全量查询性能问题
  @Type(() => Number)
  pageSize = 10; // 默认值：每页10条    
}