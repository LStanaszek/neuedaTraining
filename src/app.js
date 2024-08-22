const express = require('express');
//require("dotenv").config();
const axios = require("axios");
const bodyParser = require("body-parser");
const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('./utils/createDB');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const browseRoutes = require('./routes/DashboardAPI');

// Use routes
app.use('/Dashboard', browseRoutes);

sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully.');
    })
    .catch((err) => {
        console.error('Failed to connect:', err);
    });

    /* Test Query
app.get('/', async (req, res) => {
        try {
          const watchlist = await Watchlist.findAll();
          res.json(watchlist);
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while fetching sectors.' });
        }
      });
    */

app.listen(PORT, () => {
    console.log(`Server Running on localhost//:${PORT}`)
});