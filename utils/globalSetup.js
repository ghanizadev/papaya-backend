const config = require('../config/config.json');

module.exports = async () => {
	console.log('Intializing..');
	try{
		console.error('Config file found!');
		global.config = config;
		return;

	} catch(err){
		console.error('Error!', err);
	}

};
