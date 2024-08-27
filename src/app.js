const express = require('express');
require("dotenv").config();
const cors = require('cors');
const bodyParser = require("body-parser");
const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('./utils/createDB');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

const stockInfo = require('./routes/StockInfoAPI');
const search = require('./routes/StockInfoAPI');
//const browseRoutes = require('./routes/sectorRoutes');
const dashboardRoutes = require('./routes/DashboardAPI');
const browseRoutes = require('./routes/BrowseAPI');

// Use routes
//app.use('/sectors', sectorRoutes);
app.use('/Dashboard', dashboardRoutes);
app.use('/Browse', browseRoutes);
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