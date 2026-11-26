import { IsInt, IsOptional, IsString } from 'class-validator';

export class AssignTechnicianDto {
  @IsInt({ message: '电工ID必须是整数' })
  technicianId: number;

  @IsString({ message: '指派备注必须是字符串' })
  @IsOptional()
  remark?: string;
}