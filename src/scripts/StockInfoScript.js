// Import necessary modules and models
const { sequelize, Sector, Stock, Watchlist, User, Transaction } = require('../utils/createDB');
const axios = require('axios');
require('dotenv').config();
const finnhub = require('finnhub');
const yahooFinance = require('yahoo-finance2').default;

// Function to get company profile data from Finnhub API
async function getCompanyProfile(ticker) {
  try {
    console.log("Ticker type:", typeof ticker); // Log the type of the ticker for debugging

    // Set API key for Finnhub client
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = process.env.FINNHUB_API_KEY

    const finnhubClient = new finnhub.DefaultApi();

    // Return a promise that resolves with company profile data
    return new Promise((resolve, reject) => {
      finnhubClient.companyProfile2({ 'symbol': ticker }, (error, data, response) => {
        if (error) {
          return reject(error); // Reject the promise if there is an error
        }

        // Format marketCapitalization and shareOutstanding to two decimal places if available
        if (data) {
          if (data.marketCapitalization !== undefined) {
            data.marketCapitalization = parseFloat(data.marketCapitalization).toFixed(2);
          }
          if (data.shareOutstanding !== undefined) {
            data.shareOutstanding = parseFloat(data.shareOutstanding).toFixed(2);
          }
        }

        resolve(data); // Resolve the promise with the formatted company data
      });
    });

  } catch (error) {
    console.error(`Error fetching company profile for ${ticker}:`, error);
    throw error;  // Re-throw the error for potential external handling
  }
}

async function getPriceAndGrowth(ticker) {
  try {
      // Fetch the stock quote from Yahoo Finance
      const quote = await yahooFinance.quote(ticker);

      // Extract the current price and the previous day's close price
      const currentPrice = quote.regularMarketPrice;
      const previousClose = quote.regularMarketPreviousClose;

      // Calculate the growth percentage
      const growth = ((currentPrice - previousClose) / previousClose) * 100;

      return {
          ticker,
          currentPrice,
          growth: parseFloat(growth.toFixed(2)) // Round to 2 decimal places
      };
  } catch (error) {
      console.error(`Error fetching stock price and growth for ${ticker}:`, error);
      throw error;
  }
}

// Export the getCompanyProfile function for use in other modules
module.exports = {
  getCompanyProfile,
  getPriceAndGrowth
};