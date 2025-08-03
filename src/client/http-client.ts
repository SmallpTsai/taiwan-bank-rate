import { RateClientConfig, RateApiError } from '../types/rate';

export class HttpClient {
  private config: Required<RateClientConfig>;

  constructor(config: Required<RateClientConfig>) {
    this.config = config;
  }

  /**
   * Get real-time exchange rate data
   * @returns CSV format exchange rate data
   */
  async fetchCurrentRates(): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/day`;
    return this.makeRequest(url, false); // Real-time rates don't retry
  }

  /**
   * Get historical exchange rate data
   * @param currency Currency code
   * @param yearMonth Year-month format (YYYY-MM)
   * @returns CSV format historical exchange rate data
   */
  async fetchHistoricalRates(currency: string, yearMonth: string): Promise<string> {
    const url = `${this.config.baseUrl}/xrt/flcsv/0/${yearMonth}/${currency}`;
    return this.makeRequest(url, true); // Historical rates retry
  }

  /**
   * Execute HTTP request
   * @param url Request URL
   * @param shouldRetry Whether to retry
   * @returns Response content
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
              throw error; // Real-time rates don't retry, throw error directly
            }
            throw error; // Historical rates will retry
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
   * Delay execution
   * @param ms Delay milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 