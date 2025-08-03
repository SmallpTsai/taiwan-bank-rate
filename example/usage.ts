import { RateClient, RateApiError } from '../src';

async function main() {
  console.log('=== 台灣銀行匯率查詢 Library 使用範例 ===\n');

  // 建立客戶端實例
  const client = new RateClient({
    timeout: 15000, // 增加超時時間以確保有足夠時間取得資料
    retryAttempts: 3,
    retryDelay: 2000,
  });

  try {
    // 1. 取得所有幣別的即時匯率
    console.log('1. 取得所有幣別的即時匯率...');
    const allRates = await client.getCurrentRates();
    if (allRates && Array.isArray(allRates)) {
      console.log(`成功取得 ${allRates.length} 個幣別的匯率資料`);
      
      // 顯示前 5 個幣別的資料
      allRates.slice(0, 5).forEach(rate => {
        console.log(`  ${rate.currency}: 現金買入 ${rate.cashBuy}, 現金賣出 ${rate.cashSell}, 即期買入 ${rate.spotBuy}, 即期賣出 ${rate.spotSell}`);
      });
    } else {
      console.log('未取得匯率資料');
    }
    console.log('');

    // 2. 取得單一幣別 (USD) 的即時匯率
    console.log('2. 取得 USD 的即時匯率...');
    const usdRate = await client.getCurrentRates('USD');
    if (usdRate && !Array.isArray(usdRate)) {
      console.log(`  USD 匯率: 現金買入 ${usdRate.cashBuy}, 現金賣出 ${usdRate.cashSell}, 即期買入 ${usdRate.spotBuy}, 即期賣出 ${usdRate.spotSell}`);
    } else {
      console.log('  未找到 USD 匯率資料');
    }
    console.log('');

    // 3. 取得多個幣別的即時匯率
    console.log('3. 取得多個幣別的即時匯率...');
    const multiRates = await client.getCurrentRates(['USD', 'HKD', 'JPY', 'EUR']);
    if (multiRates && Array.isArray(multiRates)) {
      console.log(`成功取得 ${multiRates.length} 個幣別的匯率資料`);
      multiRates.forEach(rate => {
        console.log(`  ${rate.currency}: 現金買入 ${rate.cashBuy}, 現金賣出 ${rate.cashSell}, 即期買入 ${rate.spotBuy}, 即期賣出 ${rate.spotSell}`);
      });
    } else {
      console.log('未取得多幣別匯率資料');
    }
    console.log('');

    // 4. 取得歷史匯率 (最近一個月的 USD 匯率)
    console.log('4. 取得 USD 的歷史匯率 (最近一個月)...');
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const startDate = oneMonthAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`  查詢期間: ${startDate} 到 ${endDate}`);
    
    const historicalRates = await client.getHistoricalRates('USD', startDate!, endDate!);
    console.log(`成功取得 ${historicalRates.length} 筆歷史匯率資料`);
    
    // 顯示前 5 筆歷史資料
    historicalRates.slice(0, 5).forEach(rate => {
      console.log(`  ${rate.date}: 現金買入 ${rate.cashBuy}, 現金賣出 ${rate.cashSell}, 即期買入 ${rate.spotBuy}, 即期賣出 ${rate.spotSell}`);
    });
    
    if (historicalRates.length > 5) {
      console.log(`  ... 還有 ${historicalRates.length - 5} 筆資料`);
    }
    console.log('');

    // 5. 錯誤處理範例
    console.log('5. 錯誤處理範例...');
    try {
      // 嘗試取得不存在的幣別
      await client.getCurrentRates('INVALID');
      console.log('  這行不會執行');
    } catch (error) {
      if (error instanceof RateApiError) {
        console.log(`  API 錯誤: ${error.message} (狀態碼: ${error.statusCode})`);
      } else {
        console.log(`  其他錯誤: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    console.log('');

    // 6. 效能統計
    console.log('6. 效能統計...');
    const startTime = Date.now();
    
    // 並行取得多個幣別的匯率
    const currencies = ['USD', 'HKD', 'JPY', 'EUR', 'GBP'];
    const promises = currencies.map(async (currency) => {
      const rate = await client.getCurrentRates(currency);
      return { currency, rate };
    });
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`  並行取得 ${currencies.length} 個幣別匯率，耗時 ${endTime - startTime}ms`);
    results.forEach(({ currency, rate }) => {
      if (rate && !Array.isArray(rate)) {
        console.log(`    ${currency}: 現金買入 ${rate.cashBuy}, 現金賣出 ${rate.cashSell}`);
      }
    });

  } catch (error) {
    console.error('執行範例時發生錯誤:');
    if (error instanceof RateApiError) {
      console.error(`  API 錯誤: ${error.message}`);
      console.error(`  狀態碼: ${error.statusCode}`);
      if (error.response) {
        console.error(`  回應內容: ${error.response.substring(0, 200)}...`);
      }
    } else {
      console.error(`  其他錯誤: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exit(1);
  }
}

// 執行範例
main().catch(error => {
  console.error('範例執行失敗:', error);
  process.exit(1);
}); 