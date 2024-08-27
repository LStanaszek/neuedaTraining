//CheckoutAPI.js file
const express = require('express');
const { purchaseStocks, sellStocks } = require("../scripts/CheckoutScripts");

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
    const { stock_id, share_quantity, user_id } = req.body;

    try {
        // Call the function to sell stock
        const transaction = await sellStocks(stock_id, share_quantity, user_id);
        res.status(201).json({
            message: 'Stock sale recorded successfully',
            transaction,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
