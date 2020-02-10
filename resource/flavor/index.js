const express = require('express');
const router = express.Router();
const {Flavor} = require('../../model');
const {saveDocument} = require('../utils');

router.get('/', async (req, res, next) => {
	let regex;

	const q = req.query.q != null;

	if(q)
		regex = new RegExp(req.query.q.toUpperCase());

	let queries = {name: regex};

	if(q){
		if(/(COM:)/.test(req.query.q.toUpperCase())) queries = {description: new RegExp(req.query.q.toUpperCase().replace('COM:', ''))};
		if(/(SEM:)/.test(req.query.q.toUpperCase())) queries = {description: { $not: new RegExp(req.query.q.toUpperCase().replace('SEM:', '')) }};
	}

	const query = Flavor.find(q ? queries : req.query);

	return query.exec()
		.then(foundData => res.status(200).send(foundData))
		.catch(next);

});

router.get('/:id', async (req, res, next) => {
	const query = Flavor.findOne({code: req.params.id});

	return query.exec()
		.then(foundData =>  {
			if (!foundData)
				return next({status: 404, error: 'not_found', error_description: 'requested flavor was not found'});
			res.status(200).send(foundData);
		})
		.catch(next);
});

router.post('/', async (req, res, next) => {
	const flavor = new Flavor(req.body);
	return saveDocument(flavor)
		.then(savedDocument => res.status(201).send(savedDocument))
		.catch(next);
});

router.put('/:id', async (req, res, next) => {

	const query = Flavor.findOne({code: req.params.id});
	return query.exec().then(foundData => {
		if (!foundData)
			return next({status: 404, error: 'not_found', error_description: 'requested flavor was not found'});
		foundData.set(req.body);
			
		saveDocument(foundData)
			.then(savedDocument => res.status(201).send(savedDocument))
			.catch(next);
	});

});

router.delete('/:id', async (req, res, next) => {
	const query = Flavor.findOneAndDelete({code: req.params.id});

	return query.exec()
		.then(deletedDocument => {
			if (!deletedDocument)
				return next({status: 404, error: 'not_found', error_description: 'requested flavor was not found'});

			res.status(200).send(deletedDocument);
		})
		.catch(next);

});

module.exports = router;
