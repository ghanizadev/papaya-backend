
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');

let JWT;

describe('/api/v1/stock', function() {
	before(async function() {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI('username=admin@admin.com&password=123456&grant_type=password'))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
		JWT = token.body.access_token;

		await request(app)
			.post('/api/v1/product')
			.set('Content-Type', 'application/json')
			.send({
				title: 'PRODUTO A',
				description: 'UM PRODUTO A',
				ref: '0000',
				code: '123456789',
				group: '99',
				subgroup: '99',
				variation: '99',
				unity: 'UN',
				provider: 'PROVIDER',
				price: '99',
				basePrice: '80'
			});
	});

	it('should post a stock product', async function(){
		const res = await request(app)
			.post('/api/v1/stock/add')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				code: '123456789',
				quantity: 1,
				toCome: 5,
				toGo: 0,
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
	});

	it('should show stock', async function(){
		const res = await request(app)
			.get('/api/v1/stock')
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be acepted (200)');
		assert.equal(res.body.length, 1, 'List should have on single item');
		assert.equal(res.body[0].code, '123456789', 'Expect code to be "123456789"');
		assert.equal(res.body[0].quantity, 1, 'Expect quantity to be 1');
		assert.equal(res.body[0].toCome, 5, 'Expect toCome to be 5');
		assert.equal(res.body[0].toGo, 0, 'Expect toGo to be 0');
	});

	it('should add product\'s quantity', async function(){
		const res = await request(app)
			.post('/api/v1/stock/add')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				code: '123456789',
				quantity: 18,
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
	});

	it('should update product\'s quantity', async function(){
		const res = await request(app)
			.get('/api/v1/stock')
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be acepted (200)');
		assert.equal(res.body.length, 1, 'List should have on single item');
		assert.equal(res.body[0].code, '123456789', 'Expect code to be "123456789"');
		assert.equal(res.body[0].quantity, 19, 'Expect quantity to be 19');
		assert.equal(res.body[0].toCome, 5, 'Expect toCome to be 5');
		assert.equal(res.body[0].toGo, 0, 'Expect toGo to be 0');
	});

});
