const express = require('express');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;

const router = express.Router();

// Individual routes
router.get('/historical/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const { interval = '1d', start = '2023-01-01', end = '2023-12-31' } = req.query;

    try {
        // Convert start and end dates to UNIX timestamps
        const period1 = new Date(start).getTime() / 1000;
        const period2 = new Date(end).getTime() / 1000;

        const historical = await yahooFinance.historical(ticker, {
            interval, // '1m', '5m', '15m', '1d', '1wk', '1mo'
            period1,
            period2,
        });

        console.log(historical);
        res.json(historical);
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ error: 'An error occurred while fetching historical data.' });
    }
});

module.exports = router;
