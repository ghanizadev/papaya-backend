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
	price: {type: Number, required: true},
	provider: { type: String, required: true },
	price: {type: Number, required: true},
	basePrice: {type: Number, required: true},
}, { collection: 'products', timestamps: true });

ProductSchema.pre('save', function(next) {
	this.ref = `${this.group}${this.subgroup}${this.variation}`;
	next();
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
