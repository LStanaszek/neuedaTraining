//BrowseScripts.js file
const axios = require('axios');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

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
        console.log(data.quotes)
        return data;
    } catch (error) {
        console.error('BrowseScript: Error fetching data:', error);
    }
};

async function getWatchlist() {
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
};

async function deleteStockFromWatchlist(watchID){
    try {
        await Watchlist.destroy({
            where: {
                watch_id: watchID,
            },
        });
        return;
    } catch (error) {
        console.error(`BrowseScripts: Error deleting watchID: ${watchID}`, error);
        throw error;
    }
};

async function addStockToWatchlist(stockID) {
    try {
        const existsInWL = await Watchlist.findOne({
            where: {
                stock_id: stockID,
            },
        });

        if (existsInWL) {
            return { message: "Stock is already in the watchlist" };
        }

        // Check if valid stockID in the Stock table
        const stock = await Stock.findByPk(stockID);
        if (!stock) {
            return { message: "Invalid stockID provided." };
        }

        const stockAddedInWL = await Watchlist.create({
            stock_id: stockID,
        });
        return stockAddedInWL;
    } catch (error) {
        console.error('BrowseScripts: Error adding stock to watchlist:', error);
        throw error;
    }
};

async function getStockName(ticker) {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
        if (response.data.name) {
            console.log(response.data.name)
            return response.data.name;
        } else {
            return "Unknown Stock";
        }
    } catch (error) {
        console.error(`Error fetching data for ticker ${ticker}:`, error.message);
        return "Unknown Stock";
    }
}

async function getTopGainers() {
    try {
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await axios.get(url);
        const gainers = response.data.top_gainers || [];  // Make sure you match the correct key here

        // Fetch names for all tickers
        const gainersWithNames = await Promise.all(gainers.slice(0, 10).map(async (item) => {
            const name = await getStockName(item.ticker);
            return {
                ticker: item.ticker,
                name: name,
                price: item.price,
                change_amount: item.change_amount,
                change_percentage: item.change_percentage,
                volume: item.volume,
            };
        }));

        return gainersWithNames;
    } catch (error) {
        console.error('Error fetching Top Gainers:', error);
        throw error;
    }
}

async function getTopLosers() {
    try {
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await axios.get(url);
        const losers = response.data.top_losers || [];  // Make sure you match the correct key here

        // Fetch names for all tickers
        const losersWithNames = await Promise.all(losers.slice(0, 10).map(async (item) => {
            const name = await getStockName(item.ticker);
            return {
                ticker: item.ticker,
                name: name,
                price: item.price,
                change_amount: item.change_amount,
                change_percentage: item.change_percentage,
                volume: item.volume,
            };
        }));

        return losersWithNames;
    } catch (error) {
        console.error('Error fetching Top Losers:', error);
        throw error;
    }
}

module.exports = {
    getStockPriceData,
    getWatchlist,
    deleteStockFromWatchlist,
    addStockToWatchlist,
    getTopGainers,
    getTopLosers
};