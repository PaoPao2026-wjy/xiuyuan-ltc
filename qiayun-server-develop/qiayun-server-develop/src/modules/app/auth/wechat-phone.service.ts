// src/modules/app/auth/wechat-phone.service.ts（解密方法）
import { Injectable, BadRequestException } from '@nestjs/common';
import { WechatCryptoService } from './wechat-crypto.service';

/**
 * 解密参数（前端传递 session_key、encryptedData、iv）
 */
interface DecryptPhoneParams {
  sessionKey: string; // 前端存储的 session_key
  encryptedData: string;
  iv: string;
}

@Injectable()
export class WechatPhoneService {
  constructor(private cryptoService: WechatCryptoService) {}

  /**
   * 用前端传来的 session_key 解密手机号
   */
  async decryptPhone(params: DecryptPhoneParams) {
    const { sessionKey, encryptedData, iv } = params;

    // 1. 校验参数
    if (!sessionKey || !encryptedData || !iv) {
      throw new BadRequestException('sessionKey、encryptedData、iv 均为必填');
    }

    // 2. 解密（直接使用前端传来的 session_key）
    const decryptedData = this.cryptoService.decryptWechatData(
      encryptedData,
      iv,
      sessionKey,
    );

    // 3. 提取手机号
    const { phoneNumber } = decryptedData;
    if (!phoneNumber) {
      throw new BadRequestException('解密失败，未找到手机号（可能 session_key 无效）');
    }

    return { phoneNumber };
  }
}