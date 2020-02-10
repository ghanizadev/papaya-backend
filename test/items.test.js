
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');

describe('/api/v1/item', function() {
  
	it('should not post an invalid item', async function () {
		const res = await request(app)
			.post('/api/v1/item')
			.set('Content-Type', 'application/json')
			.send({name: 'ITEM'});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_data', 'Expect error code to be "invalid_data"');
	});

	it('should post an aray of items', async function () {
		const items =  ['TOMATE', 'MUSSARELA', 'CALABRESA', 'CEBOLA'];

		const res = await request(app)
			.post('/api/v1/item')
			.set('Content-Type', 'application/json')
			.send(items);

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.length, 4, 'Expect returned list of items to have size of 3');
	});
  
	it('should search for item', async function () {
		const res = await request(app)
			.get('/api/v1/item?name=tom')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 1, 'Expect returned list of items to have size of 1');
	});
  
	it('should get all items', async function () {
		const res = await request(app)
			.get('/api/v1/item')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 4, 'Expect returned list of items to have size of 4');
	});
  
	it('should get all items with invalid query', async function () {
		const res = await request(app)
			.get('/api/v1/item?nam=tom')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 4, 'Expect returned list of items to have size of 4');
	});
  
	it('should all items with invalid query', async function () {
		const res = await request(app)
			.get('/api/v1/item?nam=tom')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 4, 'Expect returned list of items to have size of 4');
	});
  
	it('should delete a item', async function () {
		const res = await request(app)
			.delete('/api/v1/item?name=tomate')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'TOMATE', 'Expect returned item to be "TOMATE"');
	});
  
	it('should not delete an invalid item', async function () {
		const res = await request(app)
			.delete('/api/v1/item?nme=tomate')
			.send();

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_query', 'Expect error code to be "invalid_query"');
	});
  
	it('should not delete a random item', async function () {
		const res = await request(app)
			.delete('/api/v1/item?name=toma')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be "not_found"');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');
	});

});


