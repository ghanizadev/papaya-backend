
const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const setup = require('./utils/setup');
const teardown = require('./utils/teardown');
const {assert} = require('chai');


const EMAIL = faker.internet.email();
const PASSWORD = faker.internet.password();
const NAME = faker.name.firstName();


describe('Create USER (with invalid/valid data)', function() {

	it('should not create a new user without email', async function () {
		const res = await request(app)
			.post('/api/v1/user')
			.set('Content-Type', 'application/json')
			.send({
				email: '',
				password: PASSWORD,
				name: NAME
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');
	});

	it('should not create a new user without name', async function () {
		const res = await request(app)
			.post('/api/v1/user')
			.set('Content-Type', 'application/json')
			.send({
				email: EMAIL,
				password: PASSWORD,
				name: ''
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

		
	});

	it('should not create a new user without password', async function () {
		const res = await request(app)
			.post('/api/v1/user')
			.set('Content-Type', 'application/json')
			.send({
				email: EMAIL,
				password: '',
				name: NAME
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

		
	});

	it('should not get data without a token', async function () {
		const res = await request(app)
			.get('/api/v1/user?email=' + EMAIL)
			.set('Authorization', 'Bearer ')
			.send();
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_token',  'Expect error code to be \"invalid_token\"');
		
	});

	it('should create a new user', function (done) {
		request(app)
			.post('/api/v1/user')
			.set('Content-Type', 'application/json')
			.send({
				email: EMAIL,
				password: PASSWORD,
				name: NAME
			}).then(res => {
				assert.equal(res.statusCode, 201, 'Expect user to be created (201)');
				assert.equal(res.body.email, EMAIL,  'Expect email to match itself"');
				assert.exists(res.body._id,  'Expect ID to be returned"');

				done();
			}).catch(done);

	});

	it('should be able to login', async function () {
		const res = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });


		assert.equal(res.statusCode, 201, 'Expect request to be accepted (200)');
		assert.exists(res.body.access_token,  'Expect token to be returned"');
		
	});

	it('should get the new user by its email', async function () {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
    
		const res = await request(app)
			.get('/api/v1/user?email=' + EMAIL)
			.set('Authorization', 'Bearer ' + token.body.access_token)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.shift().email, EMAIL, 'Expect email to match itself"');

	});

	it('should not create a new user with same email', async function () {
		const res = await request(app)
			.post('/api/v1/user')
			.set('Content-Type', 'application/json')
			.send({
				email: EMAIL,
				password: PASSWORD,
				name: NAME
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

	it('should not find a user', async function () {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
    
		const res = await request(app)
			.get('/api/v1/user?email=' + faker.internet.email())
			.set('Authorization', 'Bearer ' + token.body.access_token)
			.send();
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.isTrue(Array.isArray(res.body) && res.body.length === 0,  'Expect response body to be empty');

	});


	it('should change user\'s authority', async function () {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
    
		const res = await request(app)
			.patch('/api/v1/user/' + EMAIL)
			.set('Authorization', 'Bearer ' + token.body.access_token)
			.send({
				authorities: ['READ', 'WRITE', 'ALTER']
			});

		assert.equal(res.statusCode, 201, 'Expect user to be updated (201)');
		assert.isTrue(res.body.authorities.includes('WRITE'), 'Expect the user to have WRITE permission');
		assert.isTrue(res.body.authorities.includes('ALTER'), 'Expect the user to have ALTER permission');
		assert.isTrue(res.body.authorities.includes('READ'), 'Expect the user to have READ permission');
		assert.exists(res.body.email, EMAIL, 'Expect email to match itself"');

	});

	it('should not change user\'s authority with invalid data', async function () {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
    
		const res = await request(app)
			.patch('/api/v1/user/' + EMAIL)
			.set('Authorization', 'Bearer ' + token.body.access_token)
			.send({
				authorities: {read: true}
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

	it('should not change user\'s authority with invalid email', async function () {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI(`username=${EMAIL}&password=${PASSWORD}&grant_type=password`))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
    
		const res = await request(app)
			.patch('/api/v1/user/' + faker.internet.email())
			.set('Authorization', 'Bearer ' + token.body.access_token)
			.send({
				authorities: ['READ', 'WRITE']
			});

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be \"not_found\"');

	});
});


