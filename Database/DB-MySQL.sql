/*######################### Create Schema #####################*/

DROP DATABASE IF EXISTS Portfolio_Management;
CREATE DATABASE Portfolio_Management;
USE Portfolio_Management;

/*######################### Create Tables #####################*/

CREATE TABLE IF NOT EXISTS sectors (
	sector_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS stocks (
	stock_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    stock_name VARCHAR(255) NOT NULL,
    ticker VARCHAR(10) NOT NULL UNIQUE,
    sector_id INTEGER NOT NULL,
    num_employees INTEGER NOT NULL,
    -- tbd for other info
    company_country VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    exchange VARCHAR(255) NOT NULL,
    web_url VARCHAR (255) NOT NULL,
    FOREIGN KEY (sector_id) REFERENCES sectors (sector_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watchlist (
	watch_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    stock_id INTEGER NOT NULL,
    FOREIGN KEY(stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
	user_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
	trade_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    trade_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stock_id INTEGER NOT NULL,
    share_quantity INTEGER NOT NULL,
    stock_price DECIMAL(10, 2) NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(stock_id) REFERENCES stocks(stock_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

/*######################### Insert into Tables #####################*/
INSERT INTO sectors (sector_name)
VALUES 
('Technology'),
('Healthcare'),
('Finance'),
('Energy'),
('Consumer Goods');

INSERT INTO stocks (stock_name, ticker, sector_id, num_employees)
VALUES 
('Apple Inc.', 'AAPL', 1, 147000, 'USA', 'USD', 'NASDAQ', 'https://www.apple.com'),
('Microsoft Corp.', 'MSFT', 1, 181000, 'USA', 'USD', 'NASDAQ', 'https://www.microsoft.com'),
('Pfizer Inc.', 'PFE', 2, 78000, 'USA', 'USD', 'NYSE', 'https://www.pfizer.com'),
('JP Morgan Chase', 'JPM', 3, 255351, 'USA', 'USD', 'NYSE', 'https://www.jpmorganchase.com'),
('Exxon Mobil', 'XOM', 4, 63000, 'USA', 'USD', 'NYSE', 'https://corporate.exxonmobil.com'),
('Procter & Gamble', 'PG', 5, 101000, 'USA', 'USD', 'NYSE', 'https://www.pg.com');

INSERT INTO watchlist (stock_id)
VALUES 
(1),
(2),
(3);

INSERT INTO users (username, balance)
VALUES 
('john_doe', 50000.0000),
('jane_smith', 150000.0000),
('alice_jones', 75000.0000);

INSERT INTO transactions (stock_id, share_quantity, stock_price, user_id)
VALUES 
(1, 100, 150.50, 1),
(1, -50, 220.30, 1),
(3, 200, 38.75, 1),
(4, 150, 125.00, 1),
(3, 80, 56.60, 1);

/*######################### Drop Tables #####################*/
-- DROP TABLE IF EXISTS Watchlist;
-- DROP TABLE IF EXISTS Transactions;
-- DROP TABLE IF EXISTS Stock;