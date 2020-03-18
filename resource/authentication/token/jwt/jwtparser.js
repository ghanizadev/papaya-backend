const crypto = require('crypto');
const {User} = require('../../../../model');

const stringify = (load) => load
	.replace(/=+$/g, '')
	.replace(/\+/g, '-')
	.replace(/\//g, '_');

module.exports = class JWTParser {
	constructor(jwt) {
		this.jwt = jwt || '';
		this.content = this.parse();
		this.isValid = true;
		this.isExpired = false;
	}

	static verify(access_token, refresh_token = ''){
		const accessTokenBody = this.parse(access_token);

		if (refresh_token === ''){
			return accessTokenBody.isValid
				&& !accessTokenBody.isExpired;
		}

		const refreshTokenBody = this.parse(refresh_token);

		return accessTokenBody.isValid
				&& !accessTokenBody.isExpired
				&& refreshTokenBody.isValid
				&& !refreshTokenBody.isExpired
				&& refreshTokenBody.jti === accessTokenBody.jti
				&& refreshTokenBody.email === accessTokenBody.email;

	}

	getContent() {
		return this.content;
	}

	isValid() {
		return this.content.isValid;
	}

	isExpired() {
		return this.content.isExpired;
	}

	getUserData(){
		return new Promise((resolve, reject) => {
			if(this.content && this.content.email){
				User.findOne({ email: this.content.email }, (findError, foundUser) => {
					if(!foundUser || findError) {
						reject({status: 500, error: 'internal_error', error_description:  'failed to query user data'});
						
					}

					resolve(foundUser);
					
				});
			}else reject({status: 400, error: 'invalid_token', error_description: 'your token is not valid, null, or corrupted, please, get a new one'});
		});
	}

	parse(jwt = this.jwt) {
		let result = {
			iat: 0,
			iss: '',
			exp: 0,
			username: '',
			email: '',
			authorities: [{}],
		};

		try {
			const raw = jwt.split('.');
			const signature = raw[2];
			const body = `${raw[0]}.${raw[1]}`;

			const hmac = crypto.createHmac('sha256', global.secret);
			hmac.update(body);
			const verify = stringify(hmac.digest('base64'));

			if (signature === verify) {
				result = JSON.parse(Buffer.from(raw[1], 'base64').toString('ascii'));
				result.isValid = true;
			} else {
				result.isValid = false;
			}

			if (result.iat + result.exp < new Date().getTime()) {
				result.isExpired = true;
			} else {
				result.isExpired = false;
			}
		} catch (e) {
			this.isExpired = false;
			this.isValid = false;
		}
		return result;
	}
};
