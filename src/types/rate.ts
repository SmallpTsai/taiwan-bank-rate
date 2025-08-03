// 匯率類型
export type RateType = 'cash' | 'spot';

// 交易方向
export type TradeDirection = 'buy' | 'sell';

// 單一匯率資料
export interface RateData {
  currency: string;           // 幣別代碼 (USD, HKD, etc.)
  cashBuy: number;           // 現金買入
  cashSell: number;          // 現金賣出
  spotBuy: number;           // 即期買入
  spotSell: number;          // 即期賣出
  timestamp: Date;           // 匯率時間戳
}

// 歷史匯率資料
export interface HistoricalRateData extends RateData {
  date: string;              // 日期 (YYYY-MM-DD)
}

// 客戶端配置
export interface RateClientConfig {
  baseUrl?: string;          // API 基礎 URL
  timeout?: number;          // 請求超時時間 (ms)
  retryAttempts?: number;    // 歷史匯率重試次數
  retryDelay?: number;       // 重試延遲 (ms)
  userAgent?: string;        // 自訂 User-Agent
}

// API 錯誤類型
export class RateApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: string
  ) {
    super(message);
    this.name = 'RateApiError';
  }
}

// 支援的幣別
export const SUPPORTED_CURRENCIES = [
  'USD', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'SEK', 'NZD',
  'THB', 'PHP', 'IDR', 'EUR', 'KRW', 'VND', 'MYR', 'CNY'
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]; 