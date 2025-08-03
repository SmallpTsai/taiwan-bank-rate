// Exchange rate types
export type RateType = 'cash' | 'spot';

// Trade direction
export type TradeDirection = 'buy' | 'sell';

// Single exchange rate data
export interface RateData {
  currency: string;           // Currency code (USD, HKD, etc.)
  cashBuy: number;           // Cash buy rate
  cashSell: number;          // Cash sell rate
  spotBuy: number;           // Spot buy rate
  spotSell: number;          // Spot sell rate
  timestamp: Date;           // Exchange rate timestamp
}

// Historical exchange rate data
export interface HistoricalRateData extends RateData {
  date: string;              // Date (YYYY-MM-DD)
}

// Client configuration
export interface RateClientConfig {
  baseUrl?: string;          // API base URL
  timeout?: number;          // Request timeout (ms)
  retryAttempts?: number;    // Historical rate retry attempts
  retryDelay?: number;       // Retry delay (ms)
  userAgent?: string;        // Custom User-Agent
}

// API error type
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

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  'USD', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'SEK', 'NZD',
  'THB', 'PHP', 'IDR', 'EUR', 'KRW', 'VND', 'MYR', 'CNY'
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]; 