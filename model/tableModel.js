const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
	number: { type: String, required: true, unique: true },
	customer: {type: String, default: 'Visitante'},
	status: {
		type: String,
		enum: ['FREE', 'BUSY', 'WAITING_PAYMENT', 'RESERVED', 'ON_HOLD'],
		default: 'FREE'
	},
	order: {type: Object},
	orderId: {type: String, required: true}
}, { collection: 'tables', timestamps: true });

module.exports = mongoose.model('Table', TableSchema);
