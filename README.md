# Taiwan Bank Exchange Rate Library

A Node.js TypeScript library that provides Taiwan Bank exchange rate query functionality, allowing developers to easily obtain real-time and historical exchange rate data for USD and other currencies.

## ⚠️ Important Notice

**This library is NOT officially provided by Taiwan Bank.** It is a third-party library that accesses Taiwan Bank's public exchange rate data.

**⚠️ Rate Limiting Warning:** Making too frequent API calls may result in your IP being blocked by Taiwan Bank's servers. Users are responsible for their own usage and should implement appropriate rate limiting in their applications.

## [📖 繁體中文版本](README-tw.md)

## Features

- ✅ **Real-time Exchange Rate Queries** - Get the latest exchange rates for single or multiple currencies
- ✅ **Historical Exchange Rate Queries** - Query historical exchange rates for specific currencies within a specified time range
- ✅ **Type Safety** - Complete TypeScript support
- ✅ **Error Handling** - Clear error messages and handling mechanisms
- ✅ **Retry Mechanism** - Intelligent retry strategies for different APIs
- ✅ **Non-intrusive** - No default logging output, controlled by the user

## Installation

```bash
npm install taiwan-bank-rate
```

## Quick Start

### Basic Usage

```typescript
import { RateClient } from 'taiwan-bank-rate';

const client = new RateClient();

// Get real-time exchange rates for all currencies
const allRates = await client.getCurrentRates();

// Get real-time exchange rate for a single currency
const usdRate = await client.getCurrentRates('USD');

// Get real-time exchange rates for multiple currencies
const rates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);

// Get historical exchange rates (specified time range)
const history = await client.getHistoricalRates('USD', '2025-01-01', '2025-01-31');
```

### Configuration Options

```typescript
import { RateClient } from 'taiwan-bank-rate';

const client = new RateClient({
  baseUrl: 'https://rate.bot.com.tw',     // API base URL
  timeout: 10000,                         // Request timeout (ms)
  retryAttempts: 3,                       // Historical rate retry attempts
  retryDelay: 1000,                       // Retry delay (ms)
  userAgent: 'my-app/1.0.0',             // Custom User-Agent
});
```

## API Reference

### RateClient

The main client class that provides exchange rate query functionality.

#### Constructor

```typescript
new RateClient(config?: RateClientConfig)
```

#### Methods

##### getCurrentRates(currency?)

Get real-time exchange rate data.

**Parameters:**
- `currency?` (string | string[]) - Optional currency code or array of currency codes

**Returns:**
- No parameters: `Promise<RateData[]>` - Exchange rate data for all currencies
- Single currency: `Promise<RateData | null>` - Exchange rate data for the specified currency
- Multiple currencies: `Promise<RateData[]>` - Array of exchange rate data for specified currencies

**Examples:**
```typescript
// Get all currencies
const allRates = await client.getCurrentRates();

// Get single currency
const usdRate = await client.getCurrentRates('USD');

// Get multiple currencies
const rates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);
```

##### getHistoricalRates(currency, startDate, endDate)

Get historical exchange rate data.

**Parameters:**
- `currency` (string) - Currency code
- `startDate` (string) - Start date (YYYY-MM-DD format)
- `endDate` (string) - End date (YYYY-MM-DD format)

**Returns:**
- `Promise<HistoricalRateData[]>` - Array of historical exchange rate data

**Example:**
```typescript
const history = await client.getHistoricalRates('USD', '2025-01-01', '2025-01-31');
```

### Data Types

#### RateData

Real-time exchange rate data structure.

```typescript
interface RateData {
  currency: string;           // Currency code (USD, HKD, etc.)
  cashBuy: number;           // Cash buy rate
  cashSell: number;          // Cash sell rate
  spotBuy: number;           // Spot buy rate
  spotSell: number;          // Spot sell rate
  timestamp: Date;           // Exchange rate timestamp
}
```

#### HistoricalRateData

Historical exchange rate data structure.

```typescript
interface HistoricalRateData extends RateData {
  date: string;              // Date (YYYY-MM-DD)
}
```

#### RateClientConfig

Client configuration options.

```typescript
interface RateClientConfig {
  baseUrl?: string;          // API base URL
  timeout?: number;          // Request timeout (ms)
  retryAttempts?: number;    // Historical rate retry attempts
  retryDelay?: number;       // Retry delay (ms)
  userAgent?: string;        // Custom User-Agent
}
```

## Supported Currencies

- USD (US Dollar)
- HKD (Hong Kong Dollar)
- GBP (British Pound)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- SGD (Singapore Dollar)
- CHF (Swiss Franc)
- JPY (Japanese Yen)
- SEK (Swedish Krona)
- NZD (New Zealand Dollar)
- THB (Thai Baht)
- PHP (Philippine Peso)
- IDR (Indonesian Rupiah)
- EUR (Euro)
- KRW (Korean Won)
- VND (Vietnamese Dong)
- MYR (Malaysian Ringgit)
- CNY (Chinese Yuan)

## Error Handling

### RateApiError

API-related error class.

```typescript
class RateApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: string
  );
}
```

### Error Handling Example

```typescript
try {
  const rates = await client.getCurrentRates('USD');
  console.log(rates);
} catch (error) {
  if (error instanceof RateApiError) {
    if (error.statusCode === 429) {
      console.log('Too many requests, please try again later');
    } else {
      console.log(`API Error: ${error.message}`);
    }
  } else {
    console.log(`Other Error: ${error.message}`);
  }
}
```

## Retry Strategy

- **Real-time Rate API**: No retry on 429 errors, throws error directly
- **Historical Rate API**: Uses exponential backoff retry mechanism on 429 errors

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format
```

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

## Changelog

### 1.0.0

- Initial release
- Support for real-time exchange rate queries
- Support for historical exchange rate queries
- Complete TypeScript support
- Error handling and retry mechanisms 