/**
 * 日期格式化工具函数
 * @param {Date|string|number} date 日期对象、时间戳或日期字符串
 * @param {string} format 格式化模式
 * @returns {string} 格式化后的日期字符串
 * 
 * 支持的格式化模式：
 * YYYY: 年份，如 2024
 * MM: 月份，如 01-12
 * DD: 日期，如 01-31
 * HH: 小时，如 00-23
 * mm: 分钟，如 00-59
 * ss: 秒数，如 00-59
 * 
 * 使用示例：
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // 2024-01-15 14:30:00
 * formatDate(new Date(), 'MM月DD日 HH:mm') // 01月15日 14:30
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  // 转换输入的日期为Date对象
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }

  // 如果转换失败，返回空字符串
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }

  const formatObj = {
    YYYY: date.getFullYear(),
    MM: padZero(date.getMonth() + 1),
    DD: padZero(date.getDate()),
    HH: padZero(date.getHours()),
    mm: padZero(date.getMinutes()),
    ss: padZero(date.getSeconds())
  };

  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, match => formatObj[match]);
}

/**
* 友好的时间显示
* @param {Date|string|number} date 日期对象、时间戳或日期字符串
* @returns {string} 相对时间字符串
* 
* 显示规则：
* - 1分钟内：刚刚
* - 1小时内：XX分钟前
* - 24小时内：XX小时前
* - 昨天：昨天 HH:mm
* - 前天：前天 HH:mm
* - 7天内：星期X HH:mm
* - 同年：MM-DD HH:mm
* - 其他：YYYY-MM-DD HH:mm
*/
export function friendlyDate(date) {
  if (!date) return '';

  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }

  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // 1分钟内
  if (diffMinutes < 1) {
    return '刚刚';
  }

  // 1小时内
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 24小时内
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // 昨天
  if (diffDays === 1) {
    return `昨天 ${formatDate(date, 'HH:mm')}`;
  }

  // 前天
  if (diffDays === 2) {
    return `前天 ${formatDate(date, 'HH:mm')}`;
  }

  // 7天内
  if (diffDays < 7) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `星期${weekdays[date.getDay()]} ${formatDate(date, 'HH:mm')}`;
  }

  // 同年
  if (date.getFullYear() === now.getFullYear()) {
    return formatDate(date, 'MM-DD HH:mm');
  }

  // 其他
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

/**
* 获取日期范围
* @param {string} type 范围类型：today/yesterday/week/month/year
* @returns {[Date, Date]} 开始和结束日期
*/
export function getDateRange(type) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week': {
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - day + 7);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return [start, end];
}

/**
* 判断是否为同一天
* @param {Date} date1 日期1
* @param {Date} date2 日期2
* @returns {boolean}
*/
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
* 数字补零
* @param {number} num 需要补零的数字
* @returns {string} 补零后的字符串
*/
function padZero(num) {
  return String(num).padStart(2, '0');
}

/**
* 获取指定月份的天数
* @param {number} year 年份
* @param {number} month 月份（1-12）
* @returns {number} 天数
*/
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
* 获取时间段显示
* @returns {string} 时间段文案
*/
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 17) return '下午好';
  if (hour < 19) return '傍晚好';
  if (hour < 22) return '晚上好';
  return '夜里好';
}

/**
* 计算两个日期之间的差值
* @param {Date} date1 日期1
* @param {Date} date2 日期2
* @param {string} unit 单位：years/months/days/hours/minutes/seconds
* @returns {number} 差值
*/
export function getDateDiff(date1, date2, unit = 'days') {
  const diff = date2.getTime() - date1.getTime();

  const units = {
    years: 1000 * 60 * 60 * 24 * 365,
    months: 1000 * 60 * 60 * 24 * 30,
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60,
    seconds: 1000
  };

  return Math.floor(diff / units[unit]);
}