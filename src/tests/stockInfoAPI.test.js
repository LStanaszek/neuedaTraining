const request = require('supertest');
const app = require('../app');

describe('GET /StockInfo/Companyinfo?ticker=PG', () => {
    it('should return correct company info', async () => {
      const response = await request(app).get('/Stockinfo/Companyinfo').query({ industry: 'PG' });
      expect(response.body).toEqual([
        { symbol: 'AAPL', industry: 'tech' },
        { symbol: 'GOOG', industry: 'tech' }
      ]);
    });
});