const bcrypt = require('bcrypt');
const {Client} = require('../../../model');

const checkCredentials = (authorization) => new Promise(async (resolve, reject) => {
	if (authorization &&
		typeof authorization === 'string' &&
		authorization.toUpperCase().startsWith('BASIC')) {

		const base64 = authorization.substring(5);
		const decoded = Buffer.from(base64, 'base64').toString('utf8');

		const clientId = decoded.substring(0, decoded.indexOf(':'));
		const clientSecret = decoded.substring(decoded.indexOf(':') + 1);

		const query = Client.findOne({ clientId });
		
		return query.exec()
			.then(foundClient => {
				if (foundClient && foundClient.clientSecret === clientSecret)
					resolve(foundClient);
				else
					reject({status: 400, error: 'invalid_credentials', error_description: 'client ID and client secret does not match'});
			}).catch(reject);
	}else 
		reject({status: 400, error: 'invalid_auth_type', error_description: 'auth type is not Basic'});
});


const encryptPassword = (password) => bcrypt.hashSync(password, '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq');

const comparePassword = (password, encryptedPasswordToCompareTo) => encryptedPasswordToCompareTo === encryptPassword(password);

module.exports = {
	comparePassword, encryptPassword, checkCredentials
};
