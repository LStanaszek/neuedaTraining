const express = require('express');
const {getTotalInvestment, getTotalValuation}  = require("../scripts/DashboardScripts");

const router = express.Router();

// Individual routes

router.get("/PerformanceIndicators", async (req, res) => {
    try {
        const totalInvestment = await getTotalInvestment()
        const totalvalue = await getTotalValuation()
        console.log(totalInvestment);
        res.json({
            moneyIn : totalInvestment,
            valuation : totalvalue,
            growthAbsolute : parseFloat(totalvalue - totalInvestment).toFixed(2),
            growthPercent : parseFloat(((totalvalue - totalInvestment) / totalInvestment) * 100).toFixed(2)
        });
        // res.json({
        //     moneyIn : 42000,
        //     valuation : 45000,
        //     growthAbsolute : 3000,
        //     growthPercent : 7.14
        // });
      } catch (error) {
        res.status(500).json({ error: 'An error occurred getting total investemnt.' });
        console.error('Error fetching sum of product:', error);
      }
});

module.exports = router;