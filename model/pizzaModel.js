const mongoose = require('mongoose');

const PizzaSchema = new mongoose.Schema({
	title: { 
		type: String, 
		required: true,
		validate: {
			validator: value => value.length > 4,
			message: 'too short name'
		}
	},
	code: { type: Number, required: true, unique: true},
	description: { type: String, require: true },
	flavorLimit: {type: Number},
});

const Pizza = mongoose.model('Pizza', PizzaSchema);

module.exports = Pizza;
