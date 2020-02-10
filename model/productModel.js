const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
	code: { type: String, required: true, unique: true },
	ref: { type: String, required: true, unique: true },
	title: { type: String, required: true },
	description: { type: [String] },
	group: {type: String, default: '00'},
	subgroup: {type: String, default: '00'},
	variation: {type: String, default: '00'},
	unity: {type: String, enum:['UN', 'FD', 'KG', 'PCT', 'CX', 'LT'], default: 'UN'},
	provider: { type: String, required: true, default: 'LA SOLANA' },
	price: {type: Object, required: true},
}, { collection: 'products', timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product ;
