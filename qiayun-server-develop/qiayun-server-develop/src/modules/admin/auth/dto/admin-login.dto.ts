import { IsString, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @MaxLength(50)
  username: string; // 用户名

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string; // 密码
}