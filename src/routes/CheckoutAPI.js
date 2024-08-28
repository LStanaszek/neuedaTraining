//CheckoutAPI.js file
const express = require('express');
const { purchaseStocks, sellStocks, getShareAmount } = require("../scripts/CheckoutScripts");

const router = express.Router();

// Endpoint to handle stock purchases
router.post('/BuyStocks', async (req, res) => {
    const { ticker, share_quantity, user_id } = req.body;

    try {
        // Call the function to add stock purchase
        const transaction = await purchaseStocks(ticker, share_quantity, user_id);
        res.status(201).json({
            message: 'Stock purchase recorded successfully',
            transaction,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint to handle selling stocks
router.post('/SellStocks', async (req, res) => {
    const { ticker, share_quantity, user_id } = req.body;

    try {
        // Call the function to sell stock
        const transaction = await sellStocks(ticker, share_quantity, user_id);
        res.status(201).json({
            message: 'Stock sale recorded successfully',
            transaction,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/GetShareAmount', async (req, res) => {
    try {
        const userID = req.query.userId;
        const ticker = req.query.ticker;

        const shareCount = await getShareAmount(userID, ticker);
        res.json(shareCount);
    } 
    catch (error) {
        res.status(500).json({ error: 'An error occurred fetching the top stocks.' });
    }
  });

module.exports = router;
