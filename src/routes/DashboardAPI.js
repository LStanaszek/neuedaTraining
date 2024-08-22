const express = require('express');
const {getTotalInvestment, getTotalValuation}  = require("../scripts/DashboardScripts");

const router = express.Router();

// Individual routes

router.get("/TotalInvestment", async (req, res) => {
    try {
        const totalInvestment = await getTotalInvestment()
        //console.log(totalInvestment);
        res.json({totalInvestment});
      } catch (error) {
        res.status(500).json({ error: 'An error occurred getting total investemnt.' });
        console.error('Error fetching sum of product:', error);
      }
});

router.get("/TotalValue", async (req, res) => {
    try {
        const totalvalue = await getTotalValuation()
        //console.log(totalInvestment);
        res.json({totalvalue});
      } catch (error) {
        res.status(500).json({ error: 'An error occurred getting total valuation.' });
        console.error('Error fetching valuation:', error);
      }
});

module.exports = router;