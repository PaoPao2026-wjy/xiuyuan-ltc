/**
 * 生成唯一工单编号
 * 格式：WO + 年月日时分秒毫秒 + 3位随机数 (例如：WO20251015230518123456)
 */
export function generateWorkOrderNo(): string {
  const prefix = 'WO';
  const date = new Date();
  
  // 格式化时间（精确到毫秒）
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  // 生成3位随机数（000-999）
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
}