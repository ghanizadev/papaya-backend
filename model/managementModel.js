const mongoose = require('mongoose');

const ManagementSchema = new mongoose.Schema({
	hash: {type: String, required: true, unique: true},
	opened: {type: Boolean, default: true},
	tables: { type: String, required: true},
	amount: {type: Number, required: true},
	email: {type: String, required: true},
	incomes: { type: [Object], default: [] },
	outgoings: { type: [Object], default: [] }
}, { collection: 'management', timestamps: true });

const Management = mongoose.model('Management', ManagementSchema);

module.exports = Management;
