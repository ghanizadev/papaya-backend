const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true}
}, { collection: 'items' });

const Item = mongoose.model('Item', ItemSchema);


module.exports = Item;
