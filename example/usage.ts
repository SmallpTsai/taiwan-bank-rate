import { RateClient, RateApiError } from '../src';

async function main() {
  console.log('=== Taiwan Bank Exchange Rate Library Usage Example ===\n');

  // Create client instance
  const client = new RateClient({
    timeout: 15000, // Increase timeout to ensure enough time to retrieve data
    retryAttempts: 3,
    retryDelay: 2000,
  });

  try {
    // 1. Get real-time exchange rates for all currencies
    console.log('1. Getting real-time exchange rates for all currencies...');
    const allRates = await client.getCurrentRates();
    if (allRates && Array.isArray(allRates)) {
      console.log(`Successfully retrieved exchange rate data for ${allRates.length} currencies`);
      
      // Display first 5 currencies
      allRates.slice(0, 5).forEach(rate => {
        console.log(`  ${rate.currency}: Cash Buy ${rate.cashBuy}, Cash Sell ${rate.cashSell}, Spot Buy ${rate.spotBuy}, Spot Sell ${rate.spotSell}`);
      });
    } else {
      console.log('No exchange rate data retrieved');
    }
    console.log('');

    // 2. Get real-time exchange rate for single currency (USD)
    console.log('2. Getting USD real-time exchange rate...');
    const usdRate = await client.getCurrentRates('USD');
    if (usdRate && !Array.isArray(usdRate)) {
      console.log(`  USD Rate: Cash Buy ${usdRate.cashBuy}, Cash Sell ${usdRate.cashSell}, Spot Buy ${usdRate.spotBuy}, Spot Sell ${usdRate.spotSell}`);
    } else {
      console.log('  USD exchange rate data not found');
    }
    console.log('');

    // 3. Get real-time exchange rates for multiple currencies
    console.log('3. Getting real-time exchange rates for multiple currencies...');
    const multiRates = await client.getCurrentRates(['USD', 'HKD', 'JPY', 'EUR']);
    if (multiRates && Array.isArray(multiRates)) {
      console.log(`Successfully retrieved exchange rate data for ${multiRates.length} currencies`);
      multiRates.forEach(rate => {
        console.log(`  ${rate.currency}: Cash Buy ${rate.cashBuy}, Cash Sell ${rate.cashSell}, Spot Buy ${rate.spotBuy}, Spot Sell ${rate.spotSell}`);
      });
    } else {
      console.log('No multi-currency exchange rate data retrieved');
    }
    console.log('');

    // 4. Get historical exchange rates (USD rates for the last month)
    console.log('4. Getting USD historical exchange rates (last month)...');
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const startDate = oneMonthAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`  Query period: ${startDate} to ${endDate}`);
    
    const historicalRates = await client.getHistoricalRates('USD', startDate!, endDate!);
    console.log(`Successfully retrieved ${historicalRates.length} historical exchange rate records`);
    
    // Display first 5 historical records
    historicalRates.slice(0, 5).forEach(rate => {
      console.log(`  ${rate.date}: Cash Buy ${rate.cashBuy}, Cash Sell ${rate.cashSell}, Spot Buy ${rate.spotBuy}, Spot Sell ${rate.spotSell}`);
    });
    
    if (historicalRates.length > 5) {
      console.log(`  ... and ${historicalRates.length - 5} more records`);
    }
    console.log('');

    // 5. Error handling example
    console.log('5. Error handling example...');
    try {
      // Try to get non-existent currency
      await client.getCurrentRates('INVALID');
      console.log('  This line will not execute');
    } catch (error) {
      if (error instanceof RateApiError) {
        console.log(`  API Error: ${error.message} (Status Code: ${error.statusCode})`);
      } else {
        console.log(`  Other Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    console.log('');

    // 6. Performance statistics
    console.log('6. Performance statistics...');
    const startTime = Date.now();
    
    // Get exchange rates for multiple currencies in parallel
    const currencies = ['USD', 'HKD', 'JPY', 'EUR', 'GBP'];
    const promises = currencies.map(async (currency) => {
      const rate = await client.getCurrentRates(currency);
      return { currency, rate };
    });
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`  Retrieved ${currencies.length} currency exchange rates in parallel, took ${endTime - startTime}ms`);
    results.forEach(({ currency, rate }) => {
      if (rate && !Array.isArray(rate)) {
        console.log(`    ${currency}: Cash Buy ${rate.cashBuy}, Cash Sell ${rate.cashSell}`);
      }
    });

  } catch (error) {
    console.error('Error occurred while running example:');
    if (error instanceof RateApiError) {
      console.error(`  API Error: ${error.message}`);
      console.error(`  Status Code: ${error.statusCode}`);
      if (error.response) {
        console.error(`  Response: ${error.response.substring(0, 200)}...`);
      }
    } else {
      console.error(`  Other Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exit(1);
  }
}

// Run example
main().catch(error => {
  console.error('Example execution failed:', error);
  process.exit(1);
}); 