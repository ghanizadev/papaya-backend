
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');


describe('/api/v1/flavor', function() {

	it('should get one flavor', async function () {
		const res = await request(app)
			.get('/api/v1/flavor/1141')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'QUATRO QUEIJOS',  'Expect name to be QUATRO QUEIJOS');
	});

	it('should post a flavor', async function () {
		const res = await request(app)
			.post('/api/v1/flavor')
			.set('Content-Type', 'application/json')
			.send({
				code: '0000',
				name: 'TESTE',
				description: [
					'TOMATE',
					'CEBOLA',
					'BANANA',
					'MUSSARELA'
				],
				group: 'GRUPO',
				small: 33,
				medium: 44,
				large: 55
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.name, 'TESTE',  'Expect name to be TESTE');
	});
  
	it('should get all flavors', async function () {
		const res = await request(app)
			.get('/api/v1/flavor')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 2,  'Expect to have 2 items in the list');
	});
  
	it('should not get invalid flavor', async function () {
		const res = await request(app)
			.get('/api/v1/flavor/0001')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error to be "not_found');
	});
  
	it('should get by flavor description "COM"', async function () {
		const res = await request(app)
			.get('/api/v1/flavor?q=com:muss')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be not found (404)');
		assert.equal(res.body.length, 2,  'Expect to have 2 items in the list');
	});
    
	it('should get by flavor description "SEM"', async function () {
		const res = await request(app)
			.get('/api/v1/flavor?q=sem:ban')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 1,  'Expect to have 1 items in the list');
	});
  
	it('should alter a flavor', async function () {
		const res = await request(app)
			.put('/api/v1/flavor/0000')
			.set('Content-Type', 'application/json')
			.send({
				description: [
					'TOMATE',
					'CEBOLA',
					'BANANA',
					'MUSSARELA',
					'PIMENTA'
				]
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.isTrue(res.body.description.includes('PIMENTA'),  'Expect to have added PIMENTA to description');
	});
  
	it('should not alter an invalid flavor', async function () {
		const res = await request(app)
			.put('/api/v1/flavor/0001')
			.set('Content-Type', 'application/json')
			.send({
				description: [
					'TOMATE',
					'CEBOLA',
					'BANANA',
					'MUSSARELA',
					'PIMENTA'
				]
			});

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error to be "not_found"');
  
	});
  
	it('should delete a flavor', async function () {
		const res = await request(app)
			.del('/api/v1/flavor/0000')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.code, '0000',  'Expect returned code to be "0000"');
  
	});
  
	it('should not delete an invalid flavor', async function () {
		const res = await request(app)
			.del('/api/v1/flavor/0000')
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'not_found',  'Expect error code to be "not_found"');
  
	});
});


