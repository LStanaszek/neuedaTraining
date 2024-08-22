const express = require('express');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;

const router = express.Router();

/***************************************** Browse endpoints ********************************/

//GET historical data given stock ticker and invertal of closing price for intervals 1m, 60m,.. 1mo
router.get('/historical/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const { interval = '1d', start, end } = req.query;

    try {
        let data;
        
        const intradayIntervals = ['1m', '2m', '5m', '15m', '30m', '60m'];
        if (intradayIntervals.includes(interval)) {
            // Use the 'chart' module if intraday intervals
            data = await yahooFinance.chart(ticker, {
                interval,
                period1: start,
                period2: end,
            });
        } else {
            // Use the 'historical' module if interval larger than a day
            data = await yahooFinance.historical(ticker, {
                period1: start,
                period2: end,
                interval,
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});


module.exports = router;
