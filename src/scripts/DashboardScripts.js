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

/**
 * Adds funds to a user's balance.
 * @param {number} userId - The ID of the user.
 * @param {number} amount - The amount to add to the user's balance.
 * @returns {Promise<object>} - A promise that resolves to the updated user object or an error message.
 */

async function AddFundsUser(userId, amount) {
    // Validate input
    if (!userId || typeof amount !== 'number') {
      throw new Error('Invalid input');
    }
  
    try {
      // Perform the update operation using Sequelize's update method
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

  async function WithdrawFundsUser(userId, amount) {
    // Validate input
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

async function getAllStocks(userId, date)
{
    try {
        // Fetch sum of shares owned per stock up to the input date
        const holdings = await Transaction.findAll({
            attributes: [
                'stock_id',
                // Use Sequelize's raw query to cast the SUM result to a number directly
                [sequelize.literal('SUM(share_quantity)'), 'totalShares']
            ],
            where: {
                user_id: userId,
                trade_timestamp: { [Op.lte]: new Date(date) } // Up to the specified date
            },
            include: [
                {
                    model: Stock,
                    attributes: ['ticker', 'stock_name'], // Include stock details
                }
            ],
            group: ['stock_id'], // Group by stock_id and stock details
        });

        //console.log(holdings);
        //return holdings;

        const results = await Promise.all(holdings.map(async (holding) => {
            const { stock_id, Stock } = holding;
            const { ticker, stock_name } = Stock;
            const totalShares = holding.get('totalShares');

            // Get the current price from Finnhub
            const currentPrice = await getCurrentStockPrice(ticker);

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

module.exports = {
    getTotalInvestment,
    getTotalValuation,
    AddFundsUser,
    WithdrawFundsUser,
    getAllStocks,
    getCurrentStockPrice
}

