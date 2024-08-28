// Import necessary modules and models
const axios = require('axios');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Function to get the stock daily data
async function getStockPriceData(ticker, interval, start, end) {
    try {
        const intradayIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '1d', '1mo', 'max'];
        const data = await yahooFinance.chart(ticker, {
            interval,
            period1: start,
            period2: end,
        });
        console.log(data)
        return data;
    } catch (error) {
        console.error('BrowseScript: Error fetching data:', error);
    }
};


async function getStockDatesPrices(ticker, interval, start, end) {
    try {
        const data = await yahooFinance.chart(ticker, {
            interval,
            period1: start,
            period2: end,
        });

        // Extract dates and close prices
        const dates = [];
        const closePrices = [];

        // Helper function to get the previous Friday's price
        const getPreviousFriday = (date) => {
            const d = new Date(date);
            d.setDate(d.getDate() - (d.getDay() + 2) % 7); // Get the previous Friday
            return d.toISOString().split('T')[0];
        };

        // Create a map for the available dates and close prices
        const dataMap = new Map();
        data.quotes.forEach(quote => {
            const date = new Date(quote.date).toISOString().split('T')[0]; // Extract date as string
            dataMap.set(date, quote.close.toFixed(2)); // Format price to two decimal places
        });

        // Iterate over the date range and fill in missing dates
        let currentDate = new Date(start);
        const endDate = new Date(end);

        while (currentDate <= endDate) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            if (dataMap.has(formattedDate)) {
                dates.push(formattedDate);
                closePrices.push(dataMap.get(formattedDate));
            } else {
                // If date is missing, use the previous Friday's close price
                const previousFridayDate = getPreviousFriday(currentDate);
                if (dataMap.has(previousFridayDate)) {
                    dates.push(formattedDate);
                    closePrices.push(dataMap.get(previousFridayDate));
                }
            }
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
        }

        return { dates, closePrices };
    } catch (error) {
        console.error('BrowseScripts: Error fetching stock dates and prices:', error);
        throw error;
    }
}

// Function for the user's watchlist
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

// Function to delete stocks from the user's watchlist
async function deleteStockFromWatchlist(watchID) {
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

// Function to add stocks for the user's watchlist
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

// Function to obtain the stock name from a ticker
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

// Function for Top gainers
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

// Function for top losers
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

// Export the functions for use in other modules
module.exports = {
    getStockPriceData,
    getWatchlist,
    deleteStockFromWatchlist,
    addStockToWatchlist,
    getTopGainers,
    getTopLosers,
    getStockDatesPrices
};