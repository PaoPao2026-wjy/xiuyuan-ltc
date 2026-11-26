// src/common/utils/safe-json.util.ts
/**
 * 安全解析JSON，兼容非JSON格式的字符串
 * @param value 待解析的值（可能是字符串、JSON或其他类型）
 * @param fallback 解析失败时的默认返回值
 */
export function safeJsonParse(value: any, fallback: any = null): any {
  if (!value) return fallback;

  // 如果已经是对象/数组，直接返回
  if (typeof value === 'object') return value;

  try {
    // 尝试标准JSON解析
    return JSON.parse(value);
  } catch (e) {
    // 解析失败：尝试处理逗号分隔的字符串（如"a,b,c" → ["a","b","c"]）
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.includes(',')) {
        return trimmed.split(',').map(item => item.trim());
      }
      // 单个值直接返回数组
      return [trimmed];
    }
    // 其他情况返回原始值
    return value;
  }
}