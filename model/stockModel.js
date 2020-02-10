const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
	code: { type: String, required: true, unique: true },
	description: { type: String, required: true },
	expiringDate: Date,
	provider: { type: String, required: true },
	price: {type: Number, required: true}
}, { collection: 'stock' });

const Stock = mongoose.model('Stock', StockSchema);


module.exports = Stock ;
