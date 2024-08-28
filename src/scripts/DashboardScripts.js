// Import necessary modules and models
const { sequelize, Sector, Stock, Watchlist, User, Transaction } = require('../utils/createDB');
const axios = require("axios");
require("dotenv").config();
const finnhub = require('finnhub');
const { Op } = require('sequelize');
const yahooFinance = require('yahoo-finance2').default;

// Function that retrieves the total value of all transactions
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

// Function that retrieves the current stock price for a given ticker symbol
async function getCurrentStockPrice(ticker) {
    try {

        const quote = await yahooFinance.quote(ticker);

        // Extract the current price from the quote response
        const latestPrice = quote.regularMarketPrice;

        return latestPrice;

    } catch (error) {
        console.error(`Error fetching stock price for ${ticker}:`, error);
        throw error;
    }
}


// Function that calculates the total valuation of the user's portfolio
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

        // Calculate total portfolio value by summing up the value of each transaction
        for (const transaction of transactions) {
            const { share_quantity, Stock } = transaction;
            const { ticker } = Stock;
            const stockPrice = await getCurrentStockPrice(ticker);
            totalValue += stockPrice * share_quantity;
        }

        return parseFloat(totalValue).toFixed(2);
    }
    catch (error) {
        console.error('Error fetching sum of product:', error);
    }
}


// Function that adds funds to a user's balance.
async function AddFundsUser(userId, amount) {
    // Validate input data
    if (!userId || typeof amount !== 'number' || amount <= 0) {
        throw new Error('Invalid input');
    }

    try {
        // Perform the update operation using sequelize's update method
        const [updatedRowsCount] = await User.update(
            { balance: sequelize.literal(`balance + ${amount}`) }, // Use sequelize.literal to perform a calculation in SQL
            { where: { user_id: userId } }
        );

        if (updatedRowsCount === 0) {
            throw new Error('User not found or no change in balance');
        }

        // Fetch the updated user to return the updated data
        const updatedUser = await User.findByPk(userId);

        return { message: 'Funds added successfully', user: updatedUser };
    } catch (error) {
        console.error('Error updating user balance:', error);
        throw new Error('Error updating user balance: ' + error.message);
    }
}

// Function that withdraws funds from a user's balance.
async function WithdrawFundsUser(userId, amount) {
    // Validate input data
    if (!userId || typeof amount !== 'number' || amount <= 0) {
        throw new Error('Invalid input');
    }

    try {
        // Find the user by user_id
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user has sufficient funds
        if (user.balance < amount) {
            throw new Error('Insufficient funds');
        }

        // Perform the update operation using Sequelize's update method
        const [updatedRowsCount] = await User.update(
            { balance: sequelize.literal(`balance - ${amount}`) }, // Use sequelize.literal to perform a calculation in SQL
            { where: { user_id: userId } }
        );

        if (updatedRowsCount === 0) {
            throw new Error('Failed to withdraw funds');
        }

        // Fetch the updated user to return the updated data
        const updatedUser = await User.findByPk(userId);

        return { message: 'Funds withdrawn successfully', user: updatedUser };
    } catch (error) {
        console.error('Error withdrawing funds:', error);
        throw new Error('Error withdrawing funds: ' + error.message);
    }
}


