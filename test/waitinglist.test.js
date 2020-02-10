
const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const {assert} = require('chai');

const NAME = faker.name.firstName();

describe('/api/v1/waitinglist', function() {

	it('should get the list', async function () {
		const res = await request(app)
			.get('/api/v1/waitinglist')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.isTrue(Array.isArray(res.body),  'Expect response to be a list');
	});
  
	it('should add someone to the list', async function () {
		const res = await request(app)
			.post('/api/v1/waitinglist')
			.set('Content-Type', 'application/json')
			.send({
				name: NAME
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.name, NAME,  `Expect response name to be ${NAME}`);
	});
  
	it('should find someone in the list', async function () {
		const res = await request(app)
			.get('/api/v1/waitinglist?name=' + NAME)
			.send();

		const user = res.body.shift();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(user.name, NAME,  `Expect response name to be ${NAME}`);
	});
  
	it('should remove someone from list', async function () {
		const query = await request(app)
			.get('/api/v1/waitinglist?name=' + NAME)
			.send();

		const user = query.body.shift();

		const res = await request(app)
			.delete('/api/v1/waitinglist/'+ user.customerId)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, NAME,  'Expect response name to be the same');
	});
  
	it('should not remove invalid id', async function () {
		const res = await request(app)
			.delete('/api/v1/waitinglist/0000')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be "not_found"');
	});
});


