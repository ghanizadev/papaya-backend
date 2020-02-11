
const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const {assert} = require('chai');

let JWT;

const EMAIL = faker.internet.email();
const NAME = faker.name.firstName();
const ADDRESS = faker.address.streetAddress();
const CPF = '08485806999';
const PHONE = faker.phone.phoneNumber();


describe('/api/v1/customer', function() {

	before(async function() {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI('username=admin@admin.com&password=123456&grant_type=password'))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
		JWT = token.body.access_token;
	});
  
	it('should not create a new customer with wrong content-type', async function () {
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'plain/text')
			.set('Authorization', 'Bearer ' + JWT)
			.send(
				'name: NAME,' +
				'phoneNumber: PHONE,' +
				'cpf: CPF,' +
				'address: ADDRESS,' +
				'email: EMAIL'
			);

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_content',  'Expect error code to be \"invalid_content\"');

	});

	it('should not create a new customer without a token', async function () {
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ')
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: CPF,
				address: ADDRESS,
				email: EMAIL
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_token',  'Expect server to require a token');

	});

	it('should not create a new customer without name', async function () {

		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: '',
				phoneNumber: PHONE,
				cpf: CPF,
				address: ADDRESS,
				email: EMAIL
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

	it('should not create a new customer without email', async function () {

		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: CPF,
				address: ADDRESS,
				email: ''
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

	it('should not create a new customer without phone', async function () {

		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: '',
				cpf: CPF,
				address: ADDRESS,
				email: EMAIL
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});


	it('should not create a new customer without cpf', async function () {

		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: '',
				address: ADDRESS,
				email: EMAIL
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});


	it('should not create a new customer without address', async function () {

		
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: CPF,
				address: '',
				email: EMAIL
			});
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});
  
	it('should create a new customer', async function () {
		
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: CPF,
				address: ADDRESS,
				email: EMAIL
			});
					
		assert.equal(res.statusCode, 201, 'Expect user to be created (201)');
		assert.equal(res.body.email, EMAIL, 'Expect user\'s email to match');
		assert.exists(res.body._id, 'Expect user to have an ID');

	});

	  
	it('should not create a new customer with same email', async function () {
		
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: '72143150920',
				address: ADDRESS,
				email: EMAIL
			});
					
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

		  
	it('should not create a new customer with same email cpf', async function () {
		
		const res = await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: NAME,
				phoneNumber: PHONE,
				cpf: CPF,
				address: ADDRESS,
				email: faker.internet.email()
			});
					
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate',  'Expect error code to be \"failed_to_validate\"');

	});

	it('should get all customers', async function () {
		const email = faker.internet.email();

		await request(app)
			.post('/api/v1/customer')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: 'Ivona Peteva Petrova',
				phoneNumber: '48 991206153',
				cpf: '80107224992',
				address: 'rua Altamiro Barcelos Dutra, 1396, Barra da Lagoa',
				email
			});
		
		const res = await request(app)
			.get('/api/v1/customer')
			.set('Authorization', 'Bearer ' + JWT)
			.send();
					
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.length, 2, 'Expect 2 users in listing');

	});

	it('should get customer by email', async function () {
		const all = await request(app)
			.get('/api/v1/customer')
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		const a = all.body.shift();
		
		const res = await request(app)
			.get('/api/v1/customer?email=' + a.email)
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		const b = res.body.shift();
					
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.deepEqual(a, b, 'Expect users to be equal');

	});

	it('should get customer by name', async function () {
		const all = await request(app)
			.get('/api/v1/customer')
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		const a = all.body.shift();
		
		const res = await request(app)
			.get('/api/v1/customer?name=' + a.name)
			.set('Authorization', 'Bearer ' + JWT)
			.send();

		const b = res.body.find(user => user.email === a.email);
					
		assert.equal(res.statusCode, 200, 'Expect user to be accepted (200)');
		assert.deepEqual(a, b, 'Expect users to be equal');

	});

	it('should not alter customer\'s cpf', async function () {
		
		const res = await request(app)
			.patch('/api/v1/customer/' + EMAIL)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				cpf: '72143150920'
			});
					
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'forbidden_alteration',  'Expect error code to be \"forbidden_alteration\"');

	});

	it('should not alter customer\'s email', async function () {
		
		const res = await request(app)
			.patch('/api/v1/customer/' + EMAIL)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				email: faker.internet.email()
			});
					
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'forbidden_alteration',  'Expect error code to be \"forbidden_alteration\"');

	});

	it('should not alter customer\'s ID', async function () {
		
		const res = await request(app)
			.patch('/api/v1/customer/' + EMAIL)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				customerId: '000'
			});
					
		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'forbidden_alteration',  'Expect error code to be \"forbidden_alteration\"');

	});

	it('should not alter a not-registered customer', async function () {
		
		const res = await request(app)
			.patch('/api/v1/customer/' + faker.internet.email())
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name: faker.name.firstName()
			});
					
		assert.equal(res.statusCode, 404, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'customer_not_found',  'Expect error code to be \"customer_not_found\"');

	});

	it('should alter customer', async function () {

		const address = faker.name.firstName();
		const name = faker.address.streetAddress();
		const phoneNumber = '00 0000000000';

		
		const res = await request(app)
			.patch('/api/v1/customer/' + EMAIL)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				name,
				address,
				phoneNumber,
				historic: [
					'Historico 1'
				]
			});
					
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.address, address, 'Expect address to change');
		assert.equal(res.body.name, name, 'Expect name to change');
		assert.equal(res.body.phoneNumber, phoneNumber, 'Expect phone to change');
		assert.isTrue(res.body.historic.includes('Historico 1'), name, 'Expect historic to change');

	});
});


