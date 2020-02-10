const mongoose = require('mongoose');

const cpfRegex = /([0-9]{2}[.]?[0-9]{3}[.]?[0-9]{3}[/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[.]?[0-9]{3}[.]?[0-9]{3}[-]?[0-9]{2})/;

const CustomerSchema = new mongoose.Schema({
	customerId: { type: String, unique: true },
	name: { type: String, required: true, minlength: 3 },
	address: { type: String, required: true },
	cpf: {
		type: String,
		unique: true,
		required: true,
		validate: { validator: (item) => cpfRegex.test(item), message: 'invalid cpf' },
	},
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	historic: [{ type: String }],
}, {collection: 'customers', timestamps: true});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
