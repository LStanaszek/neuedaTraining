const express = require('express');
const {getTotalInvestment}  = require("../scripts/DashboardScripts");

const router = express.Router();

// Individual routes

router.get("/TotalInvestment", async (req, res) => {
    try {
        const totalInvestment = await getTotalInvestment()
        console.log(totalInvestment);
        res.json(totalInvestment);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred getting total investemnt.' });
        console.error('Error fetching sum of product:', error);
      }
});

module.exports = router;