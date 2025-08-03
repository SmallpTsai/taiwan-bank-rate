import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../types/rate';

/**
 * Check if currency is supported
 * @param currency Currency code
 * @returns Whether the currency is supported
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as SupportedCurrency);
}

/**
 * Normalize currency code (convert to uppercase)
 * @param currency Currency code
 * @returns Normalized currency code
 */
export function normalizeCurrency(currency: string): string {
  return currency.toUpperCase();
}

/**
 * Get all supported currencies list
 * @returns Array of supported currencies
 */
export function getSupportedCurrencies(): readonly SupportedCurrency[] {
  return SUPPORTED_CURRENCIES;
}

/**
 * Validate currency code format (3 uppercase letters)
 * @param currency Currency code
 * @returns Whether it's a valid format
 */
export function isValidCurrencyFormat(currency: string): boolean {
  return /^[A-Z]{3}$/.test(currency);
} 