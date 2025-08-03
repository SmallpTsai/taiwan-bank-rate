import { RateClientConfig, RateApiError } from '../types/rate';

export class HttpClient {
  private config: Required<RateClientConfig>;

  constructor(config: Required<RateClientConfig>) {
    this.config = config;
  }

  /**
   * 取得即時匯率資料
   * @returns CSV 格式的匯率資料
   */
  async fetchCurrentRates(): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/day`;
    return this.makeRequest(url, false); // 即時匯率不重試
  }

  /**
   * 取得歷史匯率資料
   * @param currency 幣別代碼
   * @param yearMonth 年月格式 (YYYY-MM)
   * @returns CSV 格式的歷史匯率資料
   */
  async fetchHistoricalRates(currency: string, yearMonth: string): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/${yearMonth}/${currency}`;
    return this.makeRequest(url, true); // 歷史匯率重試
  }

  /**
   * 執行 HTTP 請求
   * @param url 請求 URL
   * @param shouldRetry 是否重試
   * @returns 回應內容
   */
  private async makeRequest(url: string, shouldRetry: boolean): Promise<string> {
    let lastError: Error | null = null;
    const maxAttempts = shouldRetry ? this.config.retryAttempts : 1;

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'text/csv',
          },
          signal: AbortSignal.timeout(this.config.timeout),
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

  /**
   * 延遲執行
   * @param ms 延遲毫秒數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 