const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
	code: {type: String, required: true, unique: true},
	profit: {type: Number},
	quantity: {type: Number, default: 0},
	toCome: {type: Number, default: 0},
	toGo: {type: Number, default: 0}
}, { collection: 'stock', timestamps: true });

const Stock = mongoose.model('Stock', StockSchema);

module.exports = Stock ;
