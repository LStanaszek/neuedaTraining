// Import necessary modules
const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const { getCompanyProfile, searchSymbols } = require("../scripts/StockInfoScript");

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

    // Extract relevant information from the result
    const suggestions = result.quotes.map(item => ({
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

// Export the router for use in the main application
module.exports = router;
