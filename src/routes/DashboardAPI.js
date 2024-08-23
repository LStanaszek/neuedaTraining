const express = require('express');
const {getTotalInvestment, getTotalValuation, getAllStocks}  = require("../scripts/DashboardScripts");

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

router.get("/GetAll", async (req, res) => {
  try {
      const { userId, date } = req.query; // Expecting date as an input parameter (e.g., ?date=2024-08-20)
      const allStocks = await getAllStocks( userId, date )
      //console.log(totalInvestment);
      res.json({
          stocks : allStocks
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred getting total investemnt.' });
      console.error('Error fetching sum of product:', error);
    }
});

module.exports = router;