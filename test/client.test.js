const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const {assert} = require('chai');

describe('Create and alter CLIENT (with invalid/valid data)', function() {

	it('should create a new client', async function () {
		const res = await request(app)
			.post('/oauth/client')
			.set('Content-Type', 'application/json')
			.send({clientId: 'papaya_admin', clientSecret: 'e870fi3ln'});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.clientId, 'papaya_admin',  'Expect client ID to be the same');
		assert.isUndefined(res.body.clientSecret, 'Expect client secret to be ommited');
	});
  
	it('should not create an existent client', async function () {
		const res = await request(app)
			.post('/oauth/client')
			.set('Content-Type', 'application/json')
			.send({clientId: 'lasolana', clientSecret: 'minhamarguerita'});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be "failed_to_validate"');
	});
  
});