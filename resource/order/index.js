const express = require('express');
var async = require('async');
var bcrypt = require('bcrypt');

const router = express.Router();
const {Order, Pizza, Flavor, Table, Payment, Delivery} = require('../../model');
const {saveDocument, friendlyId, calculateValues, calculateCustomerValues, calculateProductValues} = require('../utils');
const fetch = require('node-fetch');

router.get('/', (req, res, next) => {
	const query = Order.find(req.query);

	return query.exec().then(foundOrders => {

		if(!req.query.archive)
			res.status(200).send(foundOrders.filter(document => !document.closed));
		else
			res.status(200).send(foundOrders);

	}).catch(next);
});

router.post('/', async (req, res, next) => {

	const {user, body} = req;
	const orderId = friendlyId(5);

	if(!req.body.tableNumber || req.body.tableNumber === '')
		return next({status: 400, error: 'invalid_table', error_description: 'send a valid table in "tableNumber" property'});
	
	const query = Table.find({number: body.tableNumber});
	
	return query.exec().then(foundTable => {

		if(foundTable.length === 0){

			const newTable = new Table({
				number: body.tableNumber,
				customer: body.customer,
				status: 'BUSY',
			});

			const order = new Order(body);

			order.set({
				orderId,
				user: `${user.code} - ${user.name}`,
			});

			saveDocument(order)
				.then(orderResult => {
						
					newTable.set({order: orderResult, orderId});

					saveDocument(newTable)
						.then(tableResult => res.status(201).send(tableResult));

				}).catch(next);

		} else {
			next({status: 400, error: 'invalid_table', error_description: 'requested table is already in use'});
		}
	})
		.catch(next);

});

router.post('/delivery', async (req, res, next) => {
	const {user, body} = req;

	const id = friendlyId(5);

	if(!body.customer || body.customer === '') next({status: 400, error: 'customer_not_found', error_description: 'a customer must be set for deliveries'});
	
	if(!body.address || !body.address.street || !body.address.district || !body.address.number) next({status: 400, error: 'invalid_address', error_description: 'every delivery needs an address, dur'});
	
	const deliveryBody = {};

	deliveryBody.paymentMethod = body.paymentMethod;
	deliveryBody.address = body.address;
	deliveryBody.customer = body.customer;
	deliveryBody.orderId = id;

	const delivery = new Delivery(deliveryBody);

	return delivery.validate()
		.then(async () => {
			const order = {};

			order.orderId = id;
			order.user = `${user.code} - ${user.name}`;
			order.toDeliver = true;
		
			return formatProducts(body.products)
				.then(async result => {
					order.items = result;

					const saveOrder = new Order(order);

					return saveDocument(saveOrder)
						.then(orderResult => {

							const {street, district, number} = delivery.address;
							
							delivery.set({order: orderResult});

							const access_token ='hXlnoY101I1bbcY78guRDvNT4T6IfEQxgpm-pqNIQN0';
							const geoapi = 'https://geocoder.ls.hereapi.com/6.2/geocode.json';

							const querystr = `${street}, ${district}, ${number}, Florianópolis, Santa Catarina, BR`;

							return fetch(`${geoapi}?apiKey=${access_token}&searchText=${querystr}`)
								.then(result => {
									if(result.status === 200){
										result.json()
											.then(json => {
												delivery.set({address: {...delivery.address, geo: json.Response.View[0].Result[0].Location.DisplayPosition}});
												saveDocument(delivery)
													.then(result => {
														res.status(201).send(result);
														
													});
											});
									}
								}).catch(next);
						});
				})
				.catch(next);
		})
		.catch(error => next({status: 400, error: 'failed_to_validate', error_description: 'failed to validate your request body'}));

	
});




