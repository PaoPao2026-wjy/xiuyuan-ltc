// src/common/services/oss.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid'; // 生成唯一文件名

@Injectable()
export class OssService {
  private readonly ossClient: OSS;
  private readonly bucketName: string;
  private readonly basePath: string;
  private readonly publicDomain: string; // 公共读 OSS 的公网域名

  constructor(private readonly configService: ConfigService) {
    //  读取 OSS 配置
    const endpoint = this.configService.get<string>('OSS_ENDPOINT');
    const accessKeyId = this.configService.get<string>('OSS_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('OSS_ACCESS_KEY_SECRET');
    this.bucketName = this.configService.get<string>('OSS_BUCKET_NAME');
    this.basePath = this.configService.get<string>('OSS_BASE_PATH') || 'electricity-sys/';
    // 公共读 OSS 的公网域名（格式：https://{bucketName}.{endpoint}）
    this.publicDomain = `https://${this.bucketName}.${endpoint}`;

    //  校验配置
    if (!endpoint || !accessKeyId || !accessKeySecret || !this.bucketName) {
      throw new Error('阿里云 OSS 配置缺失，请检查 .env 文件');
    }

    // 初始化 OSS 客户端
    this.ossClient = new OSS({
      endpoint,
      accessKeyId,
      accessKeySecret,
      bucket: this.bucketName,
      secure: true, // 启用 HTTPS
    });
  }

  /**
   * 直接上传文件 Buffer 到 OSS
   * @param file 内存中的文件
   * @param folder 业务文件夹
   * @returns 公共读 URL + 文件信息（无需签名）
   */
  async uploadFile(
    file: Express.Multer.File,
    folder = 'app/',
  ): Promise<{
    filePath: string; // OSS 存储路径
    fileUrl: string; // 公共读 URL
    fileName: string; // 原始文件名
    fileSize: number; // 文件大小（字节）
    fileType: string; // 文件类型
  }> {
    try {
      //  生成唯一存储路径
      const originalName = file.originalname.replace(/\s+/g, '-'); // 替换空格
      const uniqueName = `${uuidv4()}-${originalName}`; // UUID 确保唯一
      const fullPath = `${this.basePath}${folder}${uniqueName}`; // 完整 OSS 路径

      // 直接上传文件 Buffer 到 OSS
      await this.ossClient.put(fullPath, file.buffer, {
        headers: {
          'Content-Type': file.mimetype, 
          'x-oss-object-acl': 'public-read', 
        },
      });

      //. 生成公共读 URL（
      const fileUrl = `${this.publicDomain}/${fullPath}`;
      return {
        filePath: fullPath,
        fileUrl,
        fileName: originalName,
        fileSize: file.size,
        fileType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(`文件上传失败：${error.message}`);
    }
  }

  /**
   * 公共读场景获取 URL
   * @param filePath OSS 存储路径
   */
  async getFileUrl(filePath: string): Promise<string> {
    try {
      // 校验文件是否存在（避免返回无效 URL）
      await this.ossClient.head(filePath);
      // 直接拼接公网 URL
      return `${this.publicDomain}/${filePath}`;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`文件不存在：${filePath}`);
      }
      throw new Error(`获取文件 URL 失败：${error.message}`);
    }
  }

  /**
   * 文件删除
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.ossClient.head(filePath);
      await this.ossClient.delete(filePath);
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        throw new NotFoundException(`文件不存在：${filePath}`);
      }
      throw new Error(`文件删除失败：${error.message}`);
    }
  }
}