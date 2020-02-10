const express = require('express');

const router = express.Router();

const Product = require('../../model/productModel');
const {connect, saveDocument}  = require('../utils');


//TODO: fix route
router.get('/', (req, res, next) =>
	connect(res, () => {
		return Product.find(req.query, (err, ans) => {
			if (err)
				return res
					.status(500)
					.send({
						error: 'product_not_found',
						error_description: err.message
					});
			
			return res.status(200).send(ans);
		});
	}));

//TODO: fix route
router.post('/', (req, res, next) => connect(res, () => {
	const product = new Product(req.body);
	saveDocument(product).then(result => {
		
		return res.status(201).send(result);
	})
		.catch(next);
}));

//TODO: fix route
router.post('/add', (req, res) => connect(res, () => {
	Product.findOne({_id: req.query.id}, (findError, findAnswer) => {
		if (findError)
			return res
				.status(500)
				.send({
					error: 'failed_to_fetch',
					error_description: 'could not connect to database'
				});
		if (!findAnswer)
			return res
				.status(400)
				.send({
					error: 'product_not_found',
					error_description: 'please check your request'
				});

		const { qty } = req.query;
		const result = Number.parseInt(findAnswer.qty) + Number.parseInt(qty);
		findAnswer.set({ qty: result });

		saveDocument(findAnswer, res);
	});


}));

//TODO: fix route
router.put('/:id', (req, res) => connect(req, res, () => {
	return Product.findById(req.query.id, (findError, findAnswer) => {
		if (findError)
			res
				.status(400)
				.send({ error: 'document_not_found', error_description: 'product was moved, deleted or it is invalid' });

		findAnswer.set(req.body);

		saveDocument(findAnswer, res);
	});
}));

//TODO: fix route
router.delete('/:id', (req, res) => connect(res, ()=>{
	return Product.findOne(req.params.id, (findError, findAnswer) => {
		if (findError) return res.send(500);
		if (!findAnswer) {
			return res
				.status(400)
				.send({
					error: 'product_not_found',
					error_description: 'product was moved or is invalid'
				});
		}
		findAnswer.remove((removeError, removedDocument) => {
			if (removeError) return res.status(500).send({error: 'failed_to_remove', error_description: 'couldn\'t remove your product'});
			return res.status(200).send(removedDocument);
		});
	});
}));

module.exports = router;
