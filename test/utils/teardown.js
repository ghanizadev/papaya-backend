module.exports = async () => {
	const {close} = require('./index');

	await close();
};