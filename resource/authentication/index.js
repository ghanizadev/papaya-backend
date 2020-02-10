const { JWTParser } = require('./token');

const { arrayEquals } = require('./utils');


const authorize = (req, res, next, required = []) => {
	const auth = req.headers.authorization || req.query.access_token;
	let jwt;

	if(!auth || auth === '') {
		
		return next({
			status: 403,
			error: 'missing_token',
			error_description: 'a token of a type bearer is expected',
		});
	}

	if (auth.startsWith('Bearer')) {
		jwt = auth.substring(7);
	} else{
		jwt = req.query.access_token;
	}

	const jtwParser = new JWTParser(jwt);

	if (jtwParser.isExpired || !jtwParser.isValid) {
		
		return next({
			status: 403,
			error: 'invalid_token',
			error_description: 'your token is invalid, please, request a new one',
		});
	}

	const { authorities } = jtwParser.content;

	//TODO: [LS-2] Check only required authorities
	if (!arrayEquals(authorities, required)) {

		return next({
			status: 403,
			error: 'forbidden_content',
			error_description: 'you are not permitted to check this content',
		});
	}

	next();
};

module.exports = authorize;
