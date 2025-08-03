import { RateData, HistoricalRateData } from '../types/rate';
import { formatDateFromYYYYMMDD } from '../utils/date-utils';
import { isValidCurrencyFormat } from '../utils/currency-utils';

export class CsvParser {
  /**
   * Parse real-time exchange rate CSV data
   * @param csvData CSV string
   * @returns Exchange rate data array
   */
  parseCurrentRates(csvData: string): RateData[] {
    const lines = this.parseCSV(csvData);
    const rates: RateData[] = [];

    for (const line of lines) {
      if (line.length < 21) continue; // Skip header rows or invalid rows (real-time rates have 21 fields)
      
      const currency = line[0];
      if (!currency || !this.isValidCurrency(currency)) continue;

      const rateData = this.parseRateLine(line);
      if (rateData) {
        rates.push(rateData);
      }
    }

    return rates;
  }

  /**
   * Parse historical exchange rate CSV data
   * @param csvData CSV string
   * @returns Historical exchange rate data array
   */
  parseHistoricalRates(csvData: string): HistoricalRateData[] {
    const lines = this.parseCSV(csvData);
    const rates: HistoricalRateData[] = [];

    for (const line of lines) {
      if (line.length < 22) continue; // Historical data has 22 fields (one more date field)
      
      const date = line[0];
      const currency = line[1];
      
      if (!date || !currency || !this.isValidDate(date) || !this.isValidCurrency(currency)) continue;

      const rateData = this.parseHistoricalRateLine(line);
      if (rateData) {
        rates.push(rateData);
      }
    }

    return rates;
  }

  /**
   * Parse single exchange rate data row
   * @param line CSV row data
   * @returns Exchange rate data or null
   */
  private parseRateLine(line: string[]): RateData | null {
    try {
      const currency = line[0];
      const cashBuyStr = line[2];
      const cashSellStr = line[12];
      const spotBuyStr = line[3];
      const spotSellStr = line[13];

      if (!currency || !cashBuyStr || !cashSellStr || !spotBuyStr || !spotSellStr) {
        return null;
      }

      return {
        currency,
        cashBuy: parseFloat(cashBuyStr),    // Cash buy rate
        cashSell: parseFloat(cashSellStr),  // Cash sell rate
        spotBuy: parseFloat(spotBuyStr),    // Spot buy rate
        spotSell: parseFloat(spotSellStr),  // Spot sell rate
        timestamp: new Date(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse historical exchange rate data row
   * @param line CSV row data
   * @returns Historical exchange rate data or null
   */
  private parseHistoricalRateLine(line: string[]): HistoricalRateData | null {
    try {
      const date = line[0];
      const currency = line[1];
      const cashBuyStr = line[3];
      const cashSellStr = line[13];
      const spotBuyStr = line[4];
      const spotSellStr = line[14];

      if (!date || !currency || !cashBuyStr || !cashSellStr || !spotBuyStr || !spotSellStr) {
        return null;
      }

      return {
        currency,
        cashBuy: parseFloat(cashBuyStr),    // Cash buy rate
        cashSell: parseFloat(cashSellStr),  // Cash sell rate
        spotBuy: parseFloat(spotBuyStr),    // Spot buy rate
        spotSell: parseFloat(spotSellStr),  // Spot sell rate
        timestamp: new Date(),
        date: formatDateFromYYYYMMDD(date), // Date
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse CSV string to 2D array
   * @param csvData CSV string
   * @returns 2D array
   */
  private parseCSV(csvData: string): string[][] {
    return csvData
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').map(field => field.trim()));
  }

  /**
   * Validate currency format
   * @param currency Currency code
   * @returns Whether it's a valid currency
   */
  private isValidCurrency(currency: string): boolean {
    return isValidCurrencyFormat(currency);
  }

  /**
   * Validate date format (YYYYMMDD)
   * @param date Date string
   * @returns Whether it's a valid date format
   */
  private isValidDate(date: string): boolean {
    return /^\d{8}$/.test(date);
  }
} 