// Function that retrieves all stocks in the user's portfolio with their current or historical value.
async function getAllStocks(userId, date, flag = 0) {
    try {
        // Fetch sum of shares owned per stock up to the input date
        const holdings = await Transaction.findAll({
            attributes: [
                'stock_id',
                [sequelize.fn('SUM', sequelize.col('share_quantity')), 'totalShares']
            ],
            where: {
                user_id: userId
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


        // Map through holdings and calculate their market value
        const results = await Promise.all(holdings.map(async (holding) => {
            const { stock_id, Stock } = holding;
            const { ticker, stock_name } = Stock;
            const totalShares = holding.get('totalShares');

            var currentPrice;


            if (flag === 0) {
                // Get the current price from Finnhub
                currentPrice = await getCurrentStockPrice(ticker);
                currentPrice = parseFloat(currentPrice).toFixed(2)
            }
            else {
                // Get historical price
                currentPrice = parseFloat(getStockPriceData(ticker, interval = "1d", date, date)).toFixed(2);
            }

            // Calculate the total market value
            const marketValue = parseFloat(currentPrice * parseInt(totalShares)).toFixed(2);

            return {
                stock_id,
                ticker,
                stock_name,
                totalShares,
                currentPrice,
                marketValue,
            };
        }));

        return results;
    }
    catch (error) {
        console.error('Error fetching all stocks:', error);
    }

}

// Function that obtain a set of timeframes
async function getDates(timeframe) {
    const end = new Date().toISOString().split('T')[0];
    const startTemp = new Date();
    let start;

    console.log(timeframe);

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

// Function that calculates the historical wealth of a user over a given timeframe.
async function calculateHistoricalWealth(userId, startDate, endDate) {
    try {
        // Fetch all relevant transactions for the user up to the end date
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                trade_timestamp: { [Op.lte]: endDate }, // Fetch transactions up to the end date
            },
            include: [{
                model: Stock,
                attributes: ['ticker', 'stock_name'],
            }],
            order: [['trade_timestamp', 'ASC']],
        });

        // Determine unique stocks involved in transactions
        const stockHoldings = {};
        transactions.forEach(transaction => {
            const { stock_id, share_quantity, Stock } = transaction;
            if (!stockHoldings[stock_id]) {
                stockHoldings[stock_id] = {
                    ticker: Stock.ticker,
                    stock_name: Stock.stock_name,
                    dailyShares: {}
                };
            }
            const transactionDate = transaction.trade_timestamp.toISOString().split('T')[0];
            if (!stockHoldings[stock_id].dailyShares[transactionDate]) {
                stockHoldings[stock_id].dailyShares[transactionDate] = 0;
            }
            stockHoldings[stock_id].dailyShares[transactionDate] += share_quantity;
        });

        // Calculate cumulative shares owned up to each date
        for (let stock_id in stockHoldings) {
            let cumulativeShares = 0;
            const sortedDates = Object.keys(stockHoldings[stock_id].dailyShares).sort();
            sortedDates.forEach(date => {
                cumulativeShares += stockHoldings[stock_id].dailyShares[date];
                stockHoldings[stock_id].dailyShares[date] = cumulativeShares;
            });
        }

        // Fetch historical prices for each stock within the date range using yahoo-finance2
        const stockPricePromises = Object.values(stockHoldings).map(stock => {
            return yahooFinance.chart(stock.ticker, {
                interval: '1d',  // Daily prices
                period1: startDate, // Start date
                period2: endDate, // End date
            }).then(chart => ({
                ticker: stock.ticker,
                prices: chart.quotes,
            }));
        });

        const stockPrices = await Promise.all(stockPricePromises);

        // Initialize arrays for dates and valuations
        const dates = [];
        const valuations = {};

        // Calculate daily valuations based on net shares owned
        stockPrices.forEach(stockData => {
            const { ticker, prices } = stockData;
            let lastAvailablePrice = null;

            prices.forEach(priceData => {
                const date = priceData.date.toISOString().split('T')[0];
                const stock_id = Object.keys(stockHoldings).find(id => stockHoldings[id].ticker === ticker);

                // Use the latest cumulative shares owned up to the current date
                const latestDateWithShares = Object.keys(stockHoldings[stock_id].dailyShares)
                    .filter(d => d <= date)
                    .sort()
                    .pop();

                const sharesOwned = latestDateWithShares
                    ? stockHoldings[stock_id].dailyShares[latestDateWithShares]
                    : 0;

                // If there's no price for the day, use the last available price
                const currentPrice = priceData.close || lastAvailablePrice;

                if (sharesOwned > 0 && currentPrice !== null) {
                    valuations[date] = (valuations[date] || 0) + sharesOwned * currentPrice;
                }

                // Update the last available price
                if (priceData.close !== null) {
                    lastAvailablePrice = priceData.close;
                }

                // Only add unique dates to the dates array
                if (!dates.includes(date)) {
                    dates.push(date);
                }
            });
        });

        // Fill in missing dates between startDate and endDate
        let currentValuation = 0;
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const formattedDate = currentDate.toISOString().split('T')[0];

            // Use previous day's valuation if there's no valuation for the current date
            if (!valuations[formattedDate]) {
                valuations[formattedDate] = currentValuation;
            } else {
                currentValuation = valuations[formattedDate];
            }

            if (!dates.includes(formattedDate)) {
                dates.push(formattedDate);
            }

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Sort the dates to ensure they are in chronological order
        dates.sort();

        // Convert valuations object to an array that matches the dates array
        const valuationsArray = dates.map(date => valuations[date] || 0);

        // Return the final JSON object
        return {
            dates,
            valuations: valuationsArray
        };
    } catch (error) {
        console.error('Error calculating stock valuations:', error);
        throw new Error('An error occurred while calculating stock valuations.');
    }
}

// Function that gives out % each stock is worth vs total evaluation
async function getStockPie(userID) {
    try {
        // Fetch sum of shares owned per stock up to the input date
        const holdings = await Transaction.findAll({
            attributes: [
                'stock_id',
                [sequelize.fn('SUM', sequelize.col('share_quantity')), 'totalShares']
            ],
            where: {
                user_id: userID
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

        // Calculate the current valuation of each stock
        const stockValuations = await Promise.all(holdings.map(async (holding) => {
            const { totalShares, Stock } = holding.dataValues;
            const { ticker, stock_name } = Stock;

            // Get the current price from Finnhub using existing getCurrentStockPrice function
            const currentPrice = await getCurrentStockPrice(ticker);

            // Calculate the market value
            const marketValue = currentPrice * parseFloat(totalShares);

            return {
                ticker,
                stock_name,
                marketValue,
            };
        }));

        totalValuation = await getTotalValuation();

        // Sort the stocks by market value in descending order
        stockValuations.sort((a, b) => b.marketValue - a.marketValue);

        // Get the top 4 stocks
        const topStocks = stockValuations.slice(0, 4);

        console.log(topStocks);

        // Calculate the percentage of total valuation for each of the top stocks
        const stockNames = topStocks.map(stock => stock.stock_name);
        const percentages = topStocks.map(stock => ((stock.marketValue / totalValuation) * 100).toFixed(2));

        // Calculate the percentage for the "Other" category if there are more than 4 stocks
        if (stockValuations.length > 4) {
            const otherValuation = stockValuations.slice(4).reduce((sum, stock) => sum + stock.marketValue, 0);
            stockNames.push('Other');
            percentages.push(((otherValuation / totalValuation) * 100).toFixed(2));
        }

        return {
            stockNames,
            percentages,
        };
    }
    catch (error) {
        console.error('Error fetching top stocks by valuation:', error);
        throw new Error('An error occurred while fetching the top stocks by valuation.');
    }
}

// Function that gives out % each sector is worth vs total evaluation
async function getSectorPie(userID) {
    try {
        // Fetch the current stock holdings for the user, along with sector information
        const holdings = await Transaction.findAll({
            attributes: [
                'stock_id',
                [sequelize.fn('SUM', sequelize.col('share_quantity')), 'totalShares']
            ],
            where: {
                user_id: userID,
            },
            include: [
                {
                    model: Stock,
                    attributes: ['ticker', 'stock_name', 'sector_id'], // Include stock details
                    include: [
                        {
                            model: Sector,
                            attributes: ['sector_name'], // Include sector details
                        }
                    ]
                }
            ],
            group: ['stock_id'], // Group by stock_id
        });

        // Aggregate market value by sector
        const sectorValuations = {};

        await Promise.all(holdings.map(async (holding) => {
            const totalShares = parseInt(holding.get('totalShares'), 10);
            const { ticker } = holding.Stock;
            const { sector_name } = holding.Stock.Sector;

            // Get the current price from Finnhub using your existing getCurrentStockPrice function
            const currentPrice = await getCurrentStockPrice(ticker);

            // Calculate the market value
            const marketValue = currentPrice * totalShares;

            // Aggregate the market value by sector
            if (sectorValuations[sector_name]) {
                sectorValuations[sector_name] += marketValue;
            } else {
                sectorValuations[sector_name] = marketValue;
            }
        }));

        const totalValuation = await getTotalValuation();

        console.log('Total Valuation:', totalValuation);

        // Convert sector valuations to an array and sort by market value in descending order
        const sortedSectors = Object.entries(sectorValuations)
            .sort(([, a], [, b]) => b - a); // Sort by market value descending

        // Extract the top 4 sectors and calculate percentages
        const topSectors = sortedSectors.slice(0, 4);
        const otherSectors = sortedSectors.slice(4);

        const sectorNames = topSectors.map(([sector]) => sector);
        const percentages = topSectors.map(([, value]) => parseFloat((value / totalValuation) * 100).toFixed(2));

        // Calculate the "Other" sector if there are more than 4 sectors
        if (otherSectors.length > 0) {
            const otherValuation = otherSectors.reduce((sum, [, value]) => sum + value, 0);
            sectorNames.push('Other');
            percentages.push(parseFloat((otherValuation / totalValuation) * 100).toFixed(2));
        }

        return {
            sectorNames,
            percentages,
        };
    }
    catch (error) {
        console.error('Error fetching sector percentages by valuation:', error);
        throw new Error('An error occurred while fetching the sector percentages by valuation.');
    }
}

// Function that checks the user's balance
async function getUserBalance(userId) {
    try {

        console.log(userId);
        // Fetch the user from the database
        const user = await User.findByPk(userId, {
            attributes: ['balance']
        });

        // If user not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }

        // Return the balance as an object
        return { balance: parseFloat(user.balance).toFixed(2) };
    } catch (error) {
        console.error('Error fetching user balance:', error);
        throw new Error('An error occurred while fetching the balance: ' + error.message);
    }
}

// Export the functions for use in other modules
module.exports = {
    getTotalInvestment,
    getTotalValuation,
    AddFundsUser,
    WithdrawFundsUser,
    getAllStocks,
    getCurrentStockPrice,
    calculateHistoricalWealth,
    getDates,
    getStockPie,
    getSectorPie,
    getUserBalance,
}