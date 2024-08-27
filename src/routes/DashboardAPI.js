const express = require('express');
const {getTotalInvestment, getTotalValuation, getAllStocks,  AddFundsUser, WithdrawFundsUser, getDates, calculateHistoricalWealth}  = require("../scripts/DashboardScripts");

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

router.put('/AddFunds', async (req, res) => {
  const { user_id, amount } = req.body;

  try {
    const result = await AddFundsUser(user_id, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/WithdrawFunds', async (req, res) => {
  const { user_id, amount } = req.body;

  try {
    const result = await WithdrawFundsUser(user_id, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/GetAll", async (req, res) => {
  try {
      const { userId } = req.query; // Expecting date as an input parameter (e.g., ?date=2024-08-20)
      const date = new Date().toISOString().split('T')[0]
      const allStocks = await getAllStocks( userId, date)
      //console.log(totalInvestment);
      res.json({
          stocks : allStocks
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred getting total investemnt.' });
      console.error('Error fetching sum of product:', error);
    }
});

router.get("/GetPerformanceGraphData", async (req, res) => {
  try {
      //timeframe = 0,1,2 or 3 (1 week, 1 month, 6 month, 1 year)
      const {userId, timeframe} = req.query;

      const start = await getDates(timeframe);
      const end = new Date().toISOString().split('T')[0];

      console.log(start);
      console.log(end);

      const valuations = await calculateHistoricalWealth(userId, start, end);

      res.json(valuations);

    } catch (error) {
      res.status(500).json({ error: 'An error occurred getting graph data.' });
      console.error('Error getting graph data:', error);
    }
});

module.exports = router;