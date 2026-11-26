// src/modules/mini-app/assignment/dto/handle-assignment.dto.ts
import { IsNumber } from 'class-validator';

export class HandleAssignmentDto {
  @IsNumber()
  assignmentId: number; // 指派单ID
}