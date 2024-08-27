//StockInfoScript.js file

const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('../utils/createDB')
const axios = require('axios');
require('dotenv').config();
const finnhub = require('finnhub');

/**
 * Asynchronous function to fetch company profile based on ticker symbol
 * @param {string} ticker - The ticker symbol of the company (e.g., "AAPL" for Apple Inc.)
 * @returns {Object} - THe company profile data
*/

async function getCompanyProfile(ticker) {
  try {
    var api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = "cr3j3dhr01ql234grkj0cr3j3dhr01ql234grkjg" //process.env.FINNHUB_API_KEY;
    const finnhubClient = new finnhub.DefaultApi()
    return new Promise((resolve, reject) => { 
      finnhubClient.companyProfile2({'symbol': ticker }, (error, data, response) => {
        if (error) {
          return reject(error); // Reject the promise if there is an error
        }      
          resolve(data); // Resolve the promise with the company data
      });
    });
   
  } catch (error) {
    console.error(`Error fetching company profile for ${ticker}:`, error);
    throw error;  // Re-throw the error if you want to handle it later
  }
}

//searchSymbols Asynchronous function that gives a list of best-matching symbols
//Can access directly via HTTP requests

async function searchSymbols(query) {
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  console.log(query)
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;

  try {
      const response = await axios.get(url);
      const bestMatches = response.data['bestMatches'];
      console.log(bestMatches);
      if (!bestMatches || bestMatches.length === 0) {
          console.log('No matching symbols found.');
          return [];
      }

      // Map the response to extract the relevant details
      return bestMatches.map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          currency: match['8. currency'],
          matchScore: match['9. matchScore'],
      }));
  } catch (error) {
      console.error('Error fetching data from Alpha Vantage:', error);
      return [];
  }
}

module.exports = {
  getCompanyProfile,
  searchSymbols
}