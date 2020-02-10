const mongoose = require('mongoose');

const WaitingListSchema = new mongoose.Schema({
	customerId: { type: String, required: true},
	name: { type: String, required: true },
}, {collection: 'waitinglist', timestamps: true});

const WaitingList = mongoose.model('WaitingList', WaitingListSchema);

module.exports = WaitingList;
