// Import necessary modules
const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const { getCompanyProfile, getPriceAndGrowth } = require("../scripts/StockInfoScript");

// Create a new Express router
const router = express.Router();

// Individual routes

// Route to get company information based on ticker
router.get("/Companyinfo", async (req, res) => {
  try {
    const ticker = req.query.ticker;
    console.log('Requested ticker:', ticker);

    // Fetch company profile information using the ticker
    const CompanyInfo = await getCompanyProfile(ticker)
    console.log("Fetched Company Info:", CompanyInfo);

    // Send the company info as a JSON response
    res.json({ CompanyInfo });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while obtaining company info.' });
    console.error('Error fetching company info:', error);
  }
});

// Route for autocomplete search using Yahoo Finance API
router.get('/api/autocomplete', async (req, res) => {
  try {
    const query = req.query.q; // Extract query parameter

    // Validate that the query parameter is provided
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Use yahoo-finance2's search method to find relevant stock symbols
    const result = await yahooFinance.search(query);

    // Check if the result is properly defined and contains quotes
    if (!result || !result.quotes) {
      console.error('No results or quotes found for the search query:', query);
      return res.status(404).json({ error: 'No results found' });
    }

    // Filter out companies with a ticker size above 5 characters and map to desired format
    const suggestions = result.quotes
      .filter(item => item.symbol && item.symbol.length <= 5) // Check for symbol existence and length
      .map(item => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.name, // Fallback to available name fields
      }));

    // Send the autocomplete suggestions as a JSON response
    res.json(suggestions);
  } catch (error) {
    // Handle errors by sending a 500 status code and logging the error
    console.error('Error during autocomplete search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/GetPriceAndGrowth', async (req, res) => {
  try {
    const ticker = req.query.ticker;
    console.log(ticker);
    const priceAndGrowth = await getPriceAndGrowth(ticker)
    res.json({priceAndGrowth});
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while obtaining price and growth.' });
    console.error('Error fetching price and growth:', error);
  }
});

// Export the router for use in the main application
module.exports = router;
