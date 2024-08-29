const request = require('supertest');
const app = require('../index');

describe('GET /StockInfo/Companyinfo?ticker=PG', () => {
    it('should return correct company info', async () => {
      const response = await request(app).get('/Stockinfo/Companyinfo').query({ ticker : 'PG' });
      expect(response.body).toEqual({
        "CompanyInfo": {
            "country": "US",
            "currency": "USD",
            "exchange": "NEW YORK STOCK EXCHANGE, INC.",
            "name": "Procter & Gamble Co",
            "ticker": "PG",
            "ipo": "1950-03-22T00:00:00.000Z",
            "marketCapitalization": "397194.60",
            "shareOutstanding": "2360.14",
            "logo": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PG.png",
            "phone": "15139831100",
            "weburl": "https://us.pg.com/",
            "finnhubIndustry": "Consumer products"
        }
    });
    });
});