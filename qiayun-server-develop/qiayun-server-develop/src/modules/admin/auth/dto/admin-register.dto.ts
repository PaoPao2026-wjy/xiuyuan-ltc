import { IsString, IsPhoneNumber, IsEmail, Matches, MaxLength, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  username: string; // 登录用户名

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: '密码需包含字母和数字' })
  password: string; // 密码

  @IsString()
  @MaxLength(50)
  realName: string; // 真实姓名

  @IsPhoneNumber('CN', { message: '手机号格式错误' })
  phone: string; // 手机号

  @IsEmail({}, { message: '邮箱格式错误' })
  @MaxLength(100)
  email: string; // 邮箱
}