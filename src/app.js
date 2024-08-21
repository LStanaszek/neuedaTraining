const express = require('express');
require("dotenv").config();
const axios = require("axios");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const {Sequelize, DataTypes} = require("sequelize");

app.use(express.json());
//app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.listen(PORT, () => {
    console.log(`Server Running on localhost//:${PORT}`)
});