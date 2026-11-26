import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WechatCryptoService {
  decryptWechatData(encryptedData: string, iv: string, sessionKey: string) {
    try {
      //  转换数据为 Buffer（Base64 → Buffer）
      const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      // 验证 session_key 长度（AES-128 要求 16 字节）
      if (sessionKeyBuffer.length !== 16) {
        throw new Error('session_key 无效（长度必须为16字节）');
      }

      // 初始化 AES-128-CBC 解密器
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        sessionKeyBuffer,
        ivBuffer,
      );
      decipher.setAutoPadding(true); // 自动处理 PKCS#7 填充

      // 解密数据（返回 Buffer）
      // 不指定输出编码，让 update 和 final 返回 Buffer
      const decodedBuffer1 = decipher.update(encryptedDataBuffer);
      const decodedBuffer2 = decipher.final();
      // 拼接 Buffer 并转换为 utf8 字符串（此时类型明确为 string）
      const decodedStr = Buffer.concat([decodedBuffer1, decodedBuffer2]).toString('utf8');

      // 解析为 JSON 并返回
      return JSON.parse(decodedStr);
    } catch (error) {
      throw new BadRequestException(`解密失败：${error.message}（可能是session_key过期，请重新登录）`);
    }
  }
}