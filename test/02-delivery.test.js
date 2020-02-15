/* eslint-disable mocha/no-skipped-tests */

const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');


describe('/api/v1/delivery', function() {

	it.skip('should get all deliveries', async function () {
		const res = await request(app)
			.get('/api/v1/delivery')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 1,  'Expect list to have one delivery');
	});

	it.skip('should get one delivery', async function () {
		const item = await request(app)
			.get('/api/v1/delivery')
			.send();

		const a = item.body.shift();

		const res = await request(app)
			.get('/api/v1/delivery/' + a.orderId)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.orderId, a.orderId,  'Expect orderId to be equal');
	});

	it.skip('should update a delivery', async function () {
		const item = await request(app)
			.get('/api/v1/delivery')
			.send();

		const a = item.body.shift();

		const res = await request(app)
			.put('/api/v1/delivery/' + a.orderId)
			.set('Content-Type', 'application/json')
			.send({
				customer: 'JEAN'
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.customer, 'JEAN',  'Expect name to be JEAN');
	});

	it.skip('should set delivery as DELIVERED', async function () {
		const item = await request(app)
			.get('/api/v1/delivery')
			.send();

		const a = item.body.shift();

		const res = await request(app)
			.patch('/api/v1/delivery/' + a.orderId + '/delivered')
			.set('Content-Type', 'application/json')
			.send();

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.isTrue(res.body.delivered, 'Expect DELIVERED to be true');
	});

	it.skip('should not get an invalid delivery', async function () {
		const res = await request(app)
			.get('/api/v1/delivery/0000')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be anot found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be "not_found"');
	});

	it.skip('should not update an invalid delivery', async function () {
		const res = await request(app)
			.put('/api/v1/delivery/0000')
			.set('Content-Type', 'application/json')
			.send({
				customer: ''
			});

		assert.equal(res.statusCode, 404, 'Expect request to be anot found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be "not_found"');
	});

	it.skip('should not uset an invalid delivery as DELIVERED', async function () {
		const res = await request(app)
			.patch('/api/v1/delivery/0000/delivered')
			.set('Content-Type', 'application/json')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be anot found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be "not_found"');
	});

});


