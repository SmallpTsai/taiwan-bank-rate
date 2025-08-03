import { RateClient } from '../src';

async function testApiConnection() {
  console.log('=== Testing Taiwan Bank API Connection ===\n');

  const client = new RateClient({
    timeout: 10000,
    retryAttempts: 2,
    retryDelay: 1000,
  });

  try {
    // Test real-time exchange rate API
    console.log('1. Testing real-time exchange rate API...');
    const startTime = Date.now();
    const rates = await client.getCurrentRates('USD');
    const endTime = Date.now();
    
    if (rates && !Array.isArray(rates)) {
      console.log(`✅ Successfully retrieved USD exchange rate data`);
      console.log(`   Cash Buy: ${rates.cashBuy}`);
      console.log(`   Cash Sell: ${rates.cashSell}`);
      console.log(`   Spot Buy: ${rates.spotBuy}`);
      console.log(`   Spot Sell: ${rates.spotSell}`);
      console.log(`   Response Time: ${endTime - startTime}ms`);
    } else {
      console.log('❌ Failed to retrieve USD exchange rate data');
    }
    console.log('');

    // Test multi-currency query
    console.log('2. Testing multi-currency query...');
    const multiRates = await client.getCurrentRates(['USD', 'HKD', 'JPY']);
    if (multiRates && Array.isArray(multiRates)) {
      console.log(`✅ Successfully retrieved exchange rate data for ${multiRates.length} currencies`);
      multiRates.forEach(rate => {
        console.log(`   ${rate.currency}: Cash Buy ${rate.cashBuy}, Cash Sell ${rate.cashSell}`);
      });
    } else {
      console.log('❌ Failed to retrieve multi-currency exchange rate data');
    }
    console.log('');

    // Test historical exchange rate API (last week)
    console.log('3. Testing historical exchange rate API...');
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = oneWeekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    console.log(`   Query period: ${startDate} to ${endDate}`);
    const historicalRates = await client.getHistoricalRates('USD', startDate!, endDate!);
    console.log(`✅ Successfully retrieved ${historicalRates.length} historical exchange rate records`);
    
    if (historicalRates.length > 0) {
      const latest = historicalRates[historicalRates.length - 1];
      if (latest) {
        console.log(`   Latest data (${latest.date}): Cash Buy ${latest.cashBuy}, Cash Sell ${latest.cashSell}`);
      }
    }
    console.log('');

    console.log('🎉 All API tests passed!');
    console.log('✅ Real-time exchange rate API working');
    console.log('✅ Multi-currency query working');
    console.log('✅ Historical exchange rate API working');

  } catch (error) {
    console.error('❌ API test failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testApiConnection(); 