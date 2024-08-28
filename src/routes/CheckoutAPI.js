// Import necessary modules
const express = require('express');
const { purchaseStocks, sellStocks, getShareAmount } = require("../scripts/CheckoutScripts");

// Create a new Express router
const router = express.Router();

// Individual routes

// Endpoint to handle stock purchases
router.post('/BuyStocks', async (req, res) => {
    const { ticker, share_quantity, user_id } = req.body; // Extract relevant fields from the request body

    try {
        // Call the function to add stock purchase
        const transaction = await purchaseStocks(ticker, share_quantity, user_id);

        // Respond with success message and transaction details
        res.status(201).json({
            message: 'Stock purchase recorded successfully',
            transaction,
        });
    } catch (error) {
        // Handle errors by sending a 400 status code and logging the error message
        res.status(400).json({ message: error.message });
    }
});

// Endpoint to handle selling stocks
router.post('/SellStocks', async (req, res) => {
    const { ticker, share_quantity, user_id } = req.body; // Extract relevant fields from the request body

    try {
        // Call the function to sell stock
        const transaction = await sellStocks(ticker, share_quantity, user_id);

        // Respond with success message and transaction details
        res.status(201).json({
            message: 'Stock sale recorded successfully',
            transaction,
        });
    } catch (error) {
        // Handle errors by sending a 400 status code and logging the error message
        res.status(400).json({ message: error.message });
    }
});

// Endpoint to retrieve the number of shares a user owns for a specific stock
router.get('/GetShareAmount', async (req, res) => {
    try {
        const userID = req.query.userId; // Extract user ID from query parameters
        const ticker = req.query.ticker; // Extract ticker symbol from query parameters

        // Call the function to get the share amount
        const shareCount = await getShareAmount(userID, ticker);

        // Respond with the share count
        res.json(shareCount);
    }
    catch (error) {
        // Handle errors by sending a 500 status code and logging the error message
        res.status(500).json({ error: 'An error occurred fetching the top stocks.' });
    }
});

// Export the router for use in the main application
module.exports = router;
