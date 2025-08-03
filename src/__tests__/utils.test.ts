import {
  formatYearMonth,
  validateYearMonth,
  generateDateRange,
  validateDateFormat,
  formatDateFromYYYYMMDD,
  filterRatesByDateRange,
} from '../utils/date-utils';
import {
  isValidCurrency,
  normalizeCurrency,
  getSupportedCurrencies,
  isValidCurrencyFormat,
} from '../utils/currency-utils';

describe('Date Utils', () => {
  describe('formatYearMonth', () => {
    it('should format date correctly', () => {
      const date = new Date(2025, 6, 15); // July 15, 2025
      expect(formatYearMonth(date)).toBe('2025-07');
    });

    it('should handle single digit months', () => {
      const date = new Date(2025, 0, 1); // January 1, 2025
      expect(formatYearMonth(date)).toBe('2025-01');
    });
  });

  describe('validateYearMonth', () => {
    it('should validate correct format', () => {
      expect(validateYearMonth('2025-07')).toBe(true);
      expect(validateYearMonth('2025-12')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateYearMonth('2025-7')).toBe(false);
      expect(validateYearMonth('2025-13')).toBe(false);
      expect(validateYearMonth('2025/07')).toBe(false);
    });
  });

  describe('generateDateRange', () => {
    it('should generate correct date range', () => {
      const result = generateDateRange('2025-01-01', '2025-03-31');
      expect(result).toEqual(['2025-01', '2025-02', '2025-03']);
    });

    it('should handle single month', () => {
      const result = generateDateRange('2025-01-01', '2025-01-31');
      expect(result).toEqual(['2025-01']);
    });
  });

  describe('validateDateFormat', () => {
    it('should validate correct format', () => {
      expect(validateDateFormat('2025-01-01')).toBe(true);
      expect(validateDateFormat('2025-12-31')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateDateFormat('2025-1-1')).toBe(false);
      expect(validateDateFormat('2025/01/01')).toBe(false);
      expect(validateDateFormat('2025-13-01')).toBe(false);
    });
  });

  describe('formatDateFromYYYYMMDD', () => {
    it('should format date correctly', () => {
      expect(formatDateFromYYYYMMDD('20250101')).toBe('2025-01-01');
      expect(formatDateFromYYYYMMDD('20251231')).toBe('2025-12-31');
    });

    it('should throw error for invalid format', () => {
      expect(() => formatDateFromYYYYMMDD('2025-01-01')).toThrow();
      expect(() => formatDateFromYYYYMMDD('2025011')).toThrow();
    });
  });

  describe('filterRatesByDateRange', () => {
    it('should filter rates correctly', () => {
      const rates = [
        { date: '2025-01-01' },
        { date: '2025-01-15' },
        { date: '2025-02-01' },
        { date: '2025-03-01' },
      ];

      const result = filterRatesByDateRange(rates, '2025-01-01', '2025-01-31');
      expect(result).toHaveLength(2);
      expect(result[0]?.date).toBe('2025-01-01');
      expect(result[1]?.date).toBe('2025-01-15');
    });
  });
});

describe('Currency Utils', () => {
  describe('isValidCurrency', () => {
    it('should validate supported currencies', () => {
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('HKD')).toBe(true);
      expect(isValidCurrency('JPY')).toBe(true);
    });

    it('should reject unsupported currencies', () => {
      expect(isValidCurrency('XYZ')).toBe(false);
      expect(isValidCurrency('BTC')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidCurrency('usd')).toBe(true);
      expect(isValidCurrency('Usd')).toBe(true);
    });
  });

  describe('normalizeCurrency', () => {
    it('should convert to uppercase', () => {
      expect(normalizeCurrency('usd')).toBe('USD');
      expect(normalizeCurrency('Usd')).toBe('USD');
      expect(normalizeCurrency('USD')).toBe('USD');
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toContain('USD');
      expect(currencies).toContain('HKD');
      expect(currencies).toContain('JPY');
    });
  });

  describe('isValidCurrencyFormat', () => {
    it('should validate 3-letter format', () => {
      expect(isValidCurrencyFormat('USD')).toBe(true);
      expect(isValidCurrencyFormat('HKD')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(isValidCurrencyFormat('US')).toBe(false);
      expect(isValidCurrencyFormat('USDD')).toBe(false);
      expect(isValidCurrencyFormat('usd')).toBe(false);
    });
  });
}); 