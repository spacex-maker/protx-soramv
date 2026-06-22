/**
 * 解析后端 LocalDateTime（可能是 ISO 字符串、数组或对象）
 */
export const parseApiDateTime = (value) => {
  if (value == null || value === '') return null;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith('0000')) return null;
    const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'object') {
    const year = value.year ?? value.yearValue;
    const month = value.monthValue ?? value.month;
    const day = value.dayOfMonth ?? value.day;
    if (year != null && month != null && day != null) {
      const date = new Date(
        year,
        month - 1,
        day,
        value.hour ?? 0,
        value.minute ?? 0,
        value.second ?? 0
      );
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
};

export const formatDateTime = (value, locale) => {
  const date = parseApiDateTime(value);
  if (!date) return '-';
  return locale ? date.toLocaleString(locale) : date.toLocaleString();
};

/** 依次尝试多个字段，返回第一个可格式化的结果 */
export const formatFirstAvailableDateTime = (...values) => {
  for (const value of values) {
    const formatted = formatDateTime(value);
    if (formatted !== '-') return formatted;
  }
  return null;
};
