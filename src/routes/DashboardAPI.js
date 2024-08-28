// Import necessary modules
const express = require('express');
const { getTotalInvestment, getTotalValuation, getAllStocks, AddFundsUser, WithdrawFundsUser, getDates, calculateHistoricalWealth, getUserBalance, getStockPie, getSectorPie } = require("../scripts/DashboardScripts");

// Create a new Express router
const router = express.Router();

// Individual routes

// Route to fetch performance indicators such as total investment and valuation
router.get("/PerformanceIndicators", async (req, res) => {
  try {
    // Fetch total investment and total valuation
    const totalInvestment = await getTotalInvestment()
    const totalvalue = await getTotalValuation()

    // Respond with performance indicators and calculate growth in absolute and percentage terms

    res.json({
      moneyIn: totalInvestment,
      valuation: totalvalue,
      growthAbsolute: parseFloat(totalvalue - totalInvestment).toFixed(2),
      growthPercent: parseFloat(((totalvalue - totalInvestment) / totalInvestment) * 100).toFixed(2)
    });
  } catch (error) {
    // Handle any errors that occur during data fetching
    res.status(500).json({ error: 'An error occurred getting total investemnt.' });
    console.error('Error fetching sum of product:', error);
  }
});

// Route to add funds for a specific user
router.put('/AddFunds', async (req, res) => {
  const { user_id, amount } = req.body;

  try {
    // Add funds for the user
    const result = await AddFundsUser(user_id, amount);
    res.json(result);
  } catch (error) {
    // Handle any errors that occur during the addition of funds
    res.status(400).json({ error: error.message });
  }
});

// Route to withdraw funds for a specific user
router.put('/WithdrawFunds', async (req, res) => {
  const { user_id, amount } = req.body;

  try {
    // Withdraw funds for the user
    const result = await WithdrawFundsUser(user_id, amount);
    res.json(result);
  } catch (error) {
    // Handle any errors that occur during the withdrawal of funds
    res.status(400).json({ error: error.message });
  }
});

// Route to get all stocks for a specific user on a given date
router.get("/GetAll", async (req, res) => {
  try {
    const { userId } = req.query; // Expecting date as an input parameter (e.g., ?date=2024-08-20)
    const date = new Date().toISOString().split('T')[0]
    const allStocks = await getAllStocks(userId, date) // Fetch all stocks for the user on the specified date

    // Respond with the list of stocks
    res.json({
      stocks: allStocks
    });
  } catch (error) {
    // Handle any errors that occur during the fetching of stocks
    res.status(500).json({ error: 'An error occurred getting total investemnt.' });
    console.error('Error fetching sum of product:', error);
  }
});

// Route to get performance graph data for a specific user over a specified timeframe
router.get("/GetPerformanceGraphData", async (req, res) => {
  try {
    //timeframe = 0,1,2 or 3 (1 week, 1 month, 6 month, 1 year)
    const { userId, timeframe } = req.query;

    // Get the start date based on the timeframe and the current date as the end date
    const start = await getDates(timeframe);
    const end = new Date().toISOString().split('T')[0];

    // Fetch historical wealth data for the user between the start and end dates
    const valuations = await calculateHistoricalWealth(userId, start, end);

    // Respond with the valuations data
    res.json(valuations);

  } catch (error) {
    // Handle any errors that occur during the fetching of graph data
    res.status(500).json({ error: 'An error occurred getting graph data.' });
    console.error('Error getting graph data:', error);
  }
});

// Route to fetch the top stocks for a specific user in a pie chart format
router.get('/StockPie', async (req, res) => {
  try {
    const userID = req.query.userId;
    const topStocks = await getStockPie(userID); // Fetch the top stocks for the user
    res.json(topStocks); // Respond with the top stocks data
  }
  catch (error) {
    // Handle any errors that occur during the fetching of top stocks
    res.status(500).json({ error: 'An error occurred fetching the top stocks.' });
  }
});

// Route to fetch the top sectors for a specific user in a pie chart format
router.get('/SectorPie', async (req, res) => {
  try {
    const userID = req.query.userId;
    const topSectors = await getSectorPie(userID); // Fetch the top sectors for the user
    res.json(topSectors); // Respond with the top sectors data
  }
  catch (error) {
    // Handle any errors that occur during the fetching of top sectors
    res.status(500).json({ error: 'An error occurred fetching the top sectors.' });
  }
});

// GET route to fetch user balance by userId
router.get('/Balance', async (req, res) => {
  const userId = req.query.userId;

  try {
    // Fetch the user's balance
    const balanceData = await getUserBalance(userId);

    // Respond with the balance data
    return res.status(200).json(balanceData);
  } catch (error) {
    // Handle any errors that occur during the fetching of balance data
    return res.status(500).json({ message: error.message });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;