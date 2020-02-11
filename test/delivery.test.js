
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');


describe('/api/v1/delivery', function() {

	it('should get all deliveries', async function () {
		const res = await request(app)
			.get('/api/v1/delivery')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 0,  'Expect list to be empty');
	});

});


