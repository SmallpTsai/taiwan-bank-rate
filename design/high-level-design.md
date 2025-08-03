# 台灣銀行匯率查詢 Library - 高層級設計

## 專案概述

這是一個 Node.js TypeScript library，提供台灣銀行匯率查詢功能，讓開發者能夠輕鬆取得美元和其他幣別的即時和歷史匯率資料。

## 核心功能

1. **即時匯率查詢**
   - 取得單一或多個幣別的當日最新匯率
   - 回傳現金買入/賣出、即期買入/賣出四個關鍵數據
   - 遇到 429 Too Many Requests 錯誤時不重試，交由外部處理

2. **歷史匯率查詢**
   - 查詢特定幣別在指定時間範圍內的歷史匯率
   - 支援起始時間和結束時間參數
   - 遇到 429 Too Many Requests 錯誤時在內部重試

3. **錯誤處理**
   - 處理網路錯誤
   - 處理 API 回應格式錯誤
   - 針對不同 API 採用不同的重試策略

## 技術架構

### 核心模組

1. **RateClient** - 主要的客戶端類別
   - 負責與台灣銀行 API 的 HTTP 通訊
   - 處理 CSV 資料解析
   - 提供錯誤處理和重試機制

2. **RateParser** - CSV 解析器
   - 解析台灣銀行回傳的 CSV 格式
   - 轉換為結構化的 TypeScript 物件

3. **RateTypes** - 型別定義
   - 定義所有相關的 TypeScript 介面和型別
   - 確保型別安全

4. **RateUtils** - 工具函數
   - 日期格式化
   - 幣別代碼驗證
   - 其他輔助功能

### 資料流程

```
User Request → RateClient → HTTP Request → CSV Response → RateParser → Structured Data → User
```

## API 設計原則

1. **簡潔易用** - 提供直觀的 API 介面
2. **型別安全** - 完整的 TypeScript 支援
3. **錯誤處理** - 清晰的錯誤訊息和處理機制
4. **可配置** - 支援自訂設定（如重試次數、超時時間等）
5. **無侵入性** - 不預設任何日誌輸出，由使用者控制

## 使用範例

```typescript
import { RateClient } from '@your-org/taiwan-bank-rate';

const client = new RateClient();

// 取得單一幣別即時匯率
const usdRate = await client.getCurrentRates('USD');

// 取得多個幣別即時匯率
const rates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);

// 取得歷史匯率 (指定時間範圍)
const history = await client.getHistoricalRates('USD', '2025-01-01', '2025-01-31');
```

## 非功能性需求

1. **效能** - 支援快取機制避免重複請求
2. **可靠性** - 重試機制和錯誤恢復
3. **可維護性** - 清晰的程式碼結構和文件
4. **可測試性** - 完整的單元測試和整合測試 