const formatProducts = (products = []) => new Promise((resolve, reject) => {
	let result = [];

	async.map(products, (product, callback) => {

		const {code, quantity, additionals, owner} = product;

		if(!product || !product.code || !product.quantity)
			return reject({
				code: 400,
				message: {
					error: 'invalid_data',
					error_description: 'your request data is null or invalid, please, check if quantity and code are both okay'
				}
			});


		let value = code.toString();
		let pizza;

		const isPizza = /\*/.test(value);

		if (isPizza){
			pizza = value.substring(0,2);
			const rest = value.substring(3);

			const codeResult = rest.match(/.{1,4}/g);

			const queryA = Flavor.find({code: {$in: codeResult }});
			
			queryA.exec()
				.then(foundFlavors => {
					if (foundFlavors.length !== codeResult.length){
						const notFound = codeResult.filter(code => !foundFlavors.find(flavor => flavor.code === code));
						return reject({code: 400, message: {error: 'file_not_found', error_description: `one of requested flavors(${notFound}) does not exists or it is deleted`}});
					}

					const queryB = Pizza.findOne({code: pizza});
					
					queryB.exec()
						.then(foundPizza => {

							const description = codeResult.map((flavor) => {
								let string = `${flavor} - ${foundFlavors.find(item => item.code === flavor).name}`;

								if(additionals && Array.isArray(additionals) && additionals.length > 0){

									additionals.forEach(additional => {
										let result = '';

										const arr = additional.split(':');

										if(arr[0] == flavor){
											result += '(';

											arr[1].split(';').forEach(add => {
												result += `${add}, `;
											});

											result = result.substring(0, result.length - 2) + ')';
											string = string + ' ' + result;
										}
									});

								}
								return string;
							}
							);


							let price = 0;

							foundFlavors.forEach(flavor => {
								switch(foundPizza.code){
								case '10':
									price += flavor.toObject().small / foundFlavors.length;
									break;
								case '11':
									price += flavor.toObject().medium / foundFlavors.length;
									break;
								case '12':
									price += flavor.toObject().large / foundFlavors.length;
									break;
								default:
									price += flavor.toObject().large / foundFlavors.length;
									break;
								}
							});


							result.push({
								quantity,
								code: friendlyId(12),
								ref: code,
								title: `${pizza} - PIZZA ${foundPizza.name}`,
								description,
								owner: owner || ['GERAL'],
								price,
								subtotal: quantity * price,
								payments: []
							});
							callback(null, result);
						});
				});
		}
	}, () => resolve(result));
});

router.put('/:orderId/:code/remove', (req, res, next) => {
	const {orderId, code} = req.params;

	const query = Order.findOne({orderId});
	return query.exec()
		.then(foundOrder => {

			if(foundOrder.closed) {
				return res.status(400).send({error: 'file_not_found', error_description: 'requested order does not exists or it is deleted/closed'});
			}

			if(code && code !== '' && foundOrder.items.find(item => item.code === code)){
				let qty = 0;

				const sameCode = foundOrder.items.filter(item => item.code === code);
				sameCode.forEach(item => {qty += (item.price/Math.abs(item.price));});

				if(qty === 0){
					return res.status(400).send({error: 'cannot_remove', error_description: 'there are no products with this code to remove'});
				}

				const product = foundOrder.items.find(item => item.code === code);

				if(!product){
					return res.status(400).send({error: 'invalid_params', error_description: 'code and id were expected as url queries'});
				}

				product.price *= -1;
				product.subtotal *= -1;
				product.title = `${product.title} (REMOVIDO)`;

				Order.findByIdAndUpdate(foundOrder.id, {$push: {items: product}}, {new: true}, (pushError, pushedDocument) => {
					if(pushError) {
						
						return res.status(400).send({error: 'error_at_push', error_description: 'update file failed'});
					}

					const document = calculateValues(pushedDocument);
					
					
					return res.status(200).send(document);
				});

			}else {
				
				return res.status(400).send({error: 'invalid_params', error_description: 'code and id were expected as url queries'});
			}
		}).catch(next);
});


