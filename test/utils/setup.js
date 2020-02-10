module.exports = async () => {
	const {populateDatabase} = require('./index');

	await populateDatabase();
};