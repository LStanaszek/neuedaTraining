//StockInfoAPI.js file
const express = require('express');
const {getCompanyProfile, searchSymbols}  = require("../scripts/StockInfoScript"); //check with Lukasz

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

module.exports = router;
