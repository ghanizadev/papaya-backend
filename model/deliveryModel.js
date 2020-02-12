const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
	orderId: { type: String, required: true},
	customer: { type: String, default: 'Visitante' },
	paymentMethod: {
		type: String,
		enum: ['CREDITO', 'DEBITO', 'DINHEIRO', 'ALIMENTACAO/REFEICAO'],
		required: true,
	},
	address: {
		type: Object,
		required: true,
		validate: {
			validator: value => (value.street && value.district && value.number),
			message: 'invalid address, it must contain street, distric and number at least'
		},
	},
	order: {type: Object },
	delivered: { type: Boolean, default: false },
	deliveredAt: Date,
	additionals: {type: String}

}, {collection: 'deliveries', timestamps: true});

const Delivery = mongoose.model('Delivery', DeliverySchema);
module.exports = Delivery;
