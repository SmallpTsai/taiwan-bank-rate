# 台灣銀行匯率查詢 Library

一個 Node.js TypeScript library，提供台灣銀行匯率查詢功能，讓開發者能夠輕鬆取得美元和其他幣別的即時和歷史匯率資料。

## 功能特色

- ✅ **即時匯率查詢** - 取得單一或多個幣別的當日最新匯率
- ✅ **歷史匯率查詢** - 查詢特定幣別在指定時間範圍內的歷史匯率
- ✅ **型別安全** - 完整的 TypeScript 支援
- ✅ **錯誤處理** - 清晰的錯誤訊息和處理機制
- ✅ **重試機制** - 智慧的重試策略，針對不同 API 採用不同策略
- ✅ **無侵入性** - 不預設任何日誌輸出，由使用者控制

## 安裝

```bash
npm install taiwan-bank-rate
```

## 快速開始

### 基本使用

```typescript
import { RateClient } from 'taiwan-bank-rate';

const client = new RateClient();

// 取得所有幣別的即時匯率
const allRates = await client.getCurrentRates();

// 取得單一幣別即時匯率
const usdRate = await client.getCurrentRates('USD');

// 取得多個幣別即時匯率
const rates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);

// 取得歷史匯率 (指定時間範圍)
const history = await client.getHistoricalRates('USD', '2025-01-01', '2025-01-31');
```

### 配置選項

```typescript
import { RateClient } from 'taiwan-bank-rate';

const client = new RateClient({
  baseUrl: 'https://rate.bot.com.tw',     // API 基礎 URL
  timeout: 10000,                         // 請求超時時間 (ms)
  retryAttempts: 3,                       // 歷史匯率重試次數
  retryDelay: 1000,                       // 重試延遲 (ms)
  userAgent: 'my-app/1.0.0',             // 自訂 User-Agent
});
```

## API 參考

### RateClient

主要的客戶端類別，提供匯率查詢功能。

#### 建構函數

```typescript
new RateClient(config?: RateClientConfig)
```

#### 方法

##### getCurrentRates(currency?)

取得即時匯率資料。

**參數：**
- `currency?` (string | string[]) - 可選的幣別代碼或幣別代碼陣列

**回傳值：**
- 無參數：`Promise<RateData[]>` - 所有幣別的匯率資料
- 單一幣別：`Promise<RateData | null>` - 指定幣別的匯率資料
- 多個幣別：`Promise<RateData[]>` - 指定幣別的匯率資料陣列

**範例：**
```typescript
// 取得所有幣別
const allRates = await client.getCurrentRates();

// 取得單一幣別
const usdRate = await client.getCurrentRates('USD');

// 取得多個幣別
const rates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);
```

##### getHistoricalRates(currency, startDate, endDate)

取得歷史匯率資料。

**參數：**
- `currency` (string) - 幣別代碼
- `startDate` (string) - 起始日期 (YYYY-MM-DD 格式)
- `endDate` (string) - 結束日期 (YYYY-MM-DD 格式)

**回傳值：**
- `Promise<HistoricalRateData[]>` - 歷史匯率資料陣列

**範例：**
```typescript
const history = await client.getHistoricalRates('USD', '2025-01-01', '2025-01-31');
```

### 資料型別

#### RateData

即時匯率資料結構。

```typescript
interface RateData {
  currency: string;           // 幣別代碼 (USD, HKD, etc.)
  cashBuy: number;           // 現金買入
  cashSell: number;          // 現金賣出
  spotBuy: number;           // 即期買入
  spotSell: number;          // 即期賣出
  timestamp: Date;           // 匯率時間戳
}
```

#### HistoricalRateData

歷史匯率資料結構。

```typescript
interface HistoricalRateData extends RateData {
  date: string;              // 日期 (YYYY-MM-DD)
}
```

#### RateClientConfig

客戶端配置選項。

```typescript
interface RateClientConfig {
  baseUrl?: string;          // API 基礎 URL
  timeout?: number;          // 請求超時時間 (ms)
  retryAttempts?: number;    // 歷史匯率重試次數
  retryDelay?: number;       // 重試延遲 (ms)
  userAgent?: string;        // 自訂 User-Agent
}
```

## 支援的幣別

- USD (美元)
- HKD (港幣)
- GBP (英鎊)
- AUD (澳幣)
- CAD (加幣)
- SGD (新加坡幣)
- CHF (瑞士法郎)
- JPY (日圓)
- SEK (瑞典克朗)
- NZD (紐西蘭幣)
- THB (泰銖)
- PHP (菲律賓披索)
- IDR (印尼盾)
- EUR (歐元)
- KRW (韓元)
- VND (越南盾)
- MYR (馬來西亞幣)
- CNY (人民幣)

## 錯誤處理

### RateApiError

API 相關錯誤類別。

```typescript
class RateApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: string
  );
}
```

### 錯誤處理範例

```typescript
try {
  const rates = await client.getCurrentRates('USD');
  console.log(rates);
} catch (error) {
  if (error instanceof RateApiError) {
    if (error.statusCode === 429) {
      console.log('請求過於頻繁，請稍後再試');
    } else {
      console.log(`API 錯誤: ${error.message}`);
    }
  } else {
    console.log(`其他錯誤: ${error.message}`);
  }
}
```

## 重試策略

- **即時匯率 API**：遇到 429 錯誤時不重試，直接拋出錯誤
- **歷史匯率 API**：遇到 429 錯誤時使用指數退避重試機制

## 開發

### 安裝依賴

```bash
npm install
```

### 建置

```bash
npm run build
```

### 測試

```bash
npm test
```

### 程式碼檢查

```bash
npm run lint
npm run lint:fix
```

### 格式化

```bash
npm run format
```

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 更新日誌

### 1.0.0

- 初始版本
- 支援即時匯率查詢
- 支援歷史匯率查詢
- 完整的 TypeScript 支援
- 錯誤處理和重試機制 