router.put('/:orderId/add', (req, res, next) => {
	const {orderId} = req.params;

	const queryA = Order.findOne({orderId});

	queryA.exec().then(foundDocument => {
		if (foundDocument.closed) {
			return next({status: 500, error: 'file_not_found', error_description: 'requested order does not exists or it is deleted/closed'});
		}

		formatProducts(req.body)
			.then(results => {
				let items = [];

				foundDocument.items.forEach(item => {
					items.push(item);
				});

				items = items.concat(results);
				foundDocument.set({items});
				foundDocument.save()
					.then(savedFile => {
						const result = calculateValues(savedFile);

						const queryB = Table.findOne({ orderId });
						
						queryB.exec()
							.then(foundTable => {
								foundTable.set({
									order: result
								});

								saveDocument(foundTable)
									.then(resultTable => {
										res.status(201).send(resultTable);
										
									})
									.catch(next);
							});
					});

			}).catch(next);

	});
});

router.get('/:orderId', async (req, res, next) => {
	const {orderId} = req.params;

	const query = Order.findOne({orderId});
	return query.exec().then(foundOrder => {
		if(!foundOrder || foundOrder.closed)
			return next({status: 404, error: 'order_not_found', error_description: 'requested order was not found'});
		else
			return res.status(200).send(foundOrder);
	}).catch(next);
});

router.get('/:orderId/members', (req, res, next) => {
	const {orderId} = req.params;

	const query = Order.findOne({orderId});
	query.exec()
		.then(foundOrder => {		
			const members = [];

			foundOrder.items.forEach(item => {
				item.owner.forEach(owner => {
					if (!members.find(member => member.toUpperCase() === owner.toUpperCase()))
						members.push(owner.toUpperCase());
				});
			});

			members.sort();

			res.status(200).send(members);
		}).catch(next);
});

router.get('/:orderId/:member', async (req,res,next) => {
	const {orderId, member} = req.params;

	const queryA = Order.findOne({orderId});

	return queryA.exec()
		.then(foundOrder => {
			if(!foundOrder)	
				return next({status: 404, error: 'order_not_found', error_description: 'requested order was not found'});
	
			const items = foundOrder.toObject().items.filter(item => item.owner.includes(member));

			let customer = {}; 
			if(items.length > 0){
				customer = {
					name: member,
					items
				};
			}
			else {
				next({status: 404, error: 'customer_not_found', error_description: 'requested customer is not in this order'});
			}

			const result = calculateCustomerValues(customer);

			return res.status(200).send(result);
		}).catch(next);
});


router.post('/:orderId/:code/pay', async (req, res, next) => {
	const body = req.body;

	const {orderId, code} = req.params;

	const payment = new Payment(body);
	const timestamp = new Date().getTime();

	const query = Order.findOne({orderId});
	
	return query.exec()
		.then(foundOrder => {

			if(!foundOrder ||foundOrder.closed){
				return res.status(400).send({error: 'file_not_found', error_description: 'requested order does not exists or it is deleted/closed'});
			}

			const product = foundOrder.items.find(item => item.code === code);

			const values = calculateProductValues(product);

			if(values.paid >= values.final){
				return next({status: 400, error: 'bill_already_paid', error_description: 'requested order was already paid'});
			}

			if((values.final - values.paid) < payment.value && payment.method !== 'DINHEIRO'){
				return next({status: 400, error: 'invalid_payment', error_description: 'changes are not allowed for payments different than cash'});
			}

			const hash = bcrypt.hashSync(foundOrder.user + timestamp + foundOrder.orderId, '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq');

			payment.set({authorizationDate: timestamp, authorizationId: hash});

			payment.validate()
				.then(() => {
					const tempOrder = foundOrder.toObject();

					tempOrder.items.forEach(item => {
						if(item.code === code){
							item.payments.push(payment);
						}
					});

					foundOrder.set({items: tempOrder.items});

					foundOrder.save()
						.then(newOrder => {
							const result = calculateValues(newOrder);
							res.status(201).send(result);
							

						})
						.catch(next);
				})
				.catch(next);

		});


});
	
