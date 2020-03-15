
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');

describe('/api/v1/pizza', function() {

	it('should get the pizzas', async function () {
		const res = await request(app)
			.get('/api/v1/pizza')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.isTrue(Array.isArray(res.body),  'Expect response to be a list');
	});

	it('should get a pizza by its code', async function () {
		const res = await request(app)
			.get('/api/v1/pizza/10')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'PIZZA PEQUENA', 'Expect pizza to be PIZZA PEQUENA');
	});

	it('should not get a pizza by an invalid code', async function () {
		const res = await request(app)
			.get('/api/v1/pizza/15')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');
	});

	it('should post a new pizza', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 11,
				name: 'PIZZA MEDIA',
				description: 'Uma pizza qualquer',
				ref: 'medium',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.code, 11, 'Expect code to be 11');
		assert.equal(res.body.name, 'PIZZA MEDIA', 'Expect name to be "PIZZA MEDIA"');
		assert.equal(res.body.flavorLimit, 3, 'Expect flavor limit to be 3');
	});


	it('should not post a pizza without code', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				name: 'PIZZA RUIM',
				description: 'Uma pizza qualquer',
				ref: 'medium',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});

	it('should not post a pizza without name', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 12,
				ref: 'medium',
				description: 'Uma pizza qualquer',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});

	it('should not post a pizza with existing code', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 11,
				name: 'PIZZA MAIS MEDIA',
				ref: 'medium',
				description: 'Uma pizza qualquer',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});

	it('should not post a pizza without ref', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 19,
				name: 'PIZZA MEDIA CYNEP',
				description: 'Uma pizza qualquer',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});


	it('should not post a pizza without description', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 19,
				name: 'PIZZA MEDIA CYNEP',
				ref: 'medium',
				flavorLimit: 3
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});

	it('should change a pizza', async function () {
		const res = await request(app)
			.put('/api/v1/pizza/11')
			.set('Content-Type', 'application/json')
			.send({
				name: 'PIZZA MAIS MEDIA',
			});

		assert.equal(res.statusCode, 201, 'Expect request to created (201)');
		assert.equal(res.body.code, 11, 'Expect pizza\'s code to be 11');
		assert.equal(res.body.name, 'PIZZA MAIS MEDIA', 'Expect pizza\'s name to be "PIZZA MAIS MEDIA"');
	});


	it('should not change an invalid pizza', async function () {
		const res = await request(app)
			.put('/api/v1/pizza/13')
			.set('Content-Type', 'application/json')
			.send({
				ref: 'medium',
				description: 'Uma pizza qualquer',
				name: 'PIZZA MAIS MEDIA',
			});

		assert.equal(res.statusCode, 404, 'Expect request to not found (404)');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');

	});

	it('should delete a pizza', async function () {
		const res = await request(app)
			.delete('/api/v1/pizza/11')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to accepted (200)');
		assert.equal(res.body.name, 'PIZZA MAIS MEDIA', 'Expect pizza name to be "PIZZA MEDIA"');
	});

	it('should not delete an invalid pizza', async function () {
		const res = await request(app)
			.delete('/api/v1/pizza/11')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to not found (404)');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');
	});

});


