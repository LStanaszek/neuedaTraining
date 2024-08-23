//BroweAPI.js file
const express = require('express');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');
const { getStockPriceData, getWatchlistWithPrices } = require('../scripts/BrowseScripts');

const router = express.Router();

/***************************************** Browse endpoints ********************************/

//GET historical data from external API given stock ticker and invertal of closing price for intervals 1m, 60m,.. 1mo
router.get('/Historical', async (req, res) => {
    //const { ticker } = req.params;
    const { ticker, interval = '1d', start, end } = req.query;

    try {
        const data = await getStockPriceData(ticker, interval, start, end);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'BrowseAPI: An error occurred while fetching data.' });
    }
});

// GET list of stocks in Watchlist table
router.get('/watchlist', async (req, res) => {
    try {
        const watchlistWithPrices = await getWatchlistWithPrices();
        res.json(watchlistWithPrices);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'An error occurred while fetching the watchlist.' });
    }
});

module.exports = router;
