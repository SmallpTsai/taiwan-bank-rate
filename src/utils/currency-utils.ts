import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../types/rate';

/**
 * 檢查幣別是否為支援的幣別
 * @param currency 幣別代碼
 * @returns 是否為支援的幣別
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as SupportedCurrency);
}

/**
 * 標準化幣別代碼（轉為大寫）
 * @param currency 幣別代碼
 * @returns 標準化的幣別代碼
 */
export function normalizeCurrency(currency: string): string {
  return currency.toUpperCase();
}

/**
 * 取得所有支援的幣別列表
 * @returns 支援的幣別陣列
 */
export function getSupportedCurrencies(): readonly SupportedCurrency[] {
  return SUPPORTED_CURRENCIES;
}

/**
 * 驗證幣別代碼格式（3個大寫字母）
 * @param currency 幣別代碼
 * @returns 是否為有效格式
 */
export function isValidCurrencyFormat(currency: string): boolean {
  return /^[A-Z]{3}$/.test(currency);
} 