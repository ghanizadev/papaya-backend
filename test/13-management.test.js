
const request = require('supertest');
const app = require('../app');
const {assert} = require('chai');

let JWT;
let uuid;

describe('/api/v1/management', function() {
	before(async function() {
		const token = await request(app)
			.post('/oauth/token')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send(encodeURI('username=admin@admin.com&password=123456&grant_type=password'))
			.auth('lasolana', 'minhamarguerita', { type: 'basic' });
		JWT = token.body.access_token;
	});

	it('should open a day', async function(){
		const res = await request(app)
			.post('/api/v1/management')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				tables: 10,
				amount: 150,
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
		uuid = res.body.hash && res.body.hash;
      
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.email, 'admin@admin.com', 'Expect user\'s email to be "admin@admin.com"');
		assert.equal(res.body.amount, 150, 'Expect open cash to be 150');
		assert.isTrue(res.body.opened, 'Expect to be opened');
		assert.equal(res.body.tables, 10, 'Expect 10 tables to be open');
		assert.deepEqual(res.body.incomes, [], 'Expect to have empty incomes');
		assert.deepEqual(res.body.outgoings, [], 'Expect to have empty outgoings');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should add a cash income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 100,
				source: 'CASH'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[0].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[0].value, 100, 'Expect value to be 100');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should add a credit income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 190,
				source: 'CREDIT'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[1].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[1].value, 190, 'Expect value to be 190');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should add a debit income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 230,
				source: 'DEBIT'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[2].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[2].value, 230, 'Expect value to be 230');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should add an other income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 178,
				source: 'OTHERS'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[3].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[3].value, 178, 'Expect value to be 100');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});

	it('should add a ticket income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 580,
				source: 'TICKET'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[4].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[4].value, 580, 'Expect value to be 580');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should add another cash income', async function(){
		const res = await request(app)
			.post('/api/v1/management/income')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 150,
				source: 'CASH'
			});

		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
          
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.incomes[5].user, 'admin@admin.com', 'Expect user to be "admin@admin.com"');
		assert.equal(res.body.incomes[5].value, 150, 'Expect value to be 100');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
  
  
	it('should add an outgoing', async function(){
		const res = await request(app)
			.post('/api/v1/management/outgoing')
			.set('Content-Type', 'application/json')
			.set('Authorization', 'Bearer ' + JWT)
			.send({
				id: '00000',
				value: 110,
			});
      
		const now = new Date();
		const date = res.body.createdAt && new Date(res.body.createdAt);
      
		assert.equal(res.statusCode, 201, 'Expect request to be created (201)');
		assert.equal(res.body.outgoings[0].user, 'admin@admin.com', 'Expect user\'s email to be "admin@admin.com"');
		assert.equal(res.body.outgoings[0].value, 110, 'Expect value to be 110');
		assert.equal(date.toLocaleDateString(), now.toLocaleDateString(), 'Expect to be the same day');
		assert.isString(res.body.hash, 'Expect to have a hash');
	});
  
	it('should get balance', async function(){
		const res = await request(app)
			.get('/api/v1/management/balance')
			.set('Authorization', 'Bearer ' + JWT)
			.send();
      
		const expected = {
			income: {
				card: {
					credit: 190,
					debit: 230,
					ticket: 580,
				},
				cash: 250,
				others: 178,
			},
			outgoing: 110,
			firstAmount: 150,
			balance: 1468,
			grossProfit: 1318,
			total: 1428,
		};
      
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.deepEqual(res.body, expected, 'Expect body assertion');
	});
  
	it('should close', async function(){
		const res = await request(app)
			.patch('/api/v1/management/close')
			.set('Authorization', 'Bearer ' + JWT)
			.set('Content-Type', 'application/json')
			.send();
      
		const expected = {
			income: {
				card: {
					credit: 190,
					debit: 230,
					ticket: 580,
				},
				cash: 250,
				others: 178,
			},
			outgoing: 110,
			firstAmount: 150,
			balance: 1468,
			grossProfit: 1318,
			total: 1428,
		};
      
		assert.equal(res.statusCode, 200, 'Expect request to be accepted (200)');
		assert.deepEqual(res.body, expected, 'Expect body assertion');
    
		const get = await request(app)
			.get('/api/v1/management/balance')
			.set('Authorization', 'Bearer ' + JWT)
			.send();
      
		assert.equal(get.statusCode, 404, 'Expect request to be not found (404)');
    
	});
  
});


