
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');


describe('/api/v1/product', function() {

	it('should get all products', async function () {
		const res = await request(app)
			.get('/api/v1/product')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 0,  'Expect list to be empty');
	});
  
	it('should post a product', async function () {
		const res = await request(app)
			.post('/api/v1/product')
			.set('Content-Type', 'application/json')
			.send({
				title: 'PRODUTO A',
				description: 'UM PRODUTO A',
				ref: '0000',
				code: '0000',
				group: '99',
				subgroup: '99',
				variation: '99',
				unity: 'UN',
				provider: 'PROVIDER',
				price: '99'
			});

		assert.equal(res.statusCode, 201, 'Expect request to be accepted (200)');
		assert.equal(res.body.title, 'PRODUTO A',  'Expect title to be PRODUTO');
		assert.equal(res.body.description, 'UM PRODUTO A',  'Expect description to be UM PRODUTO A');
		assert.equal(res.body.ref, '0000',  'Expect ref to be 0000');
		assert.equal(res.body.code, '0000',  'Expect code to be 0000');
		assert.equal(res.body.group, '99',  'Expect group 99');
		assert.equal(res.body.subgroup, '99',  'Expect subgroup to be 99');
		assert.equal(res.body.variation, '99',  'Expect variation to be 99');
		assert.equal(res.body.unity, 'UN',  'Expect unity to be UN');
		assert.equal(res.body.price, '99',  'Expect pprice to be 99');
		assert.equal(res.body.provider, 'PROVIDER',  'Expect provider to be PROVIDER');
	});
    
	it('should alter an existing a product', async function () {
		const res = await request(app)
			.put('/api/v1/product/0000')
			.set('Content-Type', 'application/json')
			.send({
				description: 'UM PRODUTO B',
				group: '98',
				subgroup: '98',
				variation: '98',
				unity: 'FD',
				provider: 'LASOLANA',
				price: '98'
			});
  
		assert.equal(res.statusCode, 201, 'Expect request to be accepted (200)');
		assert.equal(res.body.title, 'PRODUTO A',  'Expect title to be PRODUTO');
		assert.equal(res.body.description, 'UM PRODUTO B',  'Expect description to be UM PRODUTO B');
		assert.equal(res.body.ref, '0000',  'Expect ref to be 0000');
		assert.equal(res.body.code, '0000',  'Expect code to be 0000');
		assert.equal(res.body.group, '98',  'Expect group 98');
		assert.equal(res.body.subgroup, '98',  'Expect subgroup to be 98');
		assert.equal(res.body.variation, '98',  'Expect variation to be 98');
		assert.equal(res.body.unity, 'FD',  'Expect unity to be FD');
		assert.equal(res.body.price, '98',  'Expect pprice to be 98');
		assert.equal(res.body.provider, 'LASOLANA',  'Expect provider to be LASOLANA');
	});

	it('should delete a product', async function () {
		const res = await request(app)
			.delete('/api/v1/product/0000')
			.send();
  
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.title, 'PRODUTO A',  'Expect title to be PRODUTO');
		assert.equal(res.body.description, 'UM PRODUTO B',  'Expect description to be UM PRODUTO B');
		assert.equal(res.body.ref, '0000',  'Expect ref to be 0000');
		assert.equal(res.body.code, '0000',  'Expect code to be 0000');
		assert.equal(res.body.group, '98',  'Expect group 98');
		assert.equal(res.body.subgroup, '98',  'Expect subgroup to be 98');
		assert.equal(res.body.variation, '98',  'Expect variation to be 98');
		assert.equal(res.body.unity, 'FD',  'Expect unity to be FD');
		assert.equal(res.body.price, '98',  'Expect pprice to be 98');
		assert.equal(res.body.provider, 'LASOLANA',  'Expect provider to be LASOLANA');
	});

});


