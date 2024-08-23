const express = require('express');
const {getTotalInvestment, getTotalValuation, AddFundsUser, WithdrawFundsUser}  = require("../scripts/DashboardScripts");

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

module.exports = router;