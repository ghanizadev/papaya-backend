const router = require('express').Router();
const { JWTBuilder } = require('../token');
const Client = require('../../../model').Client;
const {saveDocument} = require('../../utils');

const { checkCredentials } = require('../utils');

/**
 * TOKEN endpoint - POST /oauth/token
 */
router.post('/token', async (req, res, next) => {

	const  { body } = req;

	if (!req.is('application/x-www-form-urlencoded')) {

		return next({
			status: 400,
			error: 'invalid_content_type',
			error_description: 'content-type not allowed for this route',
		});
	}

	if (!req.headers.authorization || req.headers.authorization === '') {


		return next({
			status: 400,
			error: 'missing_client_credentials',
			error_description: 'please, provide valid client_id and client_secret',
		});
	}

	if (!body.grant_type || body.grant_type === '') {


		return next({
			status: 400,
			error: 'missing_grant_type',
			error_description: 'missing grant_type',
		});
	}

	if (!body.username || body.username === '' ) {

		return next({
			status: 400,
			error: 'invalid_credentials',
			error_description: 'missing username',
		});
	}

	if (!body.password || body.password === '') {

		return next({
			status: 400,
			error: 'invalid_credentials',
			error_description: 'missing password',
		});
	}

	checkCredentials(req.headers.authorization)
		.then(() => {

			if (body.grant_type === 'password') {

				const builder = new JWTBuilder(body.username, body.password);

				return builder.getJWT()
					.then(data => {
						res.status(201).send({
							access_token: data.token,
							token_type: 'bearer',
							scope: 'password',
							exp: data.exp,
							iat: data.iat,
						});
					})
					.catch(next);
			}
		})
		.catch(next);
});

router.post('/client', async (req, res, next) => {
	const {clientId, clientSecret} = req.body;

	const client = new Client({clientId, clientSecret});

	return saveDocument(client)
		.then(savedClient => {
			const result = savedClient.toObject();

			delete result.clientSecret;
			res.status(201).send(result);
		})
		.catch(next);
});

module.exports = router;
