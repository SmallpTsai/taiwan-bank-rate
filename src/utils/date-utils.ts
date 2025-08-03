/**
 * 格式化日期為 YYYY-MM 格式
 * @param date 日期物件
 * @returns YYYY-MM 格式的字串
 */
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 驗證 YYYY-MM 格式的日期字串
 * @param yearMonth YYYY-MM 格式的字串
 * @returns 是否為有效格式
 */
export function validateYearMonth(yearMonth: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return false;
  }
  
  const parts = yearMonth.split('-');
  if (parts.length !== 2) {
    return false;
  }
  
  const month = parts[1] ?? '';
  const monthNum = parseInt(month, 10);
  return monthNum >= 1 && monthNum <= 12;
}

/**
 * 生成日期範圍內的月份列表
 * @param startDate 起始日期 (YYYY-MM-DD)
 * @param endDate 結束日期 (YYYY-MM-DD)
 * @returns YYYY-MM 格式的月份陣列
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const yearMonths: string[] = [];
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    yearMonths.push(formatYearMonth(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return yearMonths;
}

/**
 * 驗證 YYYY-MM-DD 格式的日期字串
 * @param date YYYY-MM-DD 格式的字串
 * @returns 是否為有效格式
 */
export function validateDateFormat(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  
  const parts = date.split('-');
  if (parts.length !== 3) {
    return false;
  }
  
  const month = parts[1] ?? '';
  const day = parts[2] ?? '';
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  
  return monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31;
}

/**
 * 將 YYYYMMDD 格式轉換為 YYYY-MM-DD 格式
 * @param dateStr YYYYMMDD 格式的字串
 * @returns YYYY-MM-DD 格式的字串
 */
export function formatDateFromYYYYMMDD(dateStr: string): string {
  if (!/^\d{8}$/.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYYMMDD');
  }
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${year}-${month}-${day}`;
}

/**
 * 過濾指定日期範圍內的歷史匯率資料
 * @param rates 歷史匯率資料陣列
 * @param startDate 起始日期 (YYYY-MM-DD)
 * @param endDate 結束日期 (YYYY-MM-DD)
 * @returns 過濾後的歷史匯率資料
 */
export function filterRatesByDateRange(
  rates: Array<{ date: string }>, 
  startDate: string, 
  endDate: string
): Array<{ date: string }> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return rates.filter(rate => {
    const rateDate = new Date(rate.date);
    return rateDate >= start && rateDate <= end;
  });
} 