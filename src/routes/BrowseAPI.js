//BroweAPI.js file
const express = require('express');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');
const { 
    getStockPriceData, 
    getWatchlist, 
    deleteStockFromWatchlist, 
    addStockToWatchlist,
    getTopGainers,
    getTopLosers 
} = require('../scripts/BrowseScripts');
const { getDates } = require('../scripts/DashboardScripts');

const router = express.Router();

/***************************************** Browse endpoints ********************************/

//GET historical data from external API given stock ticker and invertal of closing price for intervals 1m, 60m,.. 1mo
router.get('/Historical', async (req, res) => {
    // timeframe key=> 0:1W , 1:1mo 2:6mo, 3:1y, 
    const { ticker, timeframe } = req.query;

    const start = await getDates(timeframe);
    const end = new Date().toISOString().split('T')[0];

    const interval = '1d'

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
        const watchlist = await getWatchlist();
        res.json(watchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'An error occurred while fetching the watchlist.' });
    }
});

// DELETE a stock from the Watchlist table
router.delete('/watchlist/delete', async (req, res) => {
    try {
        const watchID = req.query.watchID
        await deleteStockFromWatchlist(watchID);
        res.status(200).json({message: `Successfully deleted WatchID: ${watchID}`});
    } catch (error) {
        console.error('Error deleting stock from watchlist:', error);
        res.status(500).json({ error: 'An error occurred while deleting stock from watchlist.' });
    }
});

// POST add a stock to the Watchlist table

router.post('/watchlist/add', async (req, res) => {
    try {
        const stockID = req.query.stockID;

        if (!stockID) {
            return res.status(400).json({ error: 'stockID is required' });
        }

        const result = await addStockToWatchlist(stockID);

        // Flag if stock is already in the watchlist
        if (result.message) {
            return res.status(409).json({ message: result.message });
        }

        res.status(201).json({ message: `Successfully added StockID: ${stockID}` });
    } catch (error) {
        console.error('Error adding stock to watchlist:', error);
        res.status(500).json({ error: 'An error occurred while adding stock to watchlist.' });
    }
});

// GET list of Top Gainers from external API
router.get('/top-gainers', async (req, res) => {
    try {
        const topGainers = await getTopGainers(); // Implement this function in BrowseScripts.js
        res.json(topGainers);
    } catch (error) {
        console.error('Error fetching Top Gainers:', error);
        res.status(500).json({ error: 'An error occurred while fetching Top Gainers.' });
    }
});

// GET list of Top Losers from external API
router.get('/top-losers', async (req, res) => {
    try {
        const topLosers = await getTopLosers(); // Implement this function in BrowseScripts.js
        res.json(topLosers);
    } catch (error) {
        console.error('Error fetching Top Losers:', error);
        res.status(500).json({ error: 'An error occurred while fetching Top Losers.' });
    }
});

module.exports = router;