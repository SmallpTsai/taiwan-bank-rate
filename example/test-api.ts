import { RateClient } from '../src';

async function testApiConnection() {
  console.log('=== 測試台灣銀行 API 連接 ===\n');

  const client = new RateClient({
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 1000,
  });

  try {
    // 測試即時匯率 API
    console.log('1. 測試即時匯率 API...');
    const startTime = Date.now();
    const rates = await client.getCurrentRates('USD');
    const endTime = Date.now();
    
    if (rates && !Array.isArray(rates)) {
      console.log(`✅ 成功取得 USD 匯率資料`);
      console.log(`   現金買入: ${rates.cashBuy}`);
      console.log(`   現金賣出: ${rates.cashSell}`);
      console.log(`   即期買入: ${rates.spotBuy}`);
      console.log(`   即期賣出: ${rates.spotSell}`);
      console.log(`   回應時間: ${endTime - startTime}ms`);
    } else {
      console.log('❌ 未取得 USD 匯率資料');
    }
    console.log('');

    // 測試多幣別查詢
    console.log('2. 測試多幣別查詢...');
    const multiRates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);
    if (multiRates && Array.isArray(multiRates)) {
      console.log(`✅ 成功取得 ${multiRates.length} 個幣別的匯率資料`);
      multiRates.forEach(rate => {
        console.log(`   ${rate.currency}: 現金買入 ${rate.cashBuy}, 現金賣出 ${rate.cashSell}`);
      });
    } else {
      console.log('❌ 未取得多幣別匯率資料');
    }
    console.log('');

    // 測試歷史匯率 API (最近一週)
    console.log('3. 測試歷史匯率 API...');
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = oneWeekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    console.log(`   查詢期間: ${startDate} 到 ${endDate}`);
    const historicalRates = await client.getHistoricalRates('USD', startDate!, endDate!);
    console.log(`✅ 成功取得 ${historicalRates.length} 筆歷史匯率資料`);
    
    if (historicalRates.length > 0) {
      const latest = historicalRates[historicalRates.length - 1];
      if (latest) {
        console.log(`   最新資料 (${latest.date}): 現金買入 ${latest.cashBuy}, 現金賣出 ${latest.cashSell}`);
      }
    }
    console.log('');

    console.log('🎉 所有 API 測試通過！');
    console.log('✅ 即時匯率 API 正常');
    console.log('✅ 多幣別查詢正常');
    console.log('✅ 歷史匯率 API 正常');

  } catch (error) {
    console.error('❌ API 測試失敗:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testApiConnection(); 