router.post('/:orderId/:member/:code/pay', (req, res, next) => {
	const {member, code, orderId} = req.params;
	const {user} = req;

	Order.findOne({orderId}, (findError, foundOrder)=> {
		if(findError || !foundOrder){
			
			next({status: 500, error: 'not_found', error_description: 'requested order was not found or deleted'});
		}

		const item = foundOrder.items.filter(value => (value.code === code && value.owner.includes(member)))[0];

		if(item.paid === item.subtotal){
			
			next({status: 400, error: 'already_paid', error_description: 'requested item was already paid'});
		}


		const issuer = `${user.code} - ${user.name}`;
		const authorizationDate = new Date();
		const authorizationId = bcrypt.hash(foundOrder.user + authorizationDate + foundOrder.orderId, '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq');
		const payment = new Payment({...req.body, authorizationDate, authorizationId, operator: issuer});

			
		saveDocument(payment).then(result => {
			
			res.status(201).send(result);
			
		})
			.catch(error => {
				
				next(error);
			});

	});

});



router.post('/:orderId/:member/pay', (req, res, next) => {
	const body = req.body;

	const {orderId, member} = req.params;

	const payment = new Payment(body);
	const timestamp = new Date().getTime();

	Order.findOne({orderId}, (findError, foundOrder) => {
		if(findError || foundOrder == null || foundOrder.closed){
			
			return res.status(400).send({error: 'file_not_found', error_description: 'requested order does not exists or it is deleted/closed'});
		}

		const items = foundOrder.items.filter(item => item.owner = member);

		const paid = foundOrder.payments.filter(oldPayment => oldPayment.member = member);

		let value = 0;
		items.forEach(item => {
			if(item.price > 0)
				value += item.price;
		});

		let paidValue = 0;
		paid.forEach(oldPayment => {
			paidValue += oldPayment.value;
		});


		const final = value - paidValue;

		if(final <= 0){
			
			return res.status(400).send({error: 'bill_already_paid', error_description: 'requested order was already paid'});
		}

		if(final < payment.value && payment.method !== 'DINHEIRO'){
			
			return res.status(400).send({error: 'invalid_payment', error_description: 'changes are not allowed for payments different than cash'});
		}

		const hash = bcrypt.hashSync(foundOrder.user + timestamp + foundOrder.orderId, '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq');

		payment.set({authorizationDate: timestamp, authorizationId: hash});

		payment.validate()
			.then(() => {
				Order.findOneAndUpdate(
					{
						orderId
					},
					{
						$push: {payments: {member, payment}}
					},
					{
						new: true
					},
					(pushError, newDocument) => {
						if (pushError){
							
							return res.status(400).send({error: 'failed_to_push', error_description: 'couldnt query the database'});
						}

						
						const result = calculateValues(newDocument);
						
						return res.status(200).send(result);

					});
			})
			.catch(error => {
				
				res.status(400).send({error: 'failed_to_validate', error_description: `invalid payment format: ${error.message}`});
			});

	});

});

router.post('/:orderId/checkout', (req, res, next) => {
	const {orderId} = req.params;

	Order.findOne({orderId}, (findError, foundOrder) => {
		if (findError){
			
			return res.status(500).send({error: 'internal_error', error_description: 'something went happened'});
		}

		if (foundOrder == null){
			
			return res.status(400).send({error: 'not_found', error_description: 'requested order was not found'});
		}else{
			if(foundOrder.closed == 'false') {
				let result = calculateValues(foundOrder);

				if(result.remaining > 0){
					
					return res.status(400).send({error: 'bill_still_open', error_description: 'the order needs to be paid before closing'});
				}

				result.closed = true;
				//@TODO: Socket.io callback

				
				res.status(201).send(result);
				

			}else {
				
				return res.status(400).send({error: 'not_found', error_description: 'requested order was not found'});
			}}


	});
});


module.exports = router;
