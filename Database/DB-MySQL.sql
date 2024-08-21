/*######################### Create Schema #####################*/

CREATE DATABASE IF NOT EXISTS Portfolio_Management;
USE Portfolio_Management;


/*######################### Create Tables #####################*/

CREATE TABLE IF NOT EXISTS Stock (
	stock_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    stock_name VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    company_info VARCHAR(255),
    num_employees INTEGER
);

CREATE TABLE IF NOT EXISTS Watchlist (
	watch_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    stock_id INTEGER,
    FOREIGN KEY(stock_id) REFERENCES Stock(stock_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Portfolio (
	trade_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    trade_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    stock_id INTEGER,
    share_quantity INTEGER NOT NULL,
    stock_price DECIMAL(10, 4) NOT NULL,
    FOREIGN KEY(stock_id) REFERENCES Stock(stock_id) ON DELETE CASCADE
);

/*######################### Drop Tables #####################*/
-- DROP TABLE IF EXISTS Stock;
-- DROP TABLE IF EXISTS Watchlist;
-- DROP TABLE IF EXISTS Portfolio;