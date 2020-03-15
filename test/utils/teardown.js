module.exports = async () => {
	const {close} = require('./db');

	await close();
};
