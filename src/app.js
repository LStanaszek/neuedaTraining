const express = require('express');
//require("dotenv").config();
const bodyParser = require("body-parser");
const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('./utils/createDB');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
//app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const browseRoutes = require('./routes/DashboardAPI');
const stockInfo = require('/Users/Administrator/Documents/neuedaTraining/src/routes/StockInfoAPI');
const search = require('/Users/Administrator/Documents/neuedaTraining/src/routes/StockInfoAPI');

// Use routes
app.use('/Dashboard', browseRoutes);

app.use('/Stockinfo', stockInfo);

app.use('/SearchSuggestion', search);

sequelize.authenticate()
    .then(() => {
        console.log('Connection established successfully.');
    })
    .catch((err) => {
        console.error('Failed to connect:', err);
    });

app.listen(PORT, () => {
    console.log(`Server Running on localhost//:${PORT}`)
});