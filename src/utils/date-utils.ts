/**
 * Format date to YYYY-MM format
 * @param date Date object
 * @returns YYYY-MM format string
 */
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Validate YYYY-MM format date string
 * @param yearMonth YYYY-MM format string
 * @returns Whether it's a valid format
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
 * Generate month list within date range
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Array of YYYY-MM format months
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
 * Validate YYYY-MM-DD format date string
 * @param date YYYY-MM-DD format string
 * @returns Whether it's a valid format
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
 * Convert YYYYMMDD format to YYYY-MM-DD format
 * @param dateStr YYYYMMDD format string
 * @returns YYYY-MM-DD format string
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
 * Filter historical exchange rate data within specified date range
 * @param rates Historical exchange rate data array
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Filtered historical exchange rate data
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