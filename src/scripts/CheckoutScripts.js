//CheckoutScript.js file

const { sequelize, Sector, Stock, Watchlist, User, Transaction } = require('../utils/createDB')
const axios = require('axios');
require('dotenv').config();

//Asynchronous function to buy stocks
async function purchaseStocks(stock_id, share_quantity, stock_price, user_id) {

    const t = await sequelize.transaction();

    try {
        // Validate input data
        if (!stock_id || share_quantity <= 0 || !stock_price || !user_id) {
            throw new Error('All fields are required: stock_id, share_quantity <= 0, stock_price, user_id');
        }

        // Find user
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) {
            throw new Error('User not found');
        }

        // Find stock
        const stock = await Stock.findByPk(stock_id, { transaction: t });
        if (!stock) {
            throw new Error('Stock not found');
        }

        // Calculate the total cost of the stocks to be purchased
        const totalCost = share_quantity * stock_price;

        // Check if the user has enough balance to cover the purchase
        if (user.balance < totalCost) {
            throw new Error('Insufficient balance to complete the purchase.');
        }

        // Create a new transaction for buying stocks
        const newTransaction = await Transaction.create({
            stock_id: stock_id,
            share_quantity: share_quantity, // Positive for buying
            stock_price: stock_price,
            user_id: user_id,
            trade_timestamp: new Date(), // Sequelize automatically handles the current timestamp
        }, { transaction: t });

        // Deduct the total cost from the user's balance
        user.balance -= totalCost;
        
        await user.save({ transaction: t });

        await t.commit();

        return newTransaction; // Return the new transaction object

    } catch (error) {
        // Rollback the transaction in case of error
        await t.rollback();
        console.error('Error buying stock:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

//Asynchronous function to sell stocks
async function sellStocks(stock_id, share_quantity, stock_price, user_id) {

    // Start a transaction
    const t = await sequelize.transaction();

    try {
        // Validate input data
        if (!stock_id || share_quantity >= 0 || !stock_price || !user_id) {
            throw new Error('All fields are required: stock_id, share_quantity >= 0, stock_price, user_id');
        }

        // Find user
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) {
            throw new Error('User not found');
        }

        // Find stock
        const stock = await Stock.findByPk(stock_id, { transaction: t });
        if (!stock) {
            throw new Error('Stock not found');
        }

        // Calculate the total shares owned by the user
        const totalSharesOwned = await Transaction.sum('share_quantity', {
            where: { stock_id, user_id },
            transaction: t,
        });

        // Validate that the user has enough shares to sell
        if (totalSharesOwned + share_quantity < 0) { // share_quantity is negative for selling
            console.log("You own a total of " + totalSharesOwned);
            throw new Error('Insufficient shares to sell');
        }

        // Create a new transaction for selling stocks
        const newTransaction = await Transaction.create({
            stock_id: stock_id,
            share_quantity: share_quantity, // Negative for selling
            stock_price: stock_price,
            user_id: user_id,
            trade_timestamp: new Date(), // Sequelize automatically handles the current timestamp
        }, { transaction: t });

        // Credit the amount obtained from selling to the user's balance
        console.log(Math.abs(share_quantity));
        let totalCredit = Math.abs(share_quantity) * stock_price;
        console.log(`Current balance before credit: ${user.balance}`);
        console.log("totalCredit typeof: " + typeof totalCredit);
        console.log("user balance typeof: " + typeof user.balance);

        // Convert balance to a number before performing arithmetic
        user.balance = parseFloat(user.balance); 

        user.balance += totalCredit;
        console.log(`New balance to be saved: ${user.balance}`);

        await user.save({ transaction: t });
        console.log('User balance updated successfully. Committing transaction...');

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

module.exports = {
    purchaseStocks,
    sellStocks
}