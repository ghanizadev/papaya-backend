const mongoose = require('mongoose');

const PizzaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		validate: {
			validator: value => value.length > 4,
			message: 'too short name'
		}
	},
	ref: {type: String, required: true},
	code: { type: Number, required: true, unique: true},
	description: { type: String, required: true },
	flavorLimit: {type: Number},
}, {collection: 'pizzas'});

const Pizza = mongoose.model('Pizza', PizzaSchema);

module.exports = Pizza;
