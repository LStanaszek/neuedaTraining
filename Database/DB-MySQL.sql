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
    company_country VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    exchanges VARCHAR(255) NOT NULL,
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
('Pharmaceuticals'),
('Banking'),
('Retail'),
('Consumer products'),
('Energy'),
('Utilities'),
('Aerospace & Defense'),
('Chemicals'),
('Real Estate'),
('Media');

INSERT INTO stocks (stock_name, ticker, sector_id, company_country, currency, exchanges, web_url)
VALUES 
('Apple Inc.', 'AAPL', 1, 'USA', 'USD', 'NASDAQ', 'https://www.apple.com'),
('Microsoft Corp.', 'MSFT', 1, 'USA', 'USD', 'NASDAQ', 'https://www.microsoft.com'),
('Pfizer Inc.', 'PFE', 2, 'USA', 'USD', 'NYSE', 'https://www.pfizer.com'),
('JP Morgan Chase', 'JPM', 3, 'USA', 'USD', 'NYSE', 'https://www.jpmorganchase.com'),
('Exxon Mobil', 'XOM', 4, 'USA', 'USD', 'NYSE', 'https://corporate.exxonmobil.com'),
('Procter & Gamble', 'PG', 5, 'USA', 'USD', 'NYSE', 'https://www.pg.com');

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

INSERT INTO transactions (stock_id, trade_timestamp, share_quantity, stock_price, user_id)
VALUES 

(3, '2023-08-28', 75, 39.20, 1),
(1, '2023-09-04', 50, 148.30, 1),
(4, '2023-09-11', 90, 122.10, 1),
(6, '2023-09-18', 40, 143.70, 1),
(2, '2023-09-25', 65, 250.50, 1),
(5, '2023-10-02', 120, 101.85, 1),
(1, '2023-10-09', 60, 151.60, 1),
(3, '2023-10-16', 85, 40.05, 1),
(4, '2023-10-23', 75, 123.30, 1),
(2, '2023-10-30', 55, 249.25, 1),
(6, '2023-11-06', 45, 144.50, 1),
(5, '2023-11-13', 110, 99.75, 1),
(4, '2023-11-20', 80, 121.90, 1),
(1, '2023-11-27', 70, 152.20, 1),
(3, '2023-12-04', 95, 39.60, 1),
(2, '2023-12-11', 50, 247.80, 1),
(5, '2023-12-18', 100, 103.25, 1),
(6, '2023-12-25', 55, 141.45, 1),
(1, '2024-01-01', 90, 149.35, 1),
(4, '2024-01-08', 85, 122.40, 1),
(3, '2024-01-15', 80, 40.50, 1),
(2, '2024-01-22', 65, 251.10, 1),
(6, '2024-01-29', 60, 144.10, 1),
(5, '2024-02-05', 130, 100.90, 1),
(1, '2024-02-12', 75, 151.05, 1),

-- Big Selling Operation
(4, '2024-02-19', -300, 120.85, 1),
(1, '2024-02-19', -200, 151.05, 1),
(3, '2024-02-26', -400, 39.10, 1),

(2, '2024-03-04', 55, 248.95, 1),
(5, '2024-03-11', 110, 102.60, 1),

-- Additional Sell Operations in March
(6, '2024-03-18', -50, 142.30, 1),
(1, '2024-03-25', -75, 150.75, 1),

(3, '2024-04-01', 60, 40.20, 1),
(4, '2024-04-08', 100, 121.15, 1),
(2, '2024-04-15', 70, 250.80, 1),

-- Gradual Downward Slope Selling Operations
(1, '2024-04-15', -50, 149.75, 1),  -- Start of the downward slope
(2, '2024-04-22', -55, 250.10, 1),
(5, '2024-04-29', -60, 101.50, 1),
(6, '2024-05-06', -65, 144.20, 1),
(3, '2024-05-13', -70, 39.85, 1),
(4, '2024-05-20', -75, 122.00, 1),
(1, '2024-05-27', -80, 150.30, 1),
(2, '2024-06-03', -85, 249.50, 1),
(5, '2024-06-10', -90, 100.75, 1),

(4, '2024-06-24', 70, 121.90, 1),
(3, '2024-07-01', 105, 122.25, 1),
(2, '2024-07-08', 60, 248.50, 1),

-- Additional Sell Operation in July
(5, '2024-07-15', -130, 101.10, 1),

(6, '2024-07-22', 55, 146.25, 1),
(1, '2024-07-29', 100, 151.55, 1),
(4, '2024-08-05', 110, 120.40, 1),
(3, '2024-08-12', 80, 38.95, 1),
(2, '2024-08-19', 65, 249.60, 1),

-- 5 selling transactions spread over 4 weeks
(1, '2024-08-30', -50, 152.30, 1),  -- Sell 50 AAPL shares, 225 remaining
(2, '2024-09-05', -40, 247.00, 1),  -- Sell 40 MSFT shares, 20 remaining
(4, '2024-09-12', -10, 123.00, 1),  -- Sell 30 JPM shares, 120 remaining
(3, '2024-09-19', -60, 39.30, 1),   -- Sell 60 PFE shares, 220 remaining
(1, '2024-09-25', -15, 150.60, 1),  -- Sell 75 AAPL shares, 150 remaining

-- Additional selling transactions considering the stock availability
-- Ensuring not selling shares beyond what the user owns
(5, '2024-07-15', -130, 101.10, 1),  -- Sell 130 PG shares, 240 remaining
(5, '2024-04-29', -60, 101.50, 1),  -- Sold 60 PG shares, 180 remaining
(6, '2024-06-17', -95, 143.95, 1),  -- Sell 95 XOM shares, 0 remaining
(2, '2024-06-03', -85, 249.50, 1),  -- Sell 85 MSFT shares, 35 remaining
(3, '2024-06-10', -90, 100.75, 1), -- Sell 90 PFE shares, 130 remaining
(2, '2024-03-04', -55, 248.95, 1); -- Sell 55 MSFT shares, 0 remaining

 /*######################### Drop Tables #####################*/
-- DROP TABLE IF EXISTS Watchlist;
-- DROP TABLE IF EXISTS Transactions;
-- DROP TABLE IF EXISTS Stock;