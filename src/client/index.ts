import { RateClientConfig, RateData, HistoricalRateData, RateApiError } from '../types/rate';
import { HttpClient } from './http-client';
import { CsvParser } from '../parser';
import { generateDateRange, filterRatesByDateRange, validateDateFormat } from '../utils/date-utils';
import { normalizeCurrency } from '../utils/currency-utils';

export class RateClient {
  private config: Required<RateClientConfig>;
  private httpClient: HttpClient;
  private parser: CsvParser;

  constructor(config: RateClientConfig = {}) {
    this.config = this.mergeDefaultConfig(config);
    this.httpClient = new HttpClient(this.config);
    this.parser = new CsvParser();
  }

  /**
   * 取得即時匯率
   * @param currency 單一幣別代碼或幣別代碼陣列，不傳入則取得所有幣別
   * @returns Promise<RateData[]> 或 Promise<RateData | null> (單一幣別時)
   */
  async getCurrentRates(currency?: string | string[]): Promise<RateData[] | RateData | null> {
    const csvData = await this.httpClient.fetchCurrentRates();
    const allRates = this.parser.parseCurrentRates(csvData);
    
    if (!currency) {
      return allRates;
    }
    
    if (typeof currency === 'string') {
      const normalizedCurrency = normalizeCurrency(currency);
      return allRates.find(rate => rate.currency === normalizedCurrency) || null;
    }
    
    const normalizedCurrencies = currency.map(normalizeCurrency);
    return allRates.filter(rate => normalizedCurrencies.includes(rate.currency));
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
    // 驗證日期格式
    if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const normalizedCurrency = normalizeCurrency(currency);
    const dateRange = generateDateRange(startDate, endDate);
    const allHistoricalRates: HistoricalRateData[] = [];
    
    for (const yearMonth of dateRange) {
      try {
        const csvData = await this.httpClient.fetchHistoricalRates(normalizedCurrency, yearMonth);
        const monthRates = this.parser.parseHistoricalRates(csvData);
        allHistoricalRates.push(...monthRates);
      } catch (error) {
        // 歷史匯率 API 遇到 429 錯誤時重試
        if (error instanceof RateApiError && error.statusCode === 429) {
          const retryData = await this.retryWithBackoff(() => 
            this.httpClient.fetchHistoricalRates(normalizedCurrency, yearMonth)
          );
          const monthRates = this.parser.parseHistoricalRates(retryData);
          allHistoricalRates.push(...monthRates);
        } else {
          throw error;
        }
      }
    }
    
    return this.filterRatesByDateRange(allHistoricalRates, startDate, endDate);
  }

  /**
   * 合併預設配置
   * @param config 使用者配置
   * @returns 完整的配置
   */
  private mergeDefaultConfig(config: RateClientConfig): Required<RateClientConfig> {
    return {
      baseUrl: 'https://rate.bot.com.tw',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      userAgent: 'taiwan-bank-rate-client/1.0.0',
      ...config,
    };
  }

  /**
   * 指數退避重試機制
   * @param operation 要重試的操作
   * @returns 操作結果
   */
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

  /**
   * 延遲執行
   * @param ms 延遲毫秒數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 過濾指定日期範圍內的歷史匯率資料
   * @param rates 歷史匯率資料陣列
   * @param startDate 起始日期
   * @param endDate 結束日期
   * @returns 過濾後的歷史匯率資料
   */
  private filterRatesByDateRange(
    rates: HistoricalRateData[], 
    startDate: string, 
    endDate: string
  ): HistoricalRateData[] {
    return filterRatesByDateRange(rates, startDate, endDate) as HistoricalRateData[];
  }
} 