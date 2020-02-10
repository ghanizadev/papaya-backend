const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
	clientId: { type: String, required: true, unique: true },
	clientSecret: { type: String, required: true },
	grantTypes: { type: [String], default: ['password'] },
	scopes: { type: [String], default: ['password'] },
}, { collection: 'clients', timestamps: true});

module.exports = mongoose.model('Client', ClientSchema);
