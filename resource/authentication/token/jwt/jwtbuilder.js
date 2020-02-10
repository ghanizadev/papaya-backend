/* eslint-disable prefer-promise-reject-errors */
const uuid = require('uuid/v3');

const crypto = require('crypto');
const { comparePassword } = require('../../utils');

const {User} = require('../../../../model');

const stringify = (load, base64) => {
	let result;

	if (typeof load === 'object') result = JSON.stringify(load);

	if (base64) {
		return load
			.replace(/=+$/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
	}

	return Buffer.from(result)
		.toString('base64')
		.replace(/=+$/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

module.exports = class JWTBuilder {

	constructor(email = '', password = '') {
		this.password = password;
		this.email = email;
		this.alg = 'HS256';
		this.authorities = ['READ'];
		this.exp = 900000;

		this.err = '';
	}

	getJWT() {
		return new Promise((resolve, reject) => {

			if (!this.email || !this.password) {
				return reject({
					status: 403,
					error: 'invalid_credentials',
					error_description: 'username or password missing',
				});
			}
			if (this.email === '' || this.password === '') {
				return reject({
					status: 403,
					error: 'invalid_credentials',
					error_description: 'username or password can be empty or null',
				});
			}

			const query = User.findOne({ email: this.email });
			query.exec()
				.then(doc => {
					if (!doc || !comparePassword(this.password, doc.password)) {
						return reject({
							status: 403,
							error: 'invalid_credentials',
							error_description: 'check your username and password',
						});
					}

					this.authorities = doc.authorities;
					this.generate();

					resolve(this);
				
				}).catch(reject);
		});
	}

	header() {
		const header = {
			alg: this.alg,
			typ: 'JWT',
		};
		return stringify(header);
	}

	payload() {
		this.jti = uuid('http://localhost:8080', uuid.URL);
		this.iat = new Date().getTime();

		const payload = {
			jti: this.jti,
			iat: this.iat,
			exp: this.exp,
			authorities: this.authorities,
			email: this.email,
		};

		this.iat = payload.iat;

		return stringify(payload);
	}

	generate() {
		const payload = this.payload();
		const body = `${this.header()}.${payload}`;

		const hmac = crypto.createHmac('sha256', global.secret);

		hmac.update(body);
		const signature = hmac.digest('base64');

		this.token = `${body}.${stringify(signature, true)}`;

		const refresh_payload = {
			jti: this.jti,
			email: this.email,
			exp: this.exp,
		};

		const refresh_body = `${this.header()}.${stringify(refresh_payload)}`;

		const refresh_hmac = crypto.createHmac('sha256', global.secret);

		refresh_hmac.update(refresh_body);
		const refresh_signature = refresh_hmac.digest('base64');

		this.refresh_token = `${refresh_body}.${stringify(refresh_signature, true)}`;
	}
};
