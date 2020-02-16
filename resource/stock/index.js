const express = require('express');
const router = express.Router();
const {saveDocument} = require('../utils');
const {Stock, Product} = require('../../model');

router.post('/add', async (req, res, next) => {
	try{
		if (!req.body.code || !req.body.quantity)
			return next({status: 400, error: 'invalid_body', error_description: 'missing code or quantity'});

		const {code, quantity, toCome, toGo} = req.body;
		const queryProduct = Product.findOne({code});
		const product = await queryProduct.exec();

		if(!product)
			return next({status: 404, error: 'not_found', error_description: 'requested product was not found, try to register it first'});

		const queryStock = Stock.findOne({code});
		let stockItem = await queryStock.exec();

		if(!stockItem){
			stockItem = new Stock({
				code: product.code,
				profit: (product.price / product.basePrice * 100) - 100,
				quantity,
				toCome,
				toGo
			});

		}else {

			const body = req.body;
			body.quantity = stockItem.quantity + quantity;

			delete body.code;
			stockItem.set(body);
		}

		saveDocument(stockItem)
			.then(savedItem => res.status(201).send(savedItem))
			.catch(next);

	}catch(e){
		next(e);
	}
});

router.get('/', async (req, res, next) => {
	const query = Stock.find(req.body);

	return query.exec()
		.then(async foundItems => {
			const items = foundItems.map(item => item.toObject());
			const queries = [];
			const result = [];

			items.forEach(async item => {
				const query = Product.findOne({code: item.code});
				queries.push(query);
			});

			const productResults = await Promise.all(queries);
			const products = productResults.map(result => result.toObject());

			products.forEach(item => {
				const found = items.find(p => p.code === item.code);
				result.push({...item, ...found});
			});
			res.status(200).send(result);
		})
		.catch(next);
});

router.get('/:code', async (req, res, next) => {
	const {code} = req.params;

	const query = Stock.findOne({code});

	return query.exec()
		.then(foundItem => {
			if(!foundItem)
				return next({status: 404 , error: 'not_found', error_description: 'requested item wwas not found in stock' });

			res.status(200).send(foundItem);
		}).catch(next);
});


module.exports = router;
