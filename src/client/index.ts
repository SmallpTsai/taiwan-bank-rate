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
   * Get real-time exchange rates
   * @param currency Single currency code or array of currency codes, if not provided, get all currencies
   * @returns Promise<RateData[]> or Promise<RateData | null> (for single currency)
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
   * Get historical exchange rates
   * @param currency Currency code
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Promise<HistoricalRateData[]>
   */
  async getHistoricalRates(
    currency: string, 
    startDate: string,
    endDate: string
  ): Promise<HistoricalRateData[]> {
    // Validate date format
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
        // Historical rate API retries on 429 errors
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
   * Merge default configuration
   * @param config User configuration
   * @returns Complete configuration
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
   * Exponential backoff retry mechanism
   * @param operation Operation to retry
   * @returns Operation result
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
   * Delay execution
   * @param ms Delay milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Filter historical exchange rate data within specified date range
   * @param rates Historical exchange rate data array
   * @param startDate Start date
   * @param endDate End date
   * @returns Filtered historical exchange rate data
   */
  private filterRatesByDateRange(
    rates: HistoricalRateData[], 
    startDate: string, 
    endDate: string
  ): HistoricalRateData[] {
    return filterRatesByDateRange(rates, startDate, endDate) as HistoricalRateData[];
  }
} 