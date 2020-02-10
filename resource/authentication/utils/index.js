const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { JWTParser } = require('../token');

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', false);

const {Client} = require('../../../model');

const parseAuthorization = (header = '') => {
	const result = {
		type: '',
		value: {},
	};

	if (header.startsWith('Basic')) {
		const base64 = header.substring(5);
		const decoded = Buffer.from(base64, 'base64').toString('utf8');

		const username = decoded.substring(0, decoded.indexOf(':'));
		const password = decoded.substring(decoded.indexOf(':') + 1);

		result.type = 'basic';
		result.value.username = username;
		result.value.password = password;
	}

	if (header.startsWith('Bearer')) {
		const jwt = header.substring(7);

		const jtwParser = new JWTParser(jwt);

		const content = jtwParser.getContent();

		result.type = 'bearer';
		result.value.username = content.username;
		result.value.password = content.password;
	}

	return result;
};

const checkCredentials = (authorization = '') => new Promise((resolve, reject) => {
	if (authorization.toUpperCase().startsWith('BASIC')) {

		const base64 = authorization.substring(5);
		const decoded = Buffer.from(base64, 'base64').toString('utf8');

		const clientId = decoded.substring(0, decoded.indexOf(':'));
		const clientSecret = decoded.substring(decoded.indexOf(':') + 1);

		Client.findOne({ clientId }, (fetchError, document) => {
			if (fetchError)
				reject({status: 400, error: 'invalid_credentials', error_description: fetchError.message});
			if (document && document.clientSecret === clientSecret)
				resolve(document);
			else
				reject({status: 400, error: 'invalid_credentials', error_description: 'client ID and client secret does not match'});
		});
	}else 
		reject({status: 400, error: 'invalid_auth_type', error_description: 'auth type is not Basic'});
});

const arrayEquals = (authorities = [], required = []) => {
	let count = 0;
	for (let i = required.length; i--;) {
		if (authorities.includes(required[i])) count++;
	}
	if (count === required.length) return true;

	return false;
};


const encryptPassword = (password) => bcrypt.hashSync(password, '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq');

const comparePassword = (password, encryptedPasswordToCompareTo) => encryptedPasswordToCompareTo === encryptPassword(password);

module.exports = {
	parseAuthorization, comparePassword, encryptPassword, checkCredentials, arrayEquals
};
