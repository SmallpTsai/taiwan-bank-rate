import { RateData, HistoricalRateData } from '../types/rate';
import { formatDateFromYYYYMMDD } from '../utils/date-utils';
import { isValidCurrencyFormat } from '../utils/currency-utils';

export class CsvParser {
  /**
   * 解析即時匯率 CSV 資料
   * @param csvData CSV 字串
   * @returns 匯率資料陣列
   */
  parseCurrentRates(csvData: string): RateData[] {
    const lines = this.parseCSV(csvData);
    const rates: RateData[] = [];

    for (const line of lines) {
      if (line.length < 21) continue; // 跳過標題行或無效行 (即時匯率有21個欄位)
      
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
   * 解析歷史匯率 CSV 資料
   * @param csvData CSV 字串
   * @returns 歷史匯率資料陣列
   */
  parseHistoricalRates(csvData: string): HistoricalRateData[] {
    const lines = this.parseCSV(csvData);
    const rates: HistoricalRateData[] = [];

    for (const line of lines) {
      if (line.length < 22) continue; // 歷史資料有22個欄位 (多一個日期欄位)
      
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
   * 解析單一匯率資料行
   * @param line CSV 行資料
   * @returns 匯率資料或 null
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
        cashBuy: parseFloat(cashBuyStr),    // 現金買入
        cashSell: parseFloat(cashSellStr),  // 現金賣出
        spotBuy: parseFloat(spotBuyStr),    // 即期買入
        spotSell: parseFloat(spotSellStr),  // 即期賣出
        timestamp: new Date(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 解析歷史匯率資料行
   * @param line CSV 行資料
   * @returns 歷史匯率資料或 null
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
        cashBuy: parseFloat(cashBuyStr),    // 現金買入
        cashSell: parseFloat(cashSellStr),  // 現金賣出
        spotBuy: parseFloat(spotBuyStr),    // 即期買入
        spotSell: parseFloat(spotSellStr),  // 即期賣出
        timestamp: new Date(),
        date: formatDateFromYYYYMMDD(date), // 日期
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 解析 CSV 字串為二維陣列
   * @param csvData CSV 字串
   * @returns 二維陣列
   */
  private parseCSV(csvData: string): string[][] {
    return csvData
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').map(field => field.trim()));
  }

  /**
   * 驗證幣別格式
   * @param currency 幣別代碼
   * @returns 是否為有效幣別
   */
  private isValidCurrency(currency: string): boolean {
    return isValidCurrencyFormat(currency);
  }

  /**
   * 驗證日期格式 (YYYYMMDD)
   * @param date 日期字串
   * @returns 是否為有效日期格式
   */
  private isValidDate(date: string): boolean {
    return /^\d{8}$/.test(date);
  }
} 