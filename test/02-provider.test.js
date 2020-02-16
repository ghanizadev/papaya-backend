
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');


describe('/api/v1/provider', function() {

	it('should get all provider', async function () {
		const res = await request(app)
			.get('/api/v1/provider')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 0,  'Expect list to be empty');
	});
  
	it('should post a provider', async function () {
		const address = {
			street: 'rua Altamiro Barcelos Dutra',
			number: '1396',
			district: 'Barra da Lagoa', 
			city: 'Florianópolis',
			postalCode: '88061300',
			state: 'SC'
		};
    
		const res = await request(app)
			.post('/api/v1/provider')
			.set('Content-Type', 'application/json')
			.send({
				name: 'Jean Felipe de Melo 08485806999',
				address,
				cnpj: '20197155000177',
				email: 'jf.melo6@gmail.com',
				website: 'http://ghanizadev.com.br',
				phoneNumber: '48984655792'
			});

		assert.equal(res.statusCode, 201, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'Jean Felipe de Melo 08485806999',  'Expect title to be PRODUTO');
		assert.deepEqual(res.body.address, address,  'Expect description to be UM PRODUTO A');
		assert.equal(res.body.cnpj, '20197155000177',  'Expect ref to be 0000');
		assert.equal(res.body.email, 'jf.melo6@gmail.com',  'Expect code to be 0000');
		assert.equal(res.body.website, 'http://ghanizadev.com.br',  'Expect group 99');
		assert.equal(res.body.phoneNumber, '48984655792',  'Expect subgroup to be 99');
	});
    
	it('should alter an existing a provider', async function () {
		const address = {
			street: 'rua Altamiro Barcelos Dutra',
			number: '1396',
			district: 'Barra da Lagoa', 
			city: 'Florianópolis',
			postalCode: '88061300',
			state: 'SC'
		};
    
		const res = await request(app)
			.put('/api/v1/provider/00001')
			.set('Content-Type', 'application/json')
			.send({
				name: 'Jean Felipe de Melo'
			});
  
		assert.equal(res.statusCode, 201, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'Jean Felipe de Melo',  'Expect title to be PRODUTO');
		assert.deepEqual(res.body.address, address,  'Expect description to be UM PRODUTO A');
		assert.equal(res.body.cnpj, '20197155000177',  'Expect ref to be 0000');
		assert.equal(res.body.email, 'jf.melo6@gmail.com',  'Expect code to be 0000');
		assert.equal(res.body.website, 'http://ghanizadev.com.br',  'Expect group 99');
		assert.equal(res.body.phoneNumber, '48984655792',  'Expect subgroup to be 99');
	});
  

	it('should get a provider', async function () {
		const res = await request(app)
			.get('/api/v1/provider/00001')
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, 'Jean Felipe de Melo',  'Expect list to be empty');
	});

});


