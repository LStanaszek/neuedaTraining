const {Sequelize, DataTypes} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

const Sector = sequelize.define('Sector', {
    sector_id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull:false, primaryKey: true},
    sector_name: {type: DataTypes.STRING(255), allowNull: false, unique: true},
    }, {
    tableName:'sectors',
    timestamps:false
  });

const Stock = sequelize.define('Stock', {
    stock_id : {type: DataTypes.INTEGER, autoIncrement:true, allowNull:false, primaryKey:true},
    stock_name : {type: DataTypes.STRING, allowNull:false},
    ticker : {type: DataTypes.STRING, allowNull:false, unique:true},
    sector_id : {type: DataTypes.INTEGER, allowNull:false, references: {model: Sector, key: 'sector_id'}, onDelete: 'CASCADE'},
    num_employees : {type: DataTypes.INTEGER, allowNull:false},
    company_country: { type: DataTypes.STRING(255), allowNull: true }, // New column for country
    currency: { type: DataTypes.STRING(10), allowNull: true }, // New column for currency
    exchange: { type: DataTypes.STRING(255), allowNull: true }, // New column for exchange
    weburl: { type: DataTypes.STRING(255), allowNull: true } // New column for web URL
    }, {
    tableName:'stocks',
    timestamps:false
});

Sector.hasMany(Stock, { foreignKey: 'sector_id' });
Stock.belongsTo(Sector, { foreignKey: 'sector_id' });

const Watchlist = sequelize.define('Watchlist', {
    watch_id : {type: DataTypes.INTEGER, autoIncrement:true, allowNull:false, primaryKey:true},
    stock_id : {type: DataTypes.INTEGER, allowNull:false, references: {model: Stock, key: 'stock_id'}, onDelete: 'CASCADE'},
    }, {
    tableName:'watchlist',
    timestamps:false
});

Stock.hasMany(Watchlist, { foreignKey: 'stock_id' });
Watchlist.belongsTo(Stock, { foreignKey: 'stock_id' });

const User = sequelize.define('User', {
    user_id : {type: DataTypes.INTEGER, autoIncrement:true, allowNull:false, primaryKey:true},
    username : {type: DataTypes.STRING, allowNull:false},
    balance : {type: DataTypes.DECIMAL(10,2), allowNull:false},
    }, {
    tableName:'users',
    timestamps:false
});

const Transaction = sequelize.define('Transaction', {
    trade_id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,},
    trade_timestamp: {type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false,},
    stock_id: {type: DataTypes.INTEGER, allowNull: false, references: { model: Stock, key: 'stock_id',}, onDelete: 'CASCADE',},
    share_quantity: {type: DataTypes.INTEGER, allowNull: false,},
    stock_price: {type: DataTypes.DECIMAL(10, 2), allowNull: false,},
    user_id: {type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'user_id',}, onDelete: 'CASCADE', },
  } , {
    tableName:'transactions',
    timestamps:false
});
  
  Stock.hasMany(Transaction, { foreignKey: 'stock_id' });
  User.hasMany(Transaction, { foreignKey: 'user_id' });
  Transaction.belongsTo(Stock, { foreignKey: 'stock_id' });
  Transaction.belongsTo(User, { foreignKey: 'user_id' });

  sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });

module.exports = {
  sequelize,
  Sector,
  Stock,
  Watchlist,
  User,
  Transaction,
};