const {sequelize, Sector, Stock, Watchlist, User, Transaction} = require('../utils/createDB');

async function getTotalInvestment() {
    try {
        const result = await Transaction.findOne({
        attributes: [
        [sequelize.fn('SUM', sequelize.literal('share_quantity * stock_price')), 'totalValue']
        ]
        });
  
        console.log('Total Value:', result.get('totalValue'));
        return result.get('totalValue');
    } 
    catch (error) {
        console.error('Error fetching sum of product:', error);
    }
}

module.exports = {
    getTotalInvestment
}