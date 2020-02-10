
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
		assert.equal(res.body.title, 'PIZZA PEQUENA', 'Expect pizza to be PIZZA PEQUENA');
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
				title: 'PIZZA MEDIA',
				flavorLimit: 3
			});
      
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.code, 11, 'Expect code to be 11');
		assert.equal(res.body.title, 'PIZZA MEDIA', 'Expect title to be "PIZZA MEDIA"');
		assert.equal(res.body.flavorLimit, 3, 'Expect flavor limit to be 3');
	});
  
    
	it('should not post a pizza without code', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				title: 'PIZZA RUIM',
				flavorLimit: 3
			});
      
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be "failed_to_validate"');
	});
  
	it('should not post a pizza without title', async function () {
		const res = await request(app)
			.post('/api/v1/pizza')
			.set('Content-Type', 'application/json')
			.send({
				code: 12,
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
				title: 'PIZZA MAIS MEDIA',
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
				title: 'PIZZA MAIS MEDIA',
			});
      
		assert.equal(res.statusCode, 201, 'Expect request to created (201)');
		assert.equal(res.body.code, 11, 'Expect pizza\'s code to be 11');
		assert.equal(res.body.title, 'PIZZA MAIS MEDIA', 'Expect pizza\'s title to be "PIZZA MAIS MEDIA"');
	});
  
    
	it('should not change an invalid pizza', async function () {
		const res = await request(app)
			.put('/api/v1/pizza/13')
			.set('Content-Type', 'application/json')
			.send({
				code: 11,
				title: 'PIZZA MAIS MEDIA',
			});
      
		assert.equal(res.statusCode, 404, 'Expect request to not found (404)');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');
  
	});
  
	it('should delete a pizza', async function () {
		const res = await request(app)
			.delete('/api/v1/pizza/11')
			.send();
      
		assert.equal(res.statusCode, 200, 'Expect request to accepted (200)');
		assert.equal(res.body.title, 'PIZZA MAIS MEDIA', 'Expect pizza title to be "PIZZA MEDIA"');
	});
  
	it('should not delete an invalid pizza', async function () {
		const res = await request(app)
			.delete('/api/v1/pizza/11')
			.send();
      
		assert.equal(res.statusCode, 404, 'Expect request to not found (404)');
		assert.equal(res.body.error, 'not_found', 'Expect error code to be "not_found"');
	});

});


