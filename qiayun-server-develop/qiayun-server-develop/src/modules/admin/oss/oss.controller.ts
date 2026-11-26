// src/modules/app/oss/oss.controller.ts
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { OssService } from './oss.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/oss')
@UseGuards(AdminGuard) 
export class OssController {
  constructor(private readonly ossService: OssService) {}

  //上传接口
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const result = await this.ossService.uploadFile(file, folder);
    return {
      code: 200,
      message: '文件上传成功',
      data: result, 
    };
  }
}