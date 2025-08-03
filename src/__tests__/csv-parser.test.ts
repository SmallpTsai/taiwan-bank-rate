import { CsvParser } from '../parser/csv-parser';

describe('CsvParser', () => {
  let parser: CsvParser;

  beforeEach(() => {
    parser = new CsvParser();
  });

  describe('parseCurrentRates', () => {
    it('should parse current rates CSV correctly', () => {
      const csvData = `幣別,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天
USD,本行買入,29.61500,29.94000,29.94500,29.88500,29.80500,29.73500,29.66400,29.59000,29.52300,本行賣出,30.28500,30.09000,30.04900,29.99600,29.92600,29.86500,29.80400,29.74000,29.68300,
HKD,本行買入,3.66800,3.78900,3.79300,3.79300,3.79200,3.79100,3.78700,3.78300,3.77900,本行賣出,3.87200,3.85900,3.85400,3.85700,3.85600,3.85600,3.85300,3.85000,3.84700,`;

      const result = parser.parseCurrentRates(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        currency: 'USD',
        cashBuy: 29.61500,
        cashSell: 30.28500,
        spotBuy: 29.94000,
        spotSell: 30.09000,
        timestamp: expect.any(Date),
      });
      expect(result[1]).toEqual({
        currency: 'HKD',
        cashBuy: 3.66800,
        cashSell: 3.87200,
        spotBuy: 3.78900,
        spotSell: 3.85900,
        timestamp: expect.any(Date),
      });
    });

    it('should skip invalid lines', () => {
      const csvData = `幣別,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天
USD,本行買入,29.61500,29.94000,29.94500,29.88500,29.80500,29.73500,29.66400,29.59000,29.52300,本行賣出,30.28500,30.09000,30.04900,29.99600,29.92600,29.86500,29.80400,29.74000,29.68300,
INVALID,data,here
HKD,本行買入,3.66800,3.78900,3.79300,3.79300,3.79200,3.79100,3.78700,3.78300,3.77900,本行賣出,3.87200,3.85900,3.85400,3.85700,3.85600,3.85600,3.85300,3.85000,3.84700,`;

      const result = parser.parseCurrentRates(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]?.currency).toBe('USD');
      expect(result[1]?.currency).toBe('HKD');
    });
  });

  describe('parseHistoricalRates', () => {
    it('should parse historical rates CSV correctly', () => {
      const csvData = `資料日期,幣別,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天
20250731,USD,本行買入,29.47000,29.82000,29.80000,29.74000,29.65800,29.58800,29.51900,29.44400,29.37600,本行賣出,30.14000,29.92000,29.90500,29.85000,29.77800,29.71800,29.65900,29.59400,29.53400,
20250730,USD,本行買入,29.30500,29.65500,29.63600,29.57100,29.50200,29.42200,29.35700,29.28200,29.21500,本行賣出,29.97500,29.75500,29.74000,29.68300,29.62200,29.55100,29.49700,29.43200,29.37300,`;

      const result = parser.parseHistoricalRates(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        currency: 'USD',
        cashBuy: 29.47000,
        cashSell: 30.14000,
        spotBuy: 29.82000,
        spotSell: 29.92000,
        timestamp: expect.any(Date),
        date: '2025-07-31',
      });
      expect(result[1]).toEqual({
        currency: 'USD',
        cashBuy: 29.30500,
        cashSell: 29.97500,
        spotBuy: 29.65500,
        spotSell: 29.75500,
        timestamp: expect.any(Date),
        date: '2025-07-30',
      });
    });

    it('should skip invalid historical data lines', () => {
      const csvData = `資料日期,幣別,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天,匯率,現金,即期,遠期10天,遠期30天,遠期60天,遠期90天,遠期120天,遠期150天,遠期180天
20250731,USD,本行買入,29.47000,29.82000,29.80000,29.74000,29.65800,29.58800,29.51900,29.44400,29.37600,本行賣出,30.14000,29.92000,29.90500,29.85000,29.77800,29.71800,29.65900,29.59400,29.53400,
INVALID,data,here
20250730,USD,本行買入,29.30500,29.65500,29.63600,29.57100,29.50200,29.42200,29.35700,29.28200,29.21500,本行賣出,29.97500,29.75500,29.74000,29.68300,29.62200,29.55100,29.49700,29.43200,29.37300,`;

      const result = parser.parseHistoricalRates(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]?.date).toBe('2025-07-31');
      expect(result[1]?.date).toBe('2025-07-30');
    });
  });
}); 