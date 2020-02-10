const request = require('supertest');
const app = require('../app');
const faker = require('faker');
const {assert} = require('chai');

let JWT;

const NAME = faker.name.firstName();
const STREET = faker.address.streetAddress();
const DISTRICT = faker.address.secondaryAddress();
const NUMBER = faker.random.number();

describe('Create and alter ORDER (with invalid/valid data)', function() {
	before(async function() {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI('username=admin@admin.com&password=123456&grant_type=password'))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
		JWT = token.body.access_token;
	});

	it('should not create an order without TOKEN', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ')
			.send({tableNumber: 1});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_token',  'Expect error code to be \"invalid_token\"');
	});
  
	it('should not create an order without Authorization', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.send({tableNumber: 1});

		assert.equal(res.statusCode, 403, 'Expect request to be denied (403)');
		assert.equal(res.body.error, 'auth_missing',  'Expect error code to be \"auth_missing\"');
	});
  
	it('should not create an order with invalid content-type', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'plain/text')
			.send('tableNumber=1');

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_content',  'Expect error code to be \"invalid_content\"');
	});
  
	it('should not create an order with invalid body', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send({number: 1});

		assert.equal(res.statusCode, 400, 'Expect request to be be denied (400)');
		assert.equal(res.body.error, 'invalid_table', 'Expect error code to be \"invalid_table\"');
    
	});
  
	it('should not create an order with without body', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_table', 'Expect error code to be \"invalid_table\"');
	});
  
	it('should create a new order', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send({tableNumber: 1});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.exists(res.body.orderId,  'Expect to have an OrderId');
    
	});
  
	it('should not open the same table', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send({tableNumber: 1});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_table', 'Expect error code to be \"invalid_table\"');
	});
  
	it('should append a new order', async function () {
		const res = await request(app)
			.post('/api/v1/order')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send({tableNumber: 181});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.exists(res.body.orderId,  'Expect to have an OrderId');
	});
  
	it('should get all orders', async function () {
		const res = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.isTrue(Array.isArray(res.body) && res.body.length === 2, 'Expect all orders in listing');
	});

	it('should not get invalid order', async function () {
		const res = await request(app)
			.get('/api/v1/order/0000')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be not found (404)');
		assert.equal(res.body.error, 'order_not_found', 'Expect error code to be "order_not_found"');
	});

	it('should not post delivery orders without customer', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				address: {
					street: STREET,
					district: DISTRICT,
					number: NUMBER
				},
				paymenteMethod: 'DINHEIRO',
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'customer_not_found', 'Expect error code to be \"customer_not_found\"');
	});

	it('should not post delivery orders with invalid customer', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: '',
				address: {
					street: STREET,
					district: DISTRICT,
					number: NUMBER
				},
				paymenteMethod: 'DINHEIRO',
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'customer_not_found', 'Expect error code to be \"customer_not_found\"');
	});

	it('should not post delivery orders without payment method', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: faker.name.firstName(),
				address: {
					street: STREET,
					district: DISTRICT,
					number: NUMBER
				}
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be \"failed_to_validate\"');
	});

	it('should not post delivery orders with invalid payment method', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: faker.name.firstName(),
				address: {
					street: STREET,
					district: DISTRICT,
					number: NUMBER
				},
				paymenteMethod: '',
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'failed_to_validate', 'Expect error code to be \"failed_to_validate\"');
	});


	it('should not post delivery orders without address', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: faker.name.firstName(),
				paymenteMethod: 'DINHEIRO',
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_address', 'Expect error code to be \"invalid_address\"');
	});

	// eslint-disable-next-line mocha/no-skipped-tests
	it('should not post delivery orders with invalid address', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: faker.name.firstName(),
				address: {},
				paymentMethod: 'DINHEIRO',
			});

		assert.equal(res.statusCode, 400, 'Expect request to be denied (400)');
		assert.equal(res.body.error, 'invalid_address', 'Expect error code to be \"invalid_address\"');
	});

	// eslint-disable-next-line mocha/no-skipped-tests
	it.skip('should post a new delivery order', async function () {
		const res = await request(app)
			.post('/api/v1/order/delivery')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				customer: faker.name.firstName(),
				address: {

					street: STREET,
					district: DISTRICT,
					number: NUMBER
				},
				paymentMethod: 'DINHEIRO',
			});
		assert.equal(res.statusCode, 201, 'Expect request to be created(201)');
		assert.exists(res.body.orderId, 'Expect response to have an order ID');
	});

	it('should be able to find by order ID', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.shift();

		const res = await request(app)
			.get('/api/v1/order/' + b.orderId)
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		const a = res.body;

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.deepEqual(b, a, 'Expect order to be equal');
	});

	it('should add a new product to a table order', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.shift();

		const res = await request(app)
			.put('/api/v1/order/'+ b.orderId +'/add')
			.set('Authorization', 'Bearer '+ JWT)
			.send([
				{quantity: 1, code: '10*1141', additionals: ['1141:SEM CEBOLA;SEM TOMATE'], owner: [NAME] }
			]);
		
		assert.equal(res.statusCode, 201, 'Expect request to be created(201)');
		assert.equal(res.body.orderId, b.orderId, 'Expect order ID to be the same');
	});

	// eslint-disable-next-line mocha/no-skipped-tests
	it.skip('should add a new product to a delivery order', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.toDeliver);

		const res = await request(app)
			.put('/api/v1/order/'+ b.orderId +'/add')
			.set('Authorization', 'Bearer '+ JWT)
			.send([
				{quantity: 1, code: '10*1141', additionals: ['1212:SEM CEBOLA'], owner: [NAME] }
			]);

		assert.equal(res.statusCode, 201, 'Expect request to be created(201)');
		assert.equal(res.body.orderId, b.orderId, 'Expect response to have an order ID');
	});

	it('should remove product from a table order', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);
		const product = b.items[0];

		const res = await request(app)
			.put(encodeURI('/api/v1/order/'+ b.orderId +'/' + product.code + '/remove'))
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		const items = res.body.items.filter(item => item.code === product.code);

		assert.equal(res.statusCode, 200, 'Expect request to be created(201)');
		assert.equal(items.length, 2, 'Expect product\'s cout to be 2');
		assert.isNotNull(items.find(item => item.price < 0), 'Expect product to be removed');
	});

	it('should get table members', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);

		const res = await request(app)
			.get('/api/v1/order/'+ b.orderId +'/members')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.isTrue(res.body.includes(NAME.toUpperCase()), 'Expect user to be in the list');
	});

	it('should get single table member', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);
		const customer = b.items[0].owner.shift();

		const res = await request(app)
			.get('/api/v1/order/'+ b.orderId +'/' + customer)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.equal(res.body.name, customer, 'Expect user to be the owner');
	});

	it('should not get single table member with invalid name', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);
		const customer = faker.name.firstName();

		const res = await request(app)
			.get('/api/v1/order/'+ b.orderId +'/' + customer)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be accepted (200)');
		assert.equal(res.body.error, 'customer_not_found', 'Expect error code to be "customer_not_found"');
	});

	it('should not get single table member with invalid order ID', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);
		const customer = b.items[0].owner.shift();

		const res = await request(app)
			.get('/api/v1/order/0000/' + customer)
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send();

		assert.equal(res.statusCode, 404, 'Expect request to be accepted (200)');
		assert.equal(res.body.error, 'order_not_found', 'Expect error code to be "order_not_found"');
	});

	it('should add new payment', async function () {
		const order = await request(app)
			.get('/api/v1/order')
			.set('Authorization', 'Bearer '+ JWT)
			.send();
		
		const b = order.body.find(order => order.items.length > 0);
		const product = b.items[0];

		const res = await request(app)
			.post('/api/v1/order/'+ b.orderId +'/' + product.code + '/pay')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer '+ JWT)
			.send({
				method: 'DINHEIRO',
				value: '10'
			});

		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.orderId, b.orderId, 'Expect to be the same order');
		assert.equal(res.body.items[0].payments.length, 1, 'Expect to have 1 payment');
	});

  
});