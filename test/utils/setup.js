module.exports = async () => {
	const {populateDatabase} = require('./db');

	await populateDatabase();
};
