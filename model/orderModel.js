const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
	orderId: { type: String, unique: true },
	user: { type: String, default:'ADMIN' },
	serviceTax: {type:Number, default: 0},
	items: {type: [Object] },
	total: {type:Number, default: 0},
	final: {type:Number, default: 0},
	paid: {type:Number, default: 0},
	remaining: {type:Number, default: 0},
	change: {type: Number, default: 0},
	payments: {type: [Object]},
	closed: {type: Boolean, default: false},
	checkoutAt: {type: Date},
	toDeliver: {type: Boolean, default: false}
}, { collection: 'orders', timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
