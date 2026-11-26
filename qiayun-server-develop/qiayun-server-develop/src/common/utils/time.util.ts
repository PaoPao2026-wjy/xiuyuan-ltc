// src/common/utils/time.util.ts
import { format, toZonedTime } from 'date-fns-tz';

export function getCstTimeForPrisma() {
  const timeZone = 'Asia/Shanghai'; // 东八区
  const now = new Date();
  const nowInCST = toZonedTime(now, timeZone); // 获取当前东八区时间

  // 格式化为 "YYYY-MM-DD'T'HH:mm:ss.SSS'Z'"（Z 后缀标识 UTC，但时间值是东八区的）
  const cstTimeAsUtcStr = format(nowInCST, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone });
  
  console.log('传递给 Prisma 的时间（Z 后缀）：', cstTimeAsUtcStr);
  return cstTimeAsUtcStr;
}