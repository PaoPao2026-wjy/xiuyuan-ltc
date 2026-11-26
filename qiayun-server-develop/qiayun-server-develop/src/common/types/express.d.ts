// src/types/express.d.ts
import { Multer } from 'multer';

// 扩展 Express 的 Request 接口，添加 Multer 相关的 file/files 属性
declare global {
  namespace Express {
    interface Request {
      // 单文件上传时的属性
      file: Multer.File;
      // 多文件上传时的属性（可选，根据需求添加）
      files: Multer.File[];
    }
  }
}