const express = require('express');

const router = express.Router();

const Product = require('../../model/productModel');
const {connect, saveDocument}  = require('../utils');


router.get('/', async (req, res, next) =>{
	const query = Product.find(req.query);
	
	return query.exec()
		.then(foundProducts => res.status(200).send(foundProducts))
		.catch(next);
});

router.post('/', async (req, res, next) => {
	const product = new Product(req.body);

	return saveDocument(product)
		.then(result => res.status(201).send(result))
		.catch(next);
});

router.put('/:code', async (req, res, next) => {
	const {code} = req.params;

	const query = Product.findOne({code});

	return query.exec()
		.then(foundProduct => {
			if (!foundProduct)
				return res.status(404).send({ error: 'not_found', error_description: 'product was moved, deleted or it is invalid' });

			const saveBody = req.body;

			delete saveBody.code;
			delete saveBody.title;

			foundProduct.set(saveBody);

			return saveDocument(foundProduct)
				.then(savedProduct => res.status(201).send(savedProduct))
				.catch(next);
		});
});


router.delete('/:code', async (req, res, next) => {
	const {code} = req.params;
	const query =  Product.findOneAndDelete({code});
	
	return query.exec()
		.then(foundProduct => {
			if (!foundProduct) {
				return res.status(404).send({error: 'not_found',error_description: 'product was moved or is invalid'});
			}
			return res.status(200).send(foundProduct);
		})
		.catch(next);
});

module.exports = router;
