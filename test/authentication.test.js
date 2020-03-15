/* eslint-disable mocha/no-nested-tests */

const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');
const setup = require('./utils/setup');
const teardown = require('./utils/teardown');

const EMAIL = 'admin@admin.com';
const PASSWORD = '123456';

describe('Testing TOKEN endpoint with invalid data', function() {

	before(async function() {
		await setup();
	});

	it('should deny content-type', async function () {

		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/json')
			.send({
				username: EMAIL,
				password: PASSWORD,
				grant_type: 'password'
			})
			.auth('lasolana', 'minhamarguerita', {type: 'basic'});

		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'invalid_content_type', '\'invalid_content_type\' error type');

	});

	it('should deny missing basic auth', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`));

		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'missing_client_credentials', 'Expect \'missing_client_credentials\' error type');

	});

	it('should deny invalid basic auth', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('abcdef', 'ghijk', { type: 'basic' });


		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'invalid_credentials', 'Expect \'invalid_credentials\' error type');


	});

	it('should deny empty basic auth', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('', '', { type: 'basic' });


		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'invalid_credentials', 'Expect \'invalid_credentials\' error type');


	});

	it('should deny empty username', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });

		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'invalid_credentials', 'Expect \'invalid_credentials\' error type');


	});

	it('should deny empty password', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });

		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'invalid_credentials', 'Expect \'invalid_credentials\' error type');


	});

	it('should deny grant_type', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=&grant_type=`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });

		assert.equal(res.statusCode, 400, 'Expect status code to be 400');
		assert.equal(res.body.error, 'missing_grant_type', 'Expect \'missing_grant_type\' error type');

	});
});
