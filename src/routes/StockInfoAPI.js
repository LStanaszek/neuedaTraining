//StockInfoAPI.js file
const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const {getCompanyProfile, searchSymbols}  = require("../scripts/StockInfoScript");

const router = express.Router();

// Routes

//On load - get company information
router.get("/Companyinfo", async (req, res) => {
    try {
        const ticker = req.query.ticker;
        console.log(ticker);
        const CompanyInfo = await getCompanyProfile(ticker)
        console.log("Testing:",CompanyInfo);
        res.json({CompanyInfo});
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while obtaining company info.' });
        console.error('Error fetching company info:', error);
      }
});

//On load - search best matching symbol
router.get("/SymbolSearch", async (req, res) => {
    try {
        const SymbolSearch = await searchSymbols(req.query.ticker)
        res.json({SymbolSearch});
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching best-matches.' });
        console.error('Error fetching a company match:', error);
      }
});


router.get('/api/autocomplete', async (req, res) => {
  try {
      const query = req.query.q;

      if (!query) {
          return res.status(400).json({ error: 'Query parameter is required' });
      }

      // Use yahoo-finance2's search method to find relevant stock symbols
      const result = await yahooFinance.search(query);

      // Extract relevant information from the result
      const suggestions = result.quotes.map(item => ({
          symbol: item.symbol,
          name: item.shortname || item.longname || item.name,
      }));

      res.json(suggestions);
  } catch (error) {
      console.error('Error during autocomplete search:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
