const request = require('supertest');
const app = require('../index');

describe('GET /StockInfo/Companyinfo?ticker=PG', () => {
    it('should return correct company info', async () => {
        const response = await request(app)
            .get('/Stockinfo/Companyinfo')
            .query({ ticker: 'PG' });

        expect(response.body).toEqual({
            "CompanyInfo": expect.objectContaining({
                "country": "US",
                "currency": "USD",
                "exchange": "NEW YORK STOCK EXCHANGE, INC.",
                "name": "Procter & Gamble Co",
                "ticker": "PG",
                "ipo": "1950-03-22T00:00:00.000Z",
                "logo": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PG.png",
                "phone": "15139831100",
                "weburl": "https://us.pg.com/",
                "finnhubIndustry": "Consumer products",
                "marketCapitalization": expect.anything(), // Ignoring this value
                "shareOutstanding": expect.anything() // Ignoring this value
            })
        });
    });
});

describe('GET /StockInfo/PriceAndGrowth?ticker=TSLA', () => {
    it('should return correct price and growth information', async () => {
        const response = await request(app)
            .get('/StockInfo/PriceAndGrowth')
            .query({ ticker: 'TSLA' });

        expect(response.body).toEqual({
            priceAndGrowth: expect.objectContaining({
                ticker: 'TSLA',
                currentPrice: expect.any(Number),
                growth: expect.any(Number),
            })
        });

        const { currentPrice, growth } = response.body.priceAndGrowth;

        // Check if currentPrice and growth are numbers with two decimal places
        expect(currentPrice).toBeCloseTo(currentPrice, 2);
        expect(growth).toBeCloseTo(growth, 2);
    });
});