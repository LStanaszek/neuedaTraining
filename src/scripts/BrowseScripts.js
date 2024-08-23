//BrowseScripts.js file
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');

async function getStockPriceData(ticker, interval, start, end) {
    try {
        //let data;
        const intradayIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '1d', '1mo', 'max'];
        const data = await yahooFinance.chart(ticker, {
            interval,
            period1: start,
            period2: end,
        });

        // if (intradayIntervals.includes(interval)) {
        //     // Use the 'chart' module if intraday intervals
        //     data = await yahooFinance.chart(ticker, {
        //         interval,
        //         period1: start,
        //         period2: end,
        //     });
        //     //return data;
        // } else {
        //     // Use the 'historical' module if interval larger than a day
        //     data = await yahooFinance.historical(ticker, {
        //         period1: start,
        //         period2: end,
        //         interval,
        //     });
        //     //return data;
        // }
        console.log(data)
        return data;
    } catch (error) {
        console.error('BrowseScript: Error fetching data:', error);
    }
};

async function getWatchlistWithPrices() {
    try {
        const watchlist = await Watchlist.findAll({
            include: [
                {
                    model: Stock,
                    required: true,
                },
            ],
        });

        // Loop through watchlist items to fetch current price and growth
        const watchlistWithPrices = await Promise.all(watchlist.map(async (item) => {
            const { ticker } = item.Stock;
            const stockData = await yahooFinance.quote(ticker);
            const currentPrice = stockData.regularMarketPrice;
            const previousClose = stockData.regularMarketPreviousClose;
            const growthToday = ((currentPrice - previousClose) / previousClose) * 100;

            return {
                id: item.watch_id,
                name: item.Stock.stock_name,
                ticker: item.Stock.ticker,
                current_price: currentPrice,
                growth_today: growthToday.toFixed(2),
            };
        }));

        return watchlistWithPrices;
    } catch (error) {
        console.error('BrowseScripts: Error fetching watchlist data:', error);
        throw error;
    }
}

module.exports = {
    getStockPriceData,
    getWatchlistWithPrices
};