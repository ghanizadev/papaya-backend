const express = require('express');
const router = express.Router();
const {Pizza} = require('../../model');
const {saveDocument} = require('../utils');


router.get('/', async (req, res, next) => {
	const query = Pizza.find(req.query);
	
	return query.exec()
		.then(foundPizzas => {		
			return res.status(200).send(foundPizzas);
		}).catch(next);
});

router.get('/:code', async (req, res, next) => {
	const {code} = req.params;
	const query = Pizza.findOne({code});
	
	return query.exec()
		.then(foundPizza => {		
			if (!foundPizza) return next({status: 404, error: 'not_found', error_description: 'requested pizza was not found'});
			return res.status(200).send(foundPizza);
		}).catch(next);
});

router.post('/', async (req, res, next) => {
	const pizza = new Pizza(req.body);
	return saveDocument(pizza)
		.then(savedPizza => res.status(201).send(savedPizza))
		.catch(next);
});

router.put('/:code', async (req, res, next) => {
	const {code} = req.params;
	const query = Pizza.findOne({code});
	 
	return query.exec()
		.then(foundPizza => {
			if (!foundPizza) return next({status: 404, error: 'not_found', error_description: 'requested pizza was not found'});

			foundPizza.set(req.body);
			
			return saveDocument(foundPizza)
				.then(savedPizza => res.status(201).send(savedPizza))
				.catch(next);

		}).catch(next);
});

router.delete('/:code', async (req, res, next) => {
	const {code} = req.params;
	const query = Pizza.findOneAndRemove({code});
	
	return query.exec()
		.then(removedPizza => {
			if (!removedPizza) return next({status: 404, error: 'not_found', error_description: 'requested pizza was not found'});
			return res.status(200).send(removedPizza);
		}).catch(next);
});

module.exports = router;
