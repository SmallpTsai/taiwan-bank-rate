# 台灣銀行匯率查詢 Library - 低層級設計

## 專案結構

```
src/
├── types/
│   ├── index.ts          # 主要型別定義
│   └── rate.ts           # 匯率相關型別
├── client/
│   ├── index.ts          # RateClient 主要類別
│   └── http-client.ts    # HTTP 通訊層
├── parser/
│   ├── index.ts          # RateParser 主要類別
│   └── csv-parser.ts     # CSV 解析邏輯
├── utils/
│   ├── index.ts          # 工具函數匯出
│   ├── date-utils.ts     # 日期處理工具
│   └── currency-utils.ts # 幣別處理工具
└── index.ts              # 主要匯出點
```

## 型別定義 (types/rate.ts)

```typescript
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
```

## RateClient 類別設計 (client/index.ts)

```typescript
export class RateClient {
  private config: Required<RateClientConfig>;
  private httpClient: HttpClient;

  constructor(config: RateClientConfig = {}) {
    this.config = this.mergeDefaultConfig(config);
    this.httpClient = new HttpClient(this.config);
  }

  /**
   * 取得即時匯率
   * @param currencies 單一幣別代碼或幣別代碼陣列，不傳入則取得所有幣別
   * @returns Promise<RateData[]> 或 Promise<RateData | null> (單一幣別時)
   */
  async getCurrentRates(currency?: string | string[]): Promise<RateData[] | RateData | null> {
    const csvData = await this.httpClient.fetchCurrentRates();
    const allRates = this.parser.parseCurrentRates(csvData);
    
    if (!currency) {
      return allRates;
    }
    
    if (typeof currency === 'string') {
      return allRates.find(rate => rate.currency === currency.toUpperCase()) || null;
    }
    
    return allRates.filter(rate => currency.includes(rate.currency));
  }

  /**
   * 取得歷史匯率
   * @param currency 幣別代碼
   * @param startDate 起始日期 (YYYY-MM-DD)
   * @param endDate 結束日期 (YYYY-MM-DD)
   * @returns Promise<HistoricalRateData[]>
   */
  async getHistoricalRates(
    currency: string, 
    startDate: string,
    endDate: string
  ): Promise<HistoricalRateData[]> {
    const dateRange = this.utils.generateDateRange(startDate, endDate);
    const allHistoricalRates: HistoricalRateData[] = [];
    
    for (const yearMonth of dateRange) {
      try {
        const csvData = await this.httpClient.fetchHistoricalRates(currency, yearMonth);
        const monthRates = this.parser.parseHistoricalRates(csvData);
        allHistoricalRates.push(...monthRates);
      } catch (error) {
        // 歷史匯率 API 遇到 429 錯誤時重試
        if (error instanceof RateApiError && error.statusCode === 429) {
          await this.retryWithBackoff(() => 
            this.httpClient.fetchHistoricalRates(currency, yearMonth)
          );
        } else {
          throw error;
        }
      }
    }
    
    return this.filterRatesByDateRange(allHistoricalRates, startDate, endDate);
  }

  private mergeDefaultConfig(config: RateClientConfig): Required<RateClientConfig> {
    return {
      baseUrl: 'https://rate.bot.com.tw',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      userAgent: 'taiwan-bank-rate-client/1.0.0',
      ...config
    };
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## RateParser 類別設計 (parser/index.ts)

```typescript
export class RateParser {
  /**
   * 解析即時匯率 CSV 資料
   * @param csvData CSV 字串
   * @returns RateData[]
   */
  parseCurrentRates(csvData: string): RateData[] {
    const lines = this.parseCSV(csvData);
    const rates: RateData[] = [];

    for (const line of lines) {
      if (line.length < 21) continue; // 跳過標題行或無效行 (即時匯率有21個欄位)
      
      const currency = line[0];
      if (!this.isValidCurrency(currency)) continue;

      const rateData = this.parseRateLine(line);
      if (rateData) {
        rates.push(rateData);
      }
    }

    return rates;
  }

  /**
   * 解析歷史匯率 CSV 資料
   * @param csvData CSV 字串
   * @returns HistoricalRateData[]
   */
  parseHistoricalRates(csvData: string): HistoricalRateData[] {
    const lines = this.parseCSV(csvData);
    const rates: HistoricalRateData[] = [];

    for (const line of lines) {
      if (line.length < 22) continue; // 歷史資料有22個欄位 (多一個日期欄位)
      
      const date = line[0];
      const currency = line[1];
      
      if (!this.isValidDate(date) || !this.isValidCurrency(currency)) continue;

      const rateData = this.parseHistoricalRateLine(line);
      if (rateData) {
        rates.push(rateData);
      }
    }

    return rates;
  }

