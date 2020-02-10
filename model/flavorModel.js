const mongoose = require('mongoose');

const FlavorSchema = new mongoose.Schema({
	code: {type: String, required: true, unique: true},
	name: { type: String, required: true },
	description: { type: [String], require: true },
	group: {type: String, required: true},
	variation: {type: String},
	provider: {type: String, default: 'LASOLANA'},
	small: {type: Number, required: true},
	medium: {type: Number, required: true},
	large: {type: Number, required: true},
});

const Flavor = mongoose.model('Flavor', FlavorSchema);

module.exports = Flavor;
