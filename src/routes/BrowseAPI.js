//BroweAPI.js file
const express = require('express');
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const { Watchlist, Stock } = require('../utils/createDB');
const { getStockPriceData, getWatchlist, deleteStockFromWatchlist } = require('../scripts/BrowseScripts');

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
        const watchlist = await getWatchlist();
        res.json(watchlist);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'An error occurred while fetching the watchlist.' });
    }
});

router.delete('/watchlist-delete', async (req, res) => {
    try {
        const watchID = req.query.watchID
        await deleteStockFromWatchlist(watchID);
        res.status(200).json({message: `Successfully deleted WatchID: ${watchID}`});
    } catch (error) {
        console.error('Error deleting stock from watchlist:', error);
        res.status(500).json({ error: 'An error occurred while deleting stock from watchlist.' });
    }
});

router.delete('/watchlist-delete', async (req, res) => {
    try {
        const watchID = req.query.watchID
        await deleteStockFromWatchlist(watchID);
        res.status(200).json({message: `Successfully deleted WatchID: ${watchID}`});
    } catch (error) {
        console.error('Error deleting stock from watchlist:', error);
        res.status(500).json({ error: 'An error occurred while deleting stock from watchlist.' });
    }
});

module.exports = router;