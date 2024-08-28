// Import necessary modules and models
const { sequelize, Sector, Stock, Watchlist, User, Transaction } = require('../utils/createDB')
const axios = require('axios');
require('dotenv').config();
const { getCompanyProfile } = require("../scripts/StockInfoScript");
const { getCurrentStockPrice } = require("../scripts/DashboardScripts");

// Function to buy purchase stocks
async function purchaseStocks(ticker, share_quantity, user_id) {
    // Start a new transaction
    const t = await sequelize.transaction();

    try {
        // Validate input data
        if (!ticker || share_quantity <= 0 || !user_id) {
            throw new Error('All fields are required: stock_id, share_quantity <= 0, user_id');
        }

        // Get the current stock price using the ticker symbol
        const currentStockPrice = await getCurrentStockPrice(ticker);
        if (!currentStockPrice) {
            throw new Error(`Unable to retrieve current stock price for ticker ${ticker}`);
        }

        // Convert stock price to 2 decimal places
        const formattedStockPrice = parseFloat(currentStockPrice).toFixed(2);

        // Calculate the total cost of the stocks to be purchased
        const totalCost = share_quantity * currentStockPrice;

        // Find the user by their ID
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user has enough balance to complete the purchase
        if (user.balance < totalCost) {
            throw new Error('Insufficient balance to complete the purchase.');
        }

        // Check if the stock exists in the database
        var stock = await Stock.findOne({ where: { ticker }, transaction: t });
        console.log(stock);

        // If the stock doesn't exist, fetch data from the external API and create a new stock entry
        if (!stock) {
            const companyProfile = await getCompanyProfile(ticker);
            if (!companyProfile) {
                throw new Error(`Company profile for ticker ${ticker} not found`);
            }

            // Check if the sector exists, if not create it
            var sector = await Sector.findOne({ where: { sector_name: companyProfile.finnhubIndustry }, transaction: t });
            if (!sector) {
                sector = await Sector.create({ sector_name: companyProfile.finnhubIndustry }, { transaction: t });
            }

            // Create new stock entry
            stock = await Stock.create({
                stock_name: companyProfile.name,
                ticker: ticker,
                sector_id: sector.dataValues.sector_id,
                company_country: companyProfile.country,
                currency: companyProfile.currency,
                exchanges: companyProfile.exchange,
                web_url: companyProfile.weburl
            }, { transaction: t });

        }

        const stock_id = stock.dataValues.stock_id;

        // Convert share quantity to 2 decimal places
        const formattedShareQuantity = parseFloat(share_quantity).toFixed(2);

        // Create a new transaction for buying stocks
        const newTransaction = await Transaction.create({
            stock_id: stock_id,
            share_quantity: formattedShareQuantity,
            stock_price: formattedStockPrice,
            user_id: user_id,
            trade_timestamp: new Date(), // Sequelize automatically handles the current timestamp
        }, { transaction: t });

        // Deduct the total cost from the user's balance
        user.balance -= totalCost;
        await user.save({ transaction: t });

        // Commit the transaction
        await t.commit();

        // Return the new transaction object
        return newTransaction;

    } catch (error) {
        // Rollback the transaction in case of error
        await t.rollback();
        console.error('Error buying stock:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

// Function to sell stocks
async function sellStocks(ticker, share_quantity, user_id) {

    // Start a new transaction
    const t = await sequelize.transaction();

    try {
        // Validate input data
        if (!ticker || share_quantity <= 0 || !user_id) {
            throw new Error('All fields are required: ticker, share_quantity <= 0, user_id');
        }

        // Find the user by their ID
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) {
            throw new Error('User not found');
        }

        // Find stock by ticker
        const stock = await Stock.findOne({ where: { ticker }, transaction: t }); // Changed to find stock by ticker
        if (!stock) {
            throw new Error('Stock not found');
        }

        const stock_id = stock.stock_id; // Use stock_id after finding stock by ticker

        // Calculate the total shares owned by the user
        const totalSharesOwned = await Transaction.sum('share_quantity', {
            where: { stock_id, user_id },
            transaction: t,
        });

        // Validate that the user has enough shares to sell
        if (totalSharesOwned < share_quantity) { // Ensure enough shares are available for sale
            throw new Error('Insufficient shares to sell');
        }

        // Get the current stock price using the ticker symbol
        const currentStockPrice = await getCurrentStockPrice(stock.ticker);

        // Format the current stock price to 2 decimal places
        const formattedStockPrice = parseFloat(currentStockPrice).toFixed(2);

        // Format the share quantity to 2 decimal places
        const formattedShareQuantity = parseFloat(share_quantity).toFixed(2);

        // Calculate the total credit from the shares sold
        const totalCredit = formattedShareQuantity * formattedStockPrice;

        // Create a new transaction for selling stocks
        const newTransaction = await Transaction.create({
            stock_id: stock_id,
            share_quantity: -formattedShareQuantity, // Negative for selling
            stock_price: formattedStockPrice,
            user_id: user_id,
            trade_timestamp: new Date(), // Sequelize automatically handles the current timestamp
        }, { transaction: t });

        // Convert balance to a number before performing arithmetic
        user.balance = parseFloat(user.balance);

        // Add the total credit to the user's balance
        user.balance += totalCredit;
        console.log(`New balance to be saved: ${user.balance}`);

        await user.save({ transaction: t });
        console.log('User balance updated successfully. Committing transaction...');

        // Commit the transaction
        await t.commit();
        console.log('Transaction committed successfully.');

        return newTransaction; // Return the new transaction object

    } catch (error) {
        // Rollback the transaction in case of error
        await t.rollback();
        console.error('Error selling stock:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

// Function to get the total share amount of a stock for a user
async function getShareAmount(userID, ticker) {
    try {
        // Find the stock ID associated with the passed ticker
        const stock = await Stock.findOne({ where: { ticker } });
        if (!stock) {
            throw new Error('Stock not found');
        }

        // Sum the total share quantity for the user and stock
        const result = await Transaction.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('share_quantity')), 'netShares']
            ],
            where: {
                stock_id: stock.stock_id,
            }
        });

        // If no transactions are found, netShares should be 0
        const netShares = result.get('netShares') || 0;

        return { ticker: parseFloat(parseInt(netShares, 10)).toFixed(2) };
    }
    catch (error) {
        console.error('Error fetching stocks for passed ticker:', error);
    }
}

// Export the functions for use in other modules
module.exports = {
    purchaseStocks,
    sellStocks,
    getShareAmount
}