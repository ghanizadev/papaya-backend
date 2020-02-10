const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
	value: {type: Number, required: true},
	member: {type: String, default: 'Geral'},
	method: {type: String, enum: ['DINHEIRO', 'CREDITO', 'DEBITO', 'ALIMENTACAO', 'VALE'], required: true},
	authorizationId: {type: String, required: true},
	authorizationDate: {type: Number, required: true},
	document: {type: String},
	operator: {type: String, default: 'ADMIN'}
}, {collection: 'payments', timestamps: true});

module.exports = mongoose.model('Payment', PaymentSchema);
