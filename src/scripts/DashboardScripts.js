const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('../utils/createDB');
const axios = require("axios");
require("dotenv").config();
const finnhub = require('finnhub');
const { Op } = require('sequelize');

async function getTotalInvestment() {
    try {
        const result = await Transaction.findOne({
        attributes: [
        [sequelize.fn('SUM', sequelize.literal('share_quantity * stock_price')), 'totalValue']
        ]
        });
  
        console.log('Total Value:', result.get('totalValue'));
        return parseFloat(result.get('totalValue')).toFixed(2);
    } 
    catch (error) {
        console.error('Error fetching sum of product:', error);
    }
}

async function getCurrentStockPrice(ticker) {
    try {
        var api_key = finnhub.ApiClient.instance.authentications['api_key'];
        api_key.apiKey = process.env.FINNHUB_API_KEY;
        const finnhubClient = new finnhub.DefaultApi()

        return new Promise((resolve, reject) => {
            finnhubClient.quote(ticker, (error, data, response) => {
                if (error) {
                    return reject(error);  // Reject the promise if there is an error
                }
    
                const latestPrice = data.c;  // 'c' is the current price from Finnhub's response
                resolve(latestPrice);  // Resolve the promise with the latest price
            });
        });

    } catch (error) {
      console.error(`Error fetching stock price for ${ticker}:`, error);
      throw error;
    }
  }
  

async function getTotalValuation() {
    try {

        const transactions = await Transaction.findAll({
        include: [
            {
            model: Stock,
            attributes: ["ticker"],
            },
        ],
        });
  
        let totalValue = 0;

        // Calculate the total portfolio value
        for (const transaction of transactions) {
            const { share_quantity, Stock } = transaction;
            const { ticker } = Stock;
            const stockPrice = await getCurrentStockPrice(ticker);
            //console.log(`price : ${stockPrice}`);
            totalValue += stockPrice * share_quantity;
        }

        //console.log('Total Value:', totalValue);
        return parseFloat(totalValue).toFixed(2);
    } 
    catch (error) {
        console.error('Error fetching sum of product:', error);
    }
}

//multi purpose:
// - get all upto-date stocks
// - get all stocks upto specific date
async function getAllStocks(userId, date, flag)
{
    try {
        // Fetch sum of shares owned per stock up to the input date
        const holdings = await Transaction.findAll({
            attributes: [
                'stock_id',
                [sequelize.fn('SUM', sequelize.col('share_quantity')), 'totalShares']
            ],
            where: {
                user_id: userId,
                trade_timestamp: { [Op.lte]: new Date(date) } // Up to today
            },
            include: [
                {
                    model: Stock,
                    attributes: ['ticker', 'stock_name'], // Include stock details
                    required: true, // Perform an INNER JOIN
                }
            ],
            group: ['stock_id'], // Group by stock_id
            having: sequelize.literal('SUM(share_quantity) > 0') // Exclude stocks where totalShares is 0
        });

        //console.log(holdings);
        //return holdings;

        const results = await Promise.all(holdings.map(async (holding) => {
            const { stock_id, Stock } = holding;
            const { ticker, stock_name } = Stock;
            const totalShares = holding.get('totalShares');

            var currentPrice;

            
            if (flag === 0) {
                // Get the current price from Finnhub
                currentPrice = await getCurrentStockPrice(ticker);
            }
            else
            {
                currentPrice = getStockPriceData(ticker, interval = "1d", date, date)
            }

            // Calculate the total market value
            const marketValue = currentPrice * parseInt(totalShares);

            return {
                stock_id,
                ticker,
                stock_name,
                totalShares,
                currentPrice,
                marketValue,
            };
        }));

        //console.log(results)
        return results;
    } 
    catch (error) {
        console.error('Error fetching all stocks:', error);
    }

}

async function getDates(timeframe) {
    const end = new Date().toISOString().split('T')[0];
    const startTemp = new Date();
    let start;

    if (timeframe == 0) {
        startTemp.setDate(startTemp.getDate() - 7);
    } else if (timeframe == 1) {
        startTemp.setMonth(startTemp.getMonth() - 1);
    } else if (timeframe == 2) {
        startTemp.setMonth(startTemp.getMonth() - 6);
    } else {
        startTemp.setFullYear(startTemp.getFullYear() - 1);
    }

    start = startTemp.toISOString().split('T')[0];

    return start;
}

async function calculateUserStockValuations(userId, startDate, endDate) {
    try {
        // Fetch all relevant transactions for the user within the date range
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                trade_timestamp: { [Op.between]: [startDate, endDate] },
            },
            include: [{
                model: Stock,
                attributes: ['ticker', 'stock_name'],
            }],
            order: [['trade_timestamp', 'ASC']],
        });

        // Aggregate transactions to determine net shares owned per stock up to the end date
        const stockHoldings = {};
        transactions.forEach(transaction => {
            const { stock_id, share_quantity, Stock } = transaction;
            if (!stockHoldings[stock_id]) {
                stockHoldings[stock_id] = {
                    ticker: Stock.ticker,
                    stock_name: Stock.stock_name,
                    totalShares: 0,
                };
            }
            stockHoldings[stock_id].totalShares += share_quantity;
        });

        // Remove any stocks where the user has no shares
        Object.keys(stockHoldings).forEach(stock_id => {
            if (stockHoldings[stock_id].totalShares <= 0) {
                delete stockHoldings[stock_id];
            }
        });

        // Fetch historical prices for each stock within the date range
        const stockPricePromises = Object.values(stockHoldings).map(stock => {
            return yahooFinance.historical({
                symbol: stock.ticker,
                from: startDate,
                to: endDate,
                period: '1d',
            }).then(prices => ({ ticker: stock.ticker, prices }));
        });

        const stockPrices = await Promise.all(stockPricePromises);

        // Calculate daily valuations
        const dailyValuations = {};
        stockPrices.forEach(stockData => {
            const { ticker, prices } = stockData;
            prices.forEach(priceData => {
                const date = priceData.date.toISOString().split('T')[0];
                if (!dailyValuations[date]) {
                    dailyValuations[date] = 0;
                }
                const stock_id = Object.keys(stockHoldings).find(id => stockHoldings[id].ticker === ticker);
                dailyValuations[date] += stockHoldings[stock_id].totalShares * priceData.close;
            });
        });

        // Convert dailyValuations object to array format
        return Object.keys(dailyValuations).map(date => ({
            date,
            totalValuation: dailyValuations[date],
        }));
    } catch (error) {
        console.error('Error calculating stock valuations:', error);
        throw new Error('An error occurred while calculating stock valuations.');
    }
}

module.exports = {
    getTotalInvestment,
    getTotalValuation,
    getAllStocks,
    getDates,
    calculateUserStockValuations
}