  private parseRateLine(line: string[]): RateData | null {
    try {
      return {
        currency: line[0],
        cashBuy: parseFloat(line[2]),    // 現金買入
        cashSell: parseFloat(line[12]),  // 現金賣出
        spotBuy: parseFloat(line[3]),    // 即期買入
        spotSell: parseFloat(line[13]),  // 即期賣出
        timestamp: new Date()
      };
    } catch (error) {
      return null;
    }
  }

  private parseHistoricalRateLine(line: string[]): HistoricalRateData | null {
    try {
      // 歷史匯率格式：日期,幣別,匯率,現金,即期,遠期...,匯率,現金,即期,遠期...
      // 直接使用正確的索引，避免建立額外的陣列
      const rateData: RateData = {
        currency: line[1],           // 幣別
        cashBuy: parseFloat(line[3]), // 現金買入
        cashSell: parseFloat(line[13]), // 現金賣出
        spotBuy: parseFloat(line[4]), // 即期買入
        spotSell: parseFloat(line[14]), // 即期賣出
        timestamp: new Date()
      };

      return {
        ...rateData,
        date: line[0] // 日期
      };
    } catch (error) {
      return null;
    }
  }

  private parseCSV(csvData: string): string[][] {
    // CSV 解析邏輯
    return csvData
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').map(field => field.trim()));
  }

  private isValidCurrency(currency: string): boolean {
    return /^[A-Z]{3}$/.test(currency);
  }

  private isValidDate(date: string): boolean {
    return /^\d{8}$/.test(date);
  }
}
```

## HTTP 客戶端設計 (client/http-client.ts)

```typescript
export class HttpClient {
  constructor(private config: Required<RateClientConfig>) {}

  async fetchCurrentRates(): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/day`;
    return this.makeRequest(url, false); // 即時匯率不重試
  }

  async fetchHistoricalRates(currency: string, yearMonth: string): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/${yearMonth}/${currency}`;
    return this.makeRequest(url, true); // 歷史匯率重試
  }

  private async makeRequest(url: string, shouldRetry: boolean): Promise<string> {
    let lastError: Error | null = null;
    const maxAttempts = shouldRetry ? this.config.retryAttempts : 1;

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'text/csv'
          },
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          if (response.status === 429) {
            const error = new RateApiError('Too many requests', 429);
            if (!shouldRetry) {
              throw error; // 即時匯率不重試，直接拋出錯誤
            }
            throw error; // 歷史匯率會重試
          }
          throw new RateApiError(`HTTP ${response.status}`, response.status);
        }

        return await response.text();
      } catch (error) {
        lastError = error as Error;
        
        if (shouldRetry && attempt < maxAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 工具函數設計 (utils/)

### date-utils.ts
```typescript
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function validateYearMonth(yearMonth: string): boolean {
  return /^\d{4}-\d{2}$/.test(yearMonth);
}

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

export function validateDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function filterRatesByDateRange(
  rates: HistoricalRateData[], 
  startDate: string, 
  endDate: string
): HistoricalRateData[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return rates.filter(rate => {
    const rateDate = new Date(rate.date);
    return rateDate >= start && rateDate <= end;
  });
}
```

### currency-utils.ts
```typescript
export const SUPPORTED_CURRENCIES = [
  'USD', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'SEK', 'NZD',
  'THB', 'PHP', 'IDR', 'EUR', 'KRW', 'VND', 'MYR', 'CNY'
] as const;

export function isValidCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as any);
}

export function normalizeCurrency(currency: string): string {
  return currency.toUpperCase();
}
```

## 主要匯出點 (index.ts)

```typescript
export { RateClient } from './client';
export { RateParser } from './parser';
export * from './types';
export * from './utils';

// 預設匯出
export default RateClient;
```

## 錯誤處理策略

1. **網路錯誤**: 自動重試機制
2. **429 錯誤**: 指數退避重試
3. **解析錯誤**: 跳過無效資料，繼續處理
4. **型別錯誤**: 提供詳細的錯誤訊息

## 測試策略

1. **單元測試**: 每個模組獨立測試
2. **整合測試**: 模擬 HTTP 回應測試
3. **錯誤測試**: 測試各種錯誤情況
4. **效能測試**: 測試重試機制和超